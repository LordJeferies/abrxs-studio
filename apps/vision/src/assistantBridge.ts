import { parseAssistantEnvelope, type AssistantProviderId, type VisionAssistantAction, type VisionAssistantEnvelope } from './assistantCore';
import { runCloudAssistant } from './cloudGateway';
import { defaults, type DirectorState } from './promptEngine';
import { PROFESSIONAL_BRIEF_EVENT, PROFESSIONAL_BRIEF_STORAGE_KEY } from './ProfessionalPromptLab';
import { professionalBriefDefaults, type ProfessionalPromptBrief } from './professionalPromptEngine';

const DIRECTOR_KEY = 'abrxsVisionDirectorV1';
const NVIDIA_MODEL_KEY = 'abrxsVisionAssistantNvidiaModelV1';
const NVIDIA_ENDPOINT_KEY = 'abrxsVisionAssistantNvidiaEndpointV1';
const GEMINI_MODEL_KEY = 'abrxsVisionAssistantGeminiModelV1';
const COMFY_ENDPOINT_KEY = 'abrxsVisionComfyEndpointV1';
const CLOUD_GATEWAY_KEY = 'abrxsVisionCloudGatewayV1';

export type AssistantPreferences = {
  nvidiaModel: string;
  nvidiaEndpoint: string;
  geminiModel: string;
  comfyEndpoint: string;
  cloudGateway: string;
};

export type AssistantMessage = { role: 'user' | 'assistant'; content: string };

type TauriInvoke = (command: string, args?: Record<string, unknown>) => Promise<unknown>;
type TauriWindow = Window & { __TAURI__?: { core?: { invoke?: TauriInvoke } } };

export function isVisionDesktop() {
  return Boolean((window as TauriWindow).__TAURI__?.core?.invoke);
}

async function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  const fn = (window as TauriWindow).__TAURI__?.core?.invoke;
  if (!fn) throw new Error('Esta operación requiere Abrxs Vision Desktop.');
  return await fn(command, args) as T;
}

export function loadAssistantPreferences(): AssistantPreferences {
  return {
    nvidiaModel: localStorage.getItem(NVIDIA_MODEL_KEY) || 'meta/muse-glimmer-30b',
    nvidiaEndpoint: localStorage.getItem(NVIDIA_ENDPOINT_KEY) || 'https://integrate.api.nvidia.com/v1/chat/completions',
    geminiModel: localStorage.getItem(GEMINI_MODEL_KEY) || '',
    comfyEndpoint: localStorage.getItem(COMFY_ENDPOINT_KEY) || 'http://127.0.0.1:8188',
    cloudGateway: localStorage.getItem(CLOUD_GATEWAY_KEY) || '',
  };
}

export function saveAssistantPreferences(value: AssistantPreferences) {
  localStorage.setItem(NVIDIA_MODEL_KEY, value.nvidiaModel.trim());
  localStorage.setItem(NVIDIA_ENDPOINT_KEY, value.nvidiaEndpoint.trim());
  localStorage.setItem(GEMINI_MODEL_KEY, value.geminiModel.trim());
  localStorage.setItem(COMFY_ENDPOINT_KEY, value.comfyEndpoint.trim());
  localStorage.setItem(CLOUD_GATEWAY_KEY, value.cloudGateway.trim());
}

export async function secretStatus(provider: string) {
  if (!isVisionDesktop()) return { configured: false, desktop: false };
  return invoke<{ configured: boolean; desktop: boolean }>('vision_secret_status', { provider });
}

export async function setSecret(provider: string, secret: string) {
  if (!secret.trim()) throw new Error('La API key está vacía.');
  return invoke<{ ok: boolean; configured: boolean }>('vision_secret_set', { provider, secret: secret.trim() });
}

export async function deleteSecret(provider: string) {
  return invoke<{ ok: boolean; configured: boolean }>('vision_secret_delete', { provider });
}

export async function geminiCliStatus() {
  if (!isVisionDesktop()) return { installed: false, desktop: false, error: 'Desktop required' };
  return invoke<{ installed: boolean; desktop?: boolean; version?: string; binary?: string; error?: string }>('vision_gemini_status');
}

function parseCloudResult(result: VisionAssistantEnvelope | { content?: string; response?: string; raw?: unknown }): VisionAssistantEnvelope {
  if ('message' in result && Array.isArray(result.actions) && Array.isArray(result.references)) {
    return result as VisionAssistantEnvelope;
  }
  const payload = result as { content?: string; response?: string; raw?: unknown };
  return parseAssistantEnvelope(payload.content || payload.response || JSON.stringify(payload.raw ?? payload));
}

export async function runVisionAssistant(input: {
  provider: AssistantProviderId;
  systemPrompt: string;
  messages: AssistantMessage[];
  preferences: AssistantPreferences;
}): Promise<VisionAssistantEnvelope> {
  if (!isVisionDesktop()) {
    if (!input.preferences.cloudGateway.trim()) {
      throw new Error('Configura Vision Cloud Gateway en Settings para usar Copilot desde la PWA.');
    }
    const model = input.provider === 'nvidia' ? input.preferences.nvidiaModel : input.preferences.geminiModel;
    const result = await runCloudAssistant(input.preferences.cloudGateway, {
      provider: input.provider,
      model: model || undefined,
      systemPrompt: input.systemPrompt,
      messages: input.messages,
    });
    return parseCloudResult(result);
  }

  if (input.provider === 'nvidia') {
    const result = await invoke<{ content?: string; raw?: unknown }>('vision_nvidia_chat', {
      model: input.preferences.nvidiaModel,
      endpoint: input.preferences.nvidiaEndpoint,
      systemPrompt: input.systemPrompt,
      messages: input.messages,
    });
    return parseAssistantEnvelope(result.content || JSON.stringify(result.raw ?? result));
  }
  const last = input.messages[input.messages.length - 1]?.content ?? '';
  const history = input.messages.slice(0, -1).map((item) => `${item.role.toUpperCase()}: ${item.content}`).join('\n\n');
  const prompt = `${input.systemPrompt}\n\nCONVERSATION CONTEXT:\n${history || '(none)'}\n\nUSER:\n${last}`;
  const result = await invoke<{ response?: string; raw?: unknown }>('vision_gemini_chat', {
    prompt,
    model: input.preferences.geminiModel || null,
  });
  return parseAssistantEnvelope(result.response || JSON.stringify(result.raw ?? result));
}

export function currentAssistantContext() {
  let director: DirectorState = defaults;
  let brief: ProfessionalPromptBrief = professionalBriefDefaults;
  try { director = { ...defaults, ...JSON.parse(localStorage.getItem(DIRECTOR_KEY) || '{}') as DirectorState }; } catch { /* use defaults */ }
  try { brief = { ...professionalBriefDefaults, ...JSON.parse(localStorage.getItem(PROFESSIONAL_BRIEF_STORAGE_KEY) || '{}') as ProfessionalPromptBrief }; } catch { /* use defaults */ }
  return { director, brief };
}

export function applyAssistantAction(action: VisionAssistantAction) {
  if (action.type === 'set-director') {
    const current = currentAssistantContext().director;
    const next = { ...current, [action.field]: action.value } as DirectorState;
    localStorage.setItem(DIRECTOR_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('abrxs-vision-director-patch', { detail: { field: action.field, value: action.value } }));
    return;
  }
  const current = currentAssistantContext().brief;
  const next = { ...current, [action.field]: action.value } as ProfessionalPromptBrief;
  localStorage.setItem(PROFESSIONAL_BRIEF_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(PROFESSIONAL_BRIEF_EVENT, { detail: next }));
}
