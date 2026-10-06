import { spawnSync } from 'node:child_process';

export type CommandResult = {
  ok: boolean;
  command: string;
  status: number | null;
  stdout: string;
  stderr: string;
};

function run(command: string, args: string[]): CommandResult {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    shell: false,
    env: process.env,
    maxBuffer: 10 * 1024 * 1024,
  });
  return {
    ok: !result.error && result.status === 0,
    command: [command, ...args].join(' '),
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.error ? String(result.error.message) : (result.stderr ?? ''),
  };
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
  let models: unknown = null;
  if (result.ok) {
    try { models = JSON.parse(result.stdout); } catch { models = null; }
  }
  return { ok: result.ok, status, models, raw: result.ok ? '' : result.stderr || result.stdout };
}

export function runHiggsfieldGeneration(input: {
  modelId: string;
  prompt: string;
  confirmSpend: boolean;
  aspectRatio?: string;
}) {
  if (!input.confirmSpend) {
    return {
      ok: false,
      blocked: true,
      reason: 'Generation can consume Higgsfield credits. Re-run with explicit --confirm-spend after reviewing the model and prompt.',
    };
  }
  const status = higgsfieldCliStatus();
  if (!status.installed) return { ok: false, blocked: true, reason: status.error || 'Higgsfield CLI is not installed.' };
  const args = ['generate', 'create', input.modelId, '--prompt', input.prompt];
  if (input.aspectRatio) args.push('--aspect_ratio', input.aspectRatio);
  args.push('--wait', '--json');
  const result = run('higgsfield', args);
  let data: unknown = null;
  if (result.ok) {
    try { data = JSON.parse(result.stdout); } catch { data = result.stdout.trim(); }
  }
  return {
    ok: result.ok,
    blocked: false,
    status: result.status,
    data,
    error: result.ok ? '' : result.stderr || result.stdout,
  };
}
