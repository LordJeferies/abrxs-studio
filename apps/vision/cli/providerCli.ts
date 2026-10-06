import { spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

export type CommandResult = {
  ok: boolean;
  command: string;
  status: number | null;
  stdout: string;
  stderr: string;
};

export type HiggsfieldCliPreflight = {
  schemaIntrospectable: boolean;
  applied: Array<{ parameter: string; value: string | number }>;
  omitted: Array<{ parameter: string; value: string | number; reason: string }>;
  warnings: string[];
};

function run(command: string, args: string[]): CommandResult {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    shell: false,
    env: process.env,
    maxBuffer: 10 * 1024 * 1024,
  });
  const redacted = args.map((arg, index) => args[index - 1] === '--prompt' ? '<prompt>' : arg);
  return {
    ok: !result.error && result.status === 0,
    command: [command, ...redacted].join(' '),
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.error ? String(result.error.message) : (result.stderr ?? ''),
  };
}

function parsedJson(result: CommandResult): unknown {
  if (!result.ok || !result.stdout.trim()) return null;
  try { return JSON.parse(result.stdout); } catch { return null; }
}

function normalizedToken(value: string) {
  return value.trim().replace(/^-+/, '').replaceAll('-', '_').toLowerCase();
}

function schemaMentions(value: unknown, parameter: string, depth = 0): boolean {
  if (depth > 8 || value == null) return false;
  const target = normalizedToken(parameter);
  if (typeof value === 'string') {
    const normalized = normalizedToken(value);
    if (normalized === target || normalized.includes(`--${target}`)) return true;
    return normalized.split(/[^a-z0-9_]+/).some((token) => token === target);
  }
  if (Array.isArray(value)) return value.some((item) => schemaMentions(item, parameter, depth + 1));
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).some(([key, child]) => normalizedToken(key) === target || schemaMentions(child, parameter, depth + 1));
  }
  return false;
}

function schemaIsIntrospectable(schema: unknown) {
  return ['prompt', 'duration', 'aspect_ratio', 'resolution', 'image', 'start_image'].some((parameter) => schemaMentions(schema, parameter));
}

function resolveMediaInput(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error('Media input is empty.');
  const pathLike = trimmed.startsWith('~/') || trimmed.startsWith('./') || trimmed.startsWith('../') || trimmed.startsWith('/') || trimmed.includes('/Users/');
  if (!pathLike) return trimmed;
  const expanded = trimmed.startsWith('~/') ? resolve(homedir(), trimmed.slice(2)) : resolve(trimmed);
  if (!existsSync(expanded) || !statSync(expanded).isFile()) throw new Error(`Local media file does not exist: ${expanded}`);
  return expanded;
}

export function higgsfieldCliStatus() {
  const version = run('higgsfield', ['version']);
  return {
    installed: version.ok,
    version: version.stdout.trim(),
    error: version.ok ? '' : version.stderr.trim(),
  };
}

export function listHiggsfieldModels() {
  const status = higgsfieldCliStatus();
  if (!status.installed) return { ok: false, status, models: null, raw: '' };
  const result = run('higgsfield', ['model', 'list', '--json']);
  return { ok: result.ok, status, models: parsedJson(result), raw: result.ok ? '' : result.stderr || result.stdout };
}

export function getHiggsfieldModel(modelId: string) {
  if (!modelId.trim()) return { ok: false, schema: null, raw: 'A model id is required.' };
  const result = run('higgsfield', ['model', 'get', modelId.trim(), '--json']);
  return { ok: result.ok, schema: parsedJson(result), raw: result.ok ? '' : result.stderr || result.stdout };
}

export function preflightHiggsfieldGeneration(input: {
  modelId: string;
  aspectRatio?: string;
  duration?: number;
  startImage?: string;
  resolution?: string;
}) {
  const model = getHiggsfieldModel(input.modelId);
  if (!model.ok || model.schema == null) {
    return { ok: false as const, blocked: true as const, reason: model.raw || 'Could not inspect the live model schema.', schema: model.schema, args: [] as string[], plan: null as HiggsfieldCliPreflight | null };
  }

  const introspectable = schemaIsIntrospectable(model.schema);
  const args: string[] = [];
  const applied: HiggsfieldCliPreflight['applied'] = [];
  const omitted: HiggsfieldCliPreflight['omitted'] = [];
  const warnings: string[] = [];

  const optional = (parameter: 'aspect_ratio' | 'duration' | 'resolution', flagName: string, raw: string | number | undefined) => {
    if (raw == null || String(raw).trim() === '') return;
    if (introspectable && schemaMentions(model.schema, parameter)) {
      args.push(flagName, String(raw));
      applied.push({ parameter, value: raw });
    } else {
      omitted.push({ parameter, value: raw, reason: introspectable ? 'not present in live model schema' : 'live schema could not be interpreted safely' });
      warnings.push(`Vision will not send ${parameter}; it was not confirmed by the live model schema.`);
    }
  };

  optional('aspect_ratio', '--aspect_ratio', input.aspectRatio);
  optional('duration', '--duration', input.duration);
  optional('resolution', '--resolution', input.resolution);

  if (input.startImage?.trim()) {
    if (!introspectable) return { ok: false as const, blocked: true as const, reason: 'The live model schema could not be interpreted safely, so Vision will not submit a media input blindly.', schema: model.schema, args, plan: { schemaIntrospectable: false, applied, omitted, warnings } };
    const media = resolveMediaInput(input.startImage);
    const mediaFlag = schemaMentions(model.schema, 'start_image') ? '--start-image' : schemaMentions(model.schema, 'image') ? '--image' : '';
    if (!mediaFlag) return { ok: false as const, blocked: true as const, reason: 'The selected model does not advertise start_image or image input.', schema: model.schema, args, plan: { schemaIntrospectable: true, applied, omitted, warnings } };
    args.push(mediaFlag, media);
    applied.push({ parameter: mediaFlag.replace(/^-+/, ''), value: media });
  }

  return { ok: true as const, blocked: false as const, schema: model.schema, args, plan: { schemaIntrospectable: introspectable, applied, omitted, warnings } };
}

export function runHiggsfieldGeneration(input: {
  modelId: string;
  prompt: string;
  confirmSpend: boolean;
  aspectRatio?: string;
  duration?: number;
  startImage?: string;
  resolution?: string;
}) {
  if (!input.confirmSpend) {
    return {
      ok: false,
      blocked: true,
      reason: 'Generation can consume Higgsfield credits. Re-run with explicit --confirm-spend after reviewing the model, live schema and prompt.',
    };
  }
  const status = higgsfieldCliStatus();
  if (!status.installed) return { ok: false, blocked: true, reason: status.error || 'Higgsfield CLI is not installed.' };
  const preflight = preflightHiggsfieldGeneration(input);
  if (!preflight.ok) return { ok: false, blocked: true, reason: preflight.reason, preflight: preflight.plan, schema: preflight.schema };

  const args = ['generate', 'create', input.modelId, '--prompt', input.prompt, ...preflight.args, '--wait', '--json'];
  const result = run('higgsfield', args);
  const data = result.ok ? (parsedJson(result) ?? result.stdout.trim()) : null;
  return {
    ok: result.ok,
    blocked: false,
    status: result.status,
    data,
    preflight: preflight.plan,
    error: result.ok ? '' : result.stderr || result.stdout,
  };
}
