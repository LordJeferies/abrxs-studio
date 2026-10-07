import type { AssistantProviderId, VisionAssistantEnvelope } from './assistantCore';

export type CloudGatewayMessage = { role: 'user' | 'assistant'; content: string };

export type CloudAssistantRequest = {
  provider: AssistantProviderId;
  model?: string;
  systemPrompt: string;
  messages: CloudGatewayMessage[];
};

export type CloudGenerationRequest = {
  provider: string;
  target: string;
  mode: string;
  model?: string;
  prompt: string;
  generationSpec?: unknown;
  references?: Array<{ role: string; url?: string; name?: string }>;
};

function normalizeBase(url: string) {
  return url.trim().replace(/\/+$/, '');
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let payload: unknown = text;
  try { payload = text ? JSON.parse(text) : {}; } catch { /* keep text */ }
  if (!response.ok) {
    const detail = typeof payload === 'object' && payload && 'error' in payload
      ? String((payload as { error?: unknown }).error)
      : text || response.statusText;
    throw new Error(`Vision Cloud Gateway ${response.status}: ${detail}`);
  }
  return payload as T;
}

export async function runCloudAssistant(baseUrl: string, request: CloudAssistantRequest): Promise<VisionAssistantEnvelope | { content?: string; response?: string; raw?: unknown }> {
  const base = normalizeBase(baseUrl);
  if (!base.startsWith('https://') && !/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(base)) {
    throw new Error('Cloud Gateway must use HTTPS (localhost is allowed for development).');
  }
  return postJson(`${base}/assistant`, request);
}

export async function submitCloudGeneration(baseUrl: string, request: CloudGenerationRequest) {
  const base = normalizeBase(baseUrl);
  return postJson<{ ok: boolean; jobId: string; status: string }>(`${base}/generate`, request);
}

export async function getCloudGenerationJob(baseUrl: string, jobId: string) {
  const base = normalizeBase(baseUrl);
  const response = await fetch(`${base}/jobs/${encodeURIComponent(jobId)}`);
  if (!response.ok) throw new Error(`Vision Cloud Gateway ${response.status}: ${await response.text()}`);
  return await response.json() as { jobId: string; status: string; outputUrl?: string; error?: string };
}
