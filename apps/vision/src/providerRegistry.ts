import type { GenerationMode, GenerationTargetId, SkillCompilation } from './skillEngine';

export type ProviderId = 'prompt-only' | 'higgsfield' | 'nvidia' | 'gemini' | 'comfyui';
export type ProviderReadiness = 'ready' | 'prepared' | 'discover-live';

export type ProviderCapability =
  | 'prompt-compile'
  | 'image-generation'
  | 'video-generation'
  | 'image-to-video'
  | 'video-edit'
  | 'semantic-analysis'
  | 'reference-images'
  | 'native-audio'
  | 'local-workflow';

export type ProviderProfile = {
  id: ProviderId;
  label: string;
  readiness: ProviderReadiness;
  capabilities: ProviderCapability[];
  execution: string;
  credentialPolicy: string;
  discovery: string;
};

export type ProviderExecutionPlan = {
  provider: ProviderProfile;
  target: GenerationTargetId;
  mode: GenerationMode;
  executableNow: boolean;
  requiresExplicitSpendConfirmation: boolean;
  discoveryCommand?: string[];
  executionCommand?: string[];
  notes: string[];
};

export const providerRegistry: ProviderProfile[] = [
  {
    id: 'prompt-only',
    label: 'Prompt Only',
    readiness: 'ready',
    capabilities: ['prompt-compile'],
    execution: 'local deterministic compiler',
    credentialPolicy: 'no key required',
    discovery: 'none',
  },
  {
    id: 'higgsfield',
    label: 'Higgsfield',
    readiness: 'discover-live',
    capabilities: ['image-generation', 'video-generation', 'image-to-video', 'video-edit', 'reference-images', 'native-audio'],
    execution: 'official Higgsfield CLI / official SDK; browser automation is fallback-only',
    credentialPolicy: 'use Higgsfield auth/key outside project source; never commit credentials',
    discovery: 'run `higgsfield model list --json` immediately before execution',
  },
  {
    id: 'nvidia',
    label: 'NVIDIA',
    readiness: 'prepared',
    capabilities: ['semantic-analysis', 'image-generation', 'video-generation'],
    execution: 'capability adapter; exact endpoints/models discovered from the connected account',
    credentialPolicy: 'BYOK via secure local/native storage; never place keys in prompt/project files',
    discovery: 'query configured endpoint/model capabilities before enabling a generation action',
  },
  {
    id: 'gemini',
    label: 'Gemini',
    readiness: 'prepared',
    capabilities: ['semantic-analysis', 'image-generation', 'video-generation', 'reference-images'],
    execution: 'capability adapter; availability and billing are model/account dependent',
    credentialPolicy: 'BYOK via secure local/native storage',
    discovery: 'resolve connected model capabilities before enabling generation',
  },
  {
    id: 'comfyui',
    label: 'ComfyUI',
    readiness: 'prepared',
    capabilities: ['local-workflow', 'image-generation', 'video-generation', 'image-to-video', 'video-edit', 'reference-images'],
    execution: 'local ComfyUI workflow JSON + validated node inventory',
    credentialPolicy: 'local endpoint; external model downloads/workflows remain user-controlled',
    discovery: 'inspect workflow input schema and installed nodes before execution',
  },
];

export function providerForTarget(target: GenerationTargetId): ProviderProfile {
  const providerId: ProviderId = target.startsWith('higgsfield-') || target === 'veo'
    ? 'higgsfield'
    : target === 'comfyui'
      ? 'comfyui'
      : target === 'nvidia'
        ? 'nvidia'
        : target === 'gemini'
          ? 'gemini'
          : 'prompt-only';
  return providerRegistry.find((provider) => provider.id === providerId) ?? providerRegistry[0];
}

export function buildProviderExecutionPlan(compilation: SkillCompilation, modelId?: string): ProviderExecutionPlan {
  const provider = providerForTarget(compilation.target.id);
  if (provider.id === 'prompt-only') {
    return {
      provider,
      target: compilation.target.id,
      mode: compilation.mode,
      executableNow: true,
      requiresExplicitSpendConfirmation: false,
      notes: ['Prompt compilation is fully local and does not submit a generation job.'],
    };
  }

  if (provider.id === 'higgsfield') {
    const discoveryCommand = ['higgsfield', 'model', 'list', '--json'];
    const executionCommand = modelId
      ? ['higgsfield', 'generate', 'create', modelId, '--prompt', compilation.providerPrompt, '--wait', '--json']
      : undefined;
    return {
      provider,
      target: compilation.target.id,
      mode: compilation.mode,
      executableNow: Boolean(modelId),
      requiresExplicitSpendConfirmation: true,
      discoveryCommand,
      executionCommand,
      notes: [
        'Use the official CLI/SDK execution surface instead of browser automation whenever possible.',
        modelId ? `Selected model id: ${modelId}. Validate its live schema before submission.` : 'Choose a model id from the live catalog before execution.',
        'Generation may consume provider credits; execution must be an explicit user action.',
      ],
    };
  }

  return {
    provider,
    target: compilation.target.id,
    mode: compilation.mode,
    executableNow: false,
    requiresExplicitSpendConfirmation: true,
    notes: [
      provider.discovery,
      'The UI must keep generation disabled until the adapter has validated credentials, capabilities and a concrete model/workflow.',
    ],
  };
}
