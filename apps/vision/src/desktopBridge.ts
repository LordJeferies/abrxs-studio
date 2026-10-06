export type HiggsfieldStatus = {
  installed: boolean;
  binary?: string;
  version?: string;
  error?: string;
};

export type HiggsfieldPreflightPlan = {
  schemaIntrospectable?: boolean;
  applied?: Array<{ parameter: string; value: unknown }>;
  omitted?: Array<{ parameter: string; value: unknown; reason?: string }>;
  warnings?: string[];
};

export type HiggsfieldPreflightResult = {
  ok: boolean;
  modelId: string;
  plan?: HiggsfieldPreflightPlan;
  schema?: unknown;
};

export type HiggsfieldGenerationResult = {
  ok: boolean;
  provider?: string;
  modelId?: string;
  preflight?: HiggsfieldPreflightPlan;
  result?: unknown;
  status?: number;
  data?: unknown;
  stdout?: string;
  stderr?: string;
};

type TauriInvoke = <T>(command: string, args?: Record<string, unknown>) => Promise<T>;

declare global {
  interface Window {
    __TAURI__?: {
      core?: {
        invoke?: TauriInvoke;
      };
    };
  }
}

export function desktopInvoke(): TauriInvoke | null {
  return window.__TAURI__?.core?.invoke ?? null;
}

export function isVisionDesktop() {
  return Boolean(desktopInvoke());
}

export async function higgsfieldDesktopStatus() {
  const invoke = desktopInvoke();
  if (!invoke) return { installed: false, error: 'Abrxs Vision desktop bridge is not available in this browser/PWA.' } satisfies HiggsfieldStatus;
  return invoke<HiggsfieldStatus>('vision_higgsfield_status');
}

export async function higgsfieldDesktopModels() {
  const invoke = desktopInvoke();
  if (!invoke) throw new Error('Abrxs Vision desktop bridge is not available.');
  return invoke<unknown>('vision_higgsfield_models');
}

export async function higgsfieldDesktopModelSchema(modelId: string) {
  const invoke = desktopInvoke();
  if (!invoke) throw new Error('Abrxs Vision desktop bridge is not available.');
  return invoke<unknown>('vision_higgsfield_model_get', { modelId });
}

export async function higgsfieldDesktopPreflight(input: {
  modelId: string;
  aspectRatio?: string;
  duration?: number;
  startImage?: string;
  resolution?: string;
}) {
  const invoke = desktopInvoke();
  if (!invoke) throw new Error('Abrxs Vision desktop bridge is not available.');
  return invoke<HiggsfieldPreflightResult>('vision_higgsfield_preflight', {
    modelId: input.modelId,
    aspectRatio: input.aspectRatio || null,
    duration: input.duration || null,
    startImage: input.startImage || null,
    resolution: input.resolution || null,
  });
}

export async function higgsfieldDesktopGenerate(input: {
  modelId: string;
  prompt: string;
  aspectRatio?: string;
  duration?: number;
  startImage?: string;
  resolution?: string;
  confirmSpend: boolean;
}) {
  const invoke = desktopInvoke();
  if (!invoke) throw new Error('Abrxs Vision desktop bridge is not available.');
  return invoke<HiggsfieldGenerationResult>('vision_higgsfield_generate', {
    modelId: input.modelId,
    prompt: input.prompt,
    aspectRatio: input.aspectRatio || null,
    duration: input.duration || null,
    startImage: input.startImage || null,
    resolution: input.resolution || null,
    confirmSpend: input.confirmSpend,
  });
}

export type LiveModelOption = { id: string; name: string };

export function normalizeHiggsfieldModels(payload: unknown): LiveModelOption[] {
  const visited = new Set<unknown>();
  const candidates: unknown[] = [];
  const walk = (value: unknown, depth = 0) => {
    if (depth > 5 || value == null || visited.has(value)) return;
    if (typeof value === 'object') visited.add(value);
    if (Array.isArray(value)) {
      value.forEach((item) => { candidates.push(item); walk(item, depth + 1); });
      return;
    }
    if (typeof value === 'object') Object.values(value as Record<string, unknown>).forEach((item) => walk(item, depth + 1));
  };
  walk(payload);
  const seen = new Set<string>();
  const result: LiveModelOption[] = [];
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue;
    const item = candidate as Record<string, unknown>;
    const id = String(item.job_set_type ?? item.id ?? item.slug ?? item.model_id ?? '').trim();
    if (!id || seen.has(id) || id.length > 100) continue;
    const name = String(item.name ?? item.display_name ?? item.title ?? id).trim();
    seen.add(id);
    result.push({ id, name });
  }
  return result.sort((a, b) => a.name.localeCompare(b.name));
}
