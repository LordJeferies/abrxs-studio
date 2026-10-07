export type CustomProviderProtocol = 'openai-compatible' | 'anthropic-compatible' | 'generic-rest';
export type CustomProviderCapability = 'assistant' | 'multimodal-analysis' | 'image-generation' | 'video-generation';

export type CustomProvider = {
  id: string;
  name: string;
  protocol: CustomProviderProtocol;
  baseUrl: string;
  model: string;
  capabilities: CustomProviderCapability[];
  modelsPath?: string;
  chatPath?: string;
  generatePath?: string;
  createdAt: string;
};

const STORE_KEY = 'abrxsVisionCustomProvidersV1';
const SESSION_KEY_PREFIX = 'abrxsVisionCustomProviderKey:';

function safeId(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || `provider-${Date.now()}`;
}

export function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
}

export function loadCustomProviders(): CustomProvider[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || '[]') as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is CustomProvider => Boolean(item && typeof item === 'object' && 'id' in item && 'name' in item && 'baseUrl' in item)) : [];
  } catch { return []; }
}

export function saveCustomProviders(value: CustomProvider[]) {
  localStorage.setItem(STORE_KEY, JSON.stringify(value));
}

export function createCustomProvider(input: Omit<CustomProvider, 'id' | 'createdAt'> & { id?: string }): CustomProvider {
  return {
    ...input,
    id: safeId(input.id || input.name),
    baseUrl: normalizeBaseUrl(input.baseUrl),
    createdAt: new Date().toISOString(),
  };
}

export function setSessionProviderKey(providerId: string, key: string) {
  const trimmed = key.trim();
  if (!trimmed) sessionStorage.removeItem(`${SESSION_KEY_PREFIX}${providerId}`);
  else sessionStorage.setItem(`${SESSION_KEY_PREFIX}${providerId}`, trimmed);
}

export function getSessionProviderKey(providerId: string) {
  return sessionStorage.getItem(`${SESSION_KEY_PREFIX}${providerId}`) || '';
}

export function clearSessionProviderKey(providerId: string) {
  sessionStorage.removeItem(`${SESSION_KEY_PREFIX}${providerId}`);
}

function secureUrl(base: string, path: string) {
  const normalized = normalizeBaseUrl(base);
  if (!/^https:\/\//i.test(normalized) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalized)) {
    throw new Error('Custom providers must use HTTPS. localhost/127.0.0.1 are allowed for local development.');
  }
  return `${normalized}/${path.replace(/^\/+/, '')}`;
}

async function parseResponse(response: Response) {
  const text = await response.text();
  let payload: unknown = text;
  try { payload = text ? JSON.parse(text) : {}; } catch { /* keep text */ }
  if (!response.ok) {
    const detail = typeof payload === 'object' && payload && 'error' in payload ? JSON.stringify((payload as { error?: unknown }).error) : text || response.statusText;
    throw new Error(`Provider HTTP ${response.status}: ${detail}`);
  }
  return payload;
}

export async function testCustomProvider(provider: CustomProvider) {
  const key = getSessionProviderKey(provider.id);
  const path = provider.modelsPath || (provider.protocol === 'openai-compatible' ? '/v1/models' : '');
  if (!path) return { ok: true, mode: 'configuration-only', note: 'No models endpoint configured; provider definition is syntactically valid.' };
  const headers: Record<string,string> = { accept: 'application/json' };
  if (key) {
    if (provider.protocol === 'anthropic-compatible') { headers['x-api-key'] = key; headers['anthropic-version'] = '2023-06-01'; }
    else headers.authorization = `Bearer ${key}`;
  }
  const response = await fetch(secureUrl(provider.baseUrl, path), { headers });
  const payload = await parseResponse(response);
  return { ok: true, mode: 'live', payload };
}

export type CustomChatMessage = { role: 'user' | 'assistant'; content: string };

export async function runCustomAssistant(provider: CustomProvider, input: { systemPrompt: string; messages: CustomChatMessage[] }) {
  if (!provider.capabilities.includes('assistant')) throw new Error(`${provider.name} is not configured as an assistant provider.`);
  const key = getSessionProviderKey(provider.id);
  if (!key) throw new Error(`Paste an API key for ${provider.name} in Settings. Custom keys are session-only by default.`);
  if (provider.protocol === 'generic-rest') throw new Error('Generic REST assistant execution requires an explicit request/response adapter. Use OpenAI-compatible or Anthropic-compatible for direct chat.');

  if (provider.protocol === 'openai-compatible') {
    const path = provider.chatPath || '/v1/chat/completions';
    const response = await fetch(secureUrl(provider.baseUrl, path), {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: provider.model,
        messages: [{ role: 'system', content: input.systemPrompt }, ...input.messages],
        temperature: 0.2,
        stream: false,
      }),
    });
    const payload = await parseResponse(response) as any;
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw new Error('Custom OpenAI-compatible provider returned no assistant content.');
    return content;
  }

  const path = provider.chatPath || '/v1/messages';
  const response = await fetch(secureUrl(provider.baseUrl, path), {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: provider.model,
      system: input.systemPrompt,
      messages: input.messages,
      max_tokens: 1800,
      temperature: 0.2,
    }),
  });
  const payload = await parseResponse(response) as any;
  const content = Array.isArray(payload?.content) ? payload.content.map((item: any) => item?.text || '').join('') : '';
  if (!content.trim()) throw new Error('Custom Anthropic-compatible provider returned no assistant content.');
  return content;
}

export function capabilityLabel(capability: CustomProviderCapability) {
  if (capability === 'assistant') return 'LLM / Assistant';
  if (capability === 'multimodal-analysis') return 'Multimodal analysis';
  if (capability === 'image-generation') return 'Image generation';
  return 'Video generation';
}
