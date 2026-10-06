import { compilePrompt, defaults, type DirectorState } from './promptEngine';

export type GenerationMode =
  | 'text-to-image'
  | 'image-to-image'
  | 'text-to-video'
  | 'image-to-video'
  | 'video-edit';

export type GenerationIntent =
  | 'cinematic'
  | 'social-hook'
  | 'podcast-visual'
  | 'product'
  | 'education'
  | 'documentary'
  | 'dialogue'
  | 'faceless'
  | 'carousel';

export type GenerationTargetId =
  | 'generic-production'
  | 'higgsfield-cinema'
  | 'higgsfield-seedance'
  | 'higgsfield-kling'
  | 'veo'
  | 'comfyui'
  | 'nvidia'
  | 'gemini';

export type ReferenceRole =
  | 'identity'
  | 'look'
  | 'composition'
  | 'wardrobe'
  | 'location'
  | 'motion'
  | 'product'
  | 'logo'
  | 'palette'
  | 'text-layout'
  | 'first-frame'
  | 'last-frame';

export type VisualReference = {
  name: string;
  role: ReferenceRole | string;
  note?: string;
};

export type ContinuityPack = {
  identity: string;
  wardrobe: string;
  location: string;
  light: string;
  palette: string;
  geometry: string;
  invariants: string[];
};

export type TimelineBeat = {
  start: number;
  end: number;
  purpose: string;
  visual: string;
  camera: string;
  audio: string;
};

export type SkillQualityGate = {
  id: string;
  label: string;
  passed: boolean;
  weight: number;
  detail: string;
};

export type SkillQualityAudit = {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  gates: SkillQualityGate[];
  warnings: string[];
};

export type TargetProfile = {
  id: GenerationTargetId;
  label: string;
  provider: 'prompt-only' | 'higgsfield' | 'comfyui' | 'nvidia' | 'gemini';
  formula: string;
  strengths: string[];
  modes: GenerationMode[];
  shortWordTarget?: number;
  hardCharLimit?: number;
  requiresLiveCapabilityDiscovery: boolean;
  provenance: string[];
};

export type GenerationRequest = {
  director: DirectorState;
  mode: GenerationMode;
  target: GenerationTargetId;
  intent: GenerationIntent;
  duration?: number;
  references?: VisualReference[];
  continuity?: Partial<ContinuityPack>;
  startImageProvided?: boolean;
  literalText?: string;
  audioDirection?: string;
  modelHint?: string;
};

export type SkillCompilation = {
  target: TargetProfile;
  mode: GenerationMode;
  intent: GenerationIntent;
  providerPrompt: string;
  canonicalProductionSpec: string;
  negativePrompt: string;
  continuity: ContinuityPack;
  timeline: TimelineBeat[];
  references: Array<VisualReference & { role: ReferenceRole }>;
  quality: SkillQualityAudit;
  executionHints: string[];
  provenance: string[];
};

export type RouteRequirements = {
  mode: GenerationMode;
  intent?: GenerationIntent;
  localOnly?: boolean;
  identityCritical?: boolean;
  nativeAudio?: boolean;
  videoEdit?: boolean;
  longTake?: boolean;
  multiShot?: boolean;
  costSensitive?: boolean;
};

export type RouteRecommendation = {
  primary: GenerationTargetId;
  alternatives: GenerationTargetId[];
  rationale: string[];
  mustDiscoverLiveCapabilities: boolean;
};

export const referenceRoles: ReferenceRole[] = [
  'identity',
  'look',
  'composition',
  'wardrobe',
  'location',
  'motion',
  'product',
  'logo',
  'palette',
  'text-layout',
  'first-frame',
  'last-frame',
];

const referenceRoleAliases: Record<string, ReferenceRole> = {
  'look / reference': 'look',
  look: 'look',
  identity: 'identity',
  face: 'identity',
  character: 'identity',
  composition: 'composition',
  framing: 'composition',
  wardrobe: 'wardrobe',
  outfit: 'wardrobe',
  location: 'location',
  environment: 'location',
  motion: 'motion',
  movement: 'motion',
  product: 'product',
  logo: 'logo',
  palette: 'palette',
  color: 'palette',
  'text-layout': 'text-layout',
  typography: 'text-layout',
  'first-frame': 'first-frame',
  start: 'first-frame',
  'last-frame': 'last-frame',
  end: 'last-frame',
};

export function normalizeReferenceRole(value: string): ReferenceRole {
  const normalized = value.trim().toLowerCase();
  return referenceRoleAliases[normalized] ?? 'look';
}

export function referenceRoleLabel(role: ReferenceRole, language: 'en' | 'es') {
  const labels: Record<ReferenceRole, [string, string]> = {
    identity: ['Identity / character', 'Identidad / personaje'],
    look: ['Look / visual reference', 'Look / referencia visual'],
    composition: ['Composition', 'Composición'],
    wardrobe: ['Wardrobe', 'Vestuario'],
    location: ['Location', 'Locación'],
    motion: ['Motion', 'Movimiento'],
    product: ['Product', 'Producto'],
    logo: ['Logo', 'Logo'],
    palette: ['Palette', 'Paleta'],
    'text-layout': ['Text / layout', 'Texto / layout'],
    'first-frame': ['First frame', 'Primer fotograma'],
    'last-frame': ['Last frame', 'Último fotograma'],
  };
  return language === 'es' ? labels[role][1] : labels[role][0];
}

export const targetProfiles: TargetProfile[] = [
  {
    id: 'generic-production',
    label: 'ABRAXAS Production Spec',
    provider: 'prompt-only',
    formula: 'role → function → subject/action → scene → composition → camera → light → materials → brand → continuity → evidence → output → negatives',
    strengths: ['provider-neutral planning', 'human review', 'portable handoff'],
    modes: ['text-to-image', 'image-to-image', 'text-to-video', 'image-to-video', 'video-edit'],
    requiresLiveCapabilityDiscovery: false,
    provenance: ['abraxas-quality', 'grok-production-bible'],
  },
  {
    id: 'higgsfield-cinema',
    label: 'Higgsfield Cinema Studio',
    provider: 'higgsfield',
    formula: 'MCSLA compressed for Cinema Studio: camera + subject + look + action with locked continuity',
    strengths: ['cinematic stills', 'named camera language', 'visual continuity'],
    modes: ['text-to-image', 'image-to-image', 'text-to-video', 'image-to-video'],
    hardCharLimit: 512,
    requiresLiveCapabilityDiscovery: true,
    provenance: ['oside-mcsla', 'oside-image-shots', 'higgsfield-official'],
  },
  {
    id: 'higgsfield-seedance',
    label: 'Higgsfield · Seedance',
    provider: 'higgsfield',
    formula: 'MCSLA + temporal beats + reference semantics; I2V describes motion delta only',
    strengths: ['multi-reference video', 'temporal direction', 'short-form storytelling'],
    modes: ['text-to-video', 'image-to-video', 'video-edit'],
    shortWordTarget: 200,
    requiresLiveCapabilityDiscovery: true,
    provenance: ['oside-mcsla', 'oside-seedance', 'redium-timeline', 'lanshu-model-grammar', 'higgsfield-official'],
  },
  {
    id: 'higgsfield-kling',
    label: 'Higgsfield · Kling',
    provider: 'higgsfield',
    formula: 'subject + motion + camera + scene + look + continuity, with concise I2V delta when a first frame exists',
    strengths: ['image-to-video', 'controlled camera motion', 'character action'],
    modes: ['text-to-video', 'image-to-video', 'video-edit'],
    shortWordTarget: 180,
    requiresLiveCapabilityDiscovery: true,
    provenance: ['oside-model-selection', 'lanshu-kling-grammar', 'higgsfield-official'],
  },
  {
    id: 'veo',
    label: 'Veo-style 8-element prompt',
    provider: 'higgsfield',
    formula: 'subject + action + scene + style + camera + composition + ambience/light + audio',
    strengths: ['native audio direction', 'cinematic text-to-video', 'sound-aware beats'],
    modes: ['text-to-video', 'image-to-video'],
    shortWordTarget: 220,
    requiresLiveCapabilityDiscovery: true,
    provenance: ['lanshu-veo-grammar', 'higgsfield-official'],
  },
  {
    id: 'comfyui',
    label: 'ComfyUI Workflow Pack',
    provider: 'comfyui',
    formula: 'positive prompt + negative prompt + continuity pack + workflow parameters; workflow owns model-specific nodes',
    strengths: ['local execution', 'workflow control', 'reproducibility'],
    modes: ['text-to-image', 'image-to-image', 'text-to-video', 'image-to-video', 'video-edit'],
    requiresLiveCapabilityDiscovery: true,
    provenance: ['vibe-workflow', 'kupkaprod-concepts'],
  },
  {
    id: 'nvidia',
    label: 'NVIDIA Capability Adapter',
    provider: 'nvidia',
    formula: 'canonical production spec translated only after live endpoint/model capability discovery',
    strengths: ['provider routing', 'multimodal capability when available'],
    modes: ['text-to-image', 'image-to-image', 'text-to-video', 'image-to-video'],
    requiresLiveCapabilityDiscovery: true,
    provenance: ['abraxas-provider-contract'],
  },
  {
    id: 'gemini',
    label: 'Gemini Capability Adapter',
    provider: 'gemini',
    formula: 'canonical production spec translated after model capability discovery; useful for semantic reference analysis',
    strengths: ['semantic analysis', 'multimodal planning'],
    modes: ['text-to-image', 'image-to-image', 'text-to-video', 'image-to-video'],
    requiresLiveCapabilityDiscovery: true,
    provenance: ['abraxas-provider-contract'],
  },
];

export const generationIntents: GenerationIntent[] = [
  'cinematic',
  'social-hook',
  'podcast-visual',
  'product',
  'education',
  'documentary',
  'dialogue',
  'faceless',
  'carousel',
];

function detectedLanguage(state: DirectorState): 'en' | 'es' {
  if (state.outputLanguage === 'en' || state.outputLanguage === 'es') return state.outputLanguage;
  return /[áéíóúñ¿¡]|\b(el|la|los|las|que|para|con|sin|cliente|decisión|imagen|escena)\b/i.test(state.idea) ? 'es' : 'en';
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function clampedDuration(value: number | undefined) {
  if (!Number.isFinite(value)) return 8;
  return Math.max(2, Math.min(60, Number(value)));
}

function words(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function fitSegments(segments: string[], limit: number) {
  let output = '';
  for (const segment of segments.map((item) => item.trim()).filter(Boolean)) {
    const candidate = output ? `${output} ${segment}` : segment;
    if (candidate.length > limit) break;
    output = candidate;
  }
  return output || segments[0].slice(0, Math.max(0, limit - 1)).trimEnd();
}

function timelineTemplate(intent: GenerationIntent, duration: number, language: 'en' | 'es'): TimelineBeat[] {
  const d = clampedDuration(duration);
  const copy = language === 'es'
    ? {
        hook: 'interrumpir el patrón y declarar la tensión visual',
        context: 'orientar rápidamente al espectador sin sobreexplicar',
        develop: 'hacer visible el mecanismo, contraste o cambio',
        payoff: 'resolver el beat con una consecuencia visual clara',
        breathe: 'dejar un breve espacio visual para que la idea respire',
        evidence: 'mostrar evidencia, detalle o gesto que sostenga el argumento',
        audioHook: 'golpe, silencio o textura sonora sincronizada con el primer cambio',
        audioBed: 'ambiente coherente; música secundaria a la voz o acción',
        audioPayoff: 'acentuar el payoff sin sobrecargarlo',
      }
    : {
        hook: 'interrupt the pattern and declare the visual tension',
        context: 'orient the viewer quickly without over-explaining',
        develop: 'make the mechanism, contrast or change visible',
        payoff: 'resolve the beat with a clear visual consequence',
        breathe: 'leave a short visual breath so the idea can land',
        evidence: 'show evidence, detail or gesture that supports the claim',
        audioHook: 'impact, silence or sound texture synchronized with the first change',
        audioBed: 'coherent ambience; music stays secondary to voice or action',
        audioPayoff: 'accent the payoff without overloading it',
      };

  const ratios = intent === 'social-hook'
    ? [0, 0.2, 0.46, 0.72, 1]
    : intent === 'podcast-visual'
      ? [0, 0.16, 0.38, 0.78, 1]
      : [0, 0.22, 0.5, 0.78, 1];

  const purposes = intent === 'podcast-visual'
    ? [copy.hook, copy.context, copy.evidence, copy.payoff]
    : [copy.hook, copy.context, copy.develop, copy.payoff];

  const cameras = intent === 'documentary'
    ? ['restrained observation', 'handheld follow', 'detail insert', 'controlled release']
    : ['decisive opening frame', 'controlled push or track', 'specific detail / perspective change', 'stable payoff frame'];

  return purposes.map((purpose, index) => ({
    start: round(d * ratios[index]),
    end: round(d * ratios[index + 1]),
    purpose,
    visual: index === 0 ? copy.hook : index === 3 ? copy.payoff : index === 2 ? copy.evidence : copy.context,
    camera: cameras[index],
    audio: index === 0 ? copy.audioHook : index === 3 ? copy.audioPayoff : copy.audioBed,
  }));
}

function buildContinuity(state: DirectorState, overrides?: Partial<ContinuityPack>): ContinuityPack {
  const base: ContinuityPack = {
    identity: state.subject || defaults.subject,
    wardrobe: 'preserve established wardrobe and accessories; do not introduce an unexplained costume change',
    location: state.environment || defaults.environment,
    light: `preserve motivated light direction and source logic: ${state.lighting}`,
    palette: state.palette,
    geometry: 'preserve screen direction, object positions and spatial relationships unless the shot explicitly changes them',
    invariants: [
      'subject identity and facial proportions',
      'wardrobe and hero props',
      'location geography',
      'light direction and time-of-day logic',
      'brand palette and photographic treatment',
    ],
  };
  return {
    ...base,
    ...overrides,
    invariants: overrides?.invariants?.length ? overrides.invariants : base.invariants,
  };
}

function normalizedReferences(references: VisualReference[] | undefined) {
  return (references ?? []).map((reference) => ({
    ...reference,
    role: normalizeReferenceRole(reference.role),
  }));
}

function referenceBlock(references: Array<VisualReference & { role: ReferenceRole }>) {
  if (!references.length) return 'none supplied';
  return references.map((reference, index) => `@ref${index + 1}=${reference.role}:${reference.name}${reference.note ? ` (${reference.note})` : ''}`).join('; ');
}

function timelineBlock(timeline: TimelineBeat[]) {
  return timeline.map((beat) => `${beat.start.toFixed(1)}-${beat.end.toFixed(1)}s ${beat.purpose}; camera=${beat.camera}; audio=${beat.audio}`).join(' | ');
}

function compactNegative(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function compileHiggsfieldCinema(request: GenerationRequest, continuity: ContinuityPack, refs: ReturnType<typeof normalizedReferences>) {
  const state = request.director;
  const segments = [
    `${state.framing}, ${state.angle}, ${state.focal}, ${state.movement}.`,
    `${state.subject}; ${state.action}; ${state.environment}.`,
    `${state.lighting}.`,
    `${state.palette}; ${state.style}.`,
    `${state.visualFunction ?? defaults.visualFunction}.`,
    `Continuity: ${continuity.identity}; ${continuity.location}; ${continuity.light}.`,
    refs.length ? `References: ${referenceBlock(refs)}.` : '',
    `Avoid: ${compactNegative(compilePrompt(state).negativePrompt)}.`,
  ];
  return fitSegments(segments, 512);
}

function compileHiggsfieldSeedance(request: GenerationRequest, continuity: ContinuityPack, refs: ReturnType<typeof normalizedReferences>, timeline: TimelineBeat[]) {
  const state = request.director;
  const i2v = request.mode === 'image-to-video';
  if (i2v) {
    return [
      'IMAGE-TO-VIDEO MOTION DELTA ONLY',
      `CAMERA: ${state.movement}; ${state.angle}; preserve the established framing unless the move requires a deliberate change.`,
      `SUBJECT MOTION: ${state.action}.`,
      `ENVIRONMENT MOTION: only physically motivated secondary motion; do not redesign the first frame.`,
      `TIMING: ${timelineBlock(timeline)}.`,
      `AUDIO: ${request.audioDirection ?? 'synchronize ambience and impact cues to visible beats; do not overpower dialogue'}.`,
      `INVARIANTS: ${continuity.invariants.join('; ')}.`,
      `REFERENCES: ${referenceBlock(refs)}.`,
      `NEGATIVE: no identity drift, no extra limbs, no object morphing, no camera teleport, no unexplained wardrobe or location change.`,
    ].join('\n');
  }
  return [
    `MODEL/WORKSPACE INTENT: ${request.modelHint ?? 'resolve the live Higgsfield video model that best matches this job before execution'}.`,
    `CAMERA: ${state.framing}, ${state.angle}, ${state.focal}; ${state.movement}.`,
    `SUBJECT: ${state.subject}.`,
    `LOOK: ${state.environment}; ${state.lighting}; ${state.palette}; ${state.style}.`,
    `ACTION: ${state.action}; visual purpose: ${state.visualFunction ?? defaults.visualFunction}.`,
    `TIMING: ${timelineBlock(timeline)}.`,
    `AUDIO: ${request.audioDirection ?? 'coherent ambience and beat-synchronous accents; preserve intelligible dialogue when present'}.`,
    `CONTINUITY: ${continuity.invariants.join('; ')}.`,
    `REFERENCES: ${referenceBlock(refs)}.`,
    `NEGATIVE: no identity drift, no duplicated people, no extra limbs, no rubber motion, no geometry mutation, no unmotivated camera jump, no generic AI gloss.`,
  ].join('\n');
}

function compileKling(request: GenerationRequest, continuity: ContinuityPack, refs: ReturnType<typeof normalizedReferences>, timeline: TimelineBeat[]) {
  const state = request.director;
  const i2v = request.mode === 'image-to-video';
  const lines = i2v
    ? [
        `MOTION: ${state.action}; only animate changes from the supplied first frame.`,
        `CAMERA: ${state.movement}, ${state.angle}; keep the initial composition stable unless the move explicitly changes it.`,
        `TIMING: ${timelineBlock(timeline)}.`,
      ]
    : [
        `SUBJECT: ${state.subject}.`,
        `MOTION: ${state.action}.`,
        `CAMERA: ${state.framing}, ${state.angle}, ${state.focal}, ${state.movement}.`,
        `SCENE: ${state.environment}; ${state.lighting}.`,
        `LOOK: ${state.palette}; ${state.style}.`,
        `TIMING: ${timelineBlock(timeline)}.`,
      ];
  return [...lines,
    `CONTINUITY: ${continuity.invariants.join('; ')}.`,
    `REFERENCES: ${referenceBlock(refs)}.`,
    'NEGATIVE: no identity drift, extra limbs, foot sliding, object morphing, jumpy camera path or unexplained spatial reset.',
  ].join('\n');
}

function compileVeo(request: GenerationRequest, continuity: ContinuityPack, refs: ReturnType<typeof normalizedReferences>, timeline: TimelineBeat[]) {
  const state = request.director;
  return [
    `SUBJECT: ${state.subject}.`,
    `ACTION: ${state.action}.`,
    `SCENE / CONTEXT: ${state.environment}.`,
    `STYLE: ${state.style}; ${state.palette}.`,
    `CAMERA: ${state.framing}, ${state.angle}, ${state.focal}, ${state.movement}.`,
    `COMPOSITION: ${state.visualFunction ?? defaults.visualFunction}; protect ${state.textZones ?? defaults.textZones}.`,
    `AMBIENCE / LIGHT: ${state.lighting}; ${state.atmosphere}.`,
    `AUDIO: ${request.audioDirection ?? 'natural ambience plus restrained synchronized accents; dialogue remains primary if present'}.`,
    `TIMELINE: ${timelineBlock(timeline)}.`,
    `CONTINUITY: ${continuity.invariants.join('; ')}.`,
    `REFERENCES: ${referenceBlock(refs)}.`,
  ].join('\n');
}

function compileComfy(request: GenerationRequest, continuity: ContinuityPack, refs: ReturnType<typeof normalizedReferences>, timeline: TimelineBeat[]) {
  const base = compilePrompt(request.director);
  return [
    'POSITIVE PROMPT',
    base.imagePrompt,
    request.mode.includes('video') ? `TEMPORAL PLAN: ${timelineBlock(timeline)}` : '',
    `REFERENCE MAP: ${referenceBlock(refs)}`,
    `CONTINUITY PACK: ${continuity.invariants.join('; ')}`,
    'NEGATIVE PROMPT',
    base.negativePrompt,
    'WORKFLOW NOTE: model, sampler, scheduler, dimensions, seed and conditioning nodes belong to the selected ComfyUI workflow and must be validated before execution.',
  ].filter(Boolean).join('\n\n');
}

function compileGeneric(request: GenerationRequest, continuity: ContinuityPack, refs: ReturnType<typeof normalizedReferences>, timeline: TimelineBeat[]) {
  const base = compilePrompt(request.director);
  return [
    base.productionSpec,
    `REFERENCE ROLES: ${referenceBlock(refs)}`,
    `CONTINUITY PACK: ${continuity.invariants.join('; ')}`,
    request.mode.includes('video') ? `TEMPORAL PLAN: ${timelineBlock(timeline)}` : '',
  ].filter(Boolean).join('\n\n');
}

function buildQuality(
  request: GenerationRequest,
  profile: TargetProfile,
  providerPrompt: string,
  continuity: ContinuityPack,
  refs: ReturnType<typeof normalizedReferences>,
  timeline: TimelineBeat[],
): SkillQualityAudit {
  const state = request.director;
  const movementParts = state.movement.split(/\+| then |, then |;/i).map((item) => item.trim()).filter(Boolean);
  const hasStaticConflict = movementParts.length > 1 && movementParts.some((item) => /static/i.test(item));
  const identityRef = refs.some((ref) => ref.role === 'identity');
  const firstFrame = request.startImageProvided || refs.some((ref) => ref.role === 'first-frame' || ref.role === 'identity' || ref.role === 'look');
  const video = request.mode.includes('video');
  const timelineValid = !video || (timeline.length > 0 && timeline[0].start === 0 && Math.abs(timeline[timeline.length - 1].end - clampedDuration(request.duration)) < 0.11);
  const charLimitPass = !profile.hardCharLimit || providerPrompt.length <= profile.hardCharLimit;
  const wordTargetPass = !profile.shortWordTarget || words(providerPrompt) <= Math.round(profile.shortWordTarget * 1.8);
  const i2vInputPass = request.mode !== 'image-to-video' || firstFrame;
  const refRolesPass = refs.every((ref) => referenceRoles.includes(ref.role));
  const baseQuality = compilePrompt(state).quality.score;
  const identityCritical = request.mode.includes('video') && state.subject.trim().length > 3;
  const identityPass = !identityCritical || identityRef || continuity.identity.trim().length > 3;
  const gates: SkillQualityGate[] = [
    { id: 'canonical', label: 'canonical production specification', passed: baseQuality >= 80, weight: 18, detail: `ABRAXAS base quality ${baseQuality}/100` },
    { id: 'camera-feasibility', label: 'camera feasibility', passed: movementParts.length <= 2 && !hasStaticConflict, weight: 12, detail: movementParts.length <= 2 && !hasStaticConflict ? 'camera path is constrained' : 'too many simultaneous/contradictory camera moves' },
    { id: 'temporal', label: 'temporal coherence', passed: timelineValid, weight: 12, detail: video ? 'timeline covers the requested duration without a missing end beat' : 'still image: temporal plan not required' },
    { id: 'continuity', label: 'continuity lock', passed: continuity.invariants.length >= 4 && identityPass, weight: 12, detail: 'identity, wardrobe, geography, light and palette are carried as invariants' },
    { id: 'references', label: 'reference semantics', passed: refRolesPass, weight: 8, detail: refs.length ? `${refs.length} reference(s) have explicit roles` : 'no references supplied' },
    { id: 'i2v-input', label: 'I2V first-frame contract', passed: i2vInputPass, weight: 10, detail: i2vInputPass ? 'input contract satisfied' : 'image-to-video needs a first-frame/reference image before execution' },
    { id: 'provider-length', label: 'provider prompt budget', passed: charLimitPass && wordTargetPass, weight: 10, detail: profile.hardCharLimit ? `${providerPrompt.length}/${profile.hardCharLimit} chars` : profile.shortWordTarget ? `${words(providerPrompt)} words; target ≈${profile.shortWordTarget}` : 'no hard provider cap applied' },
    { id: 'physics', label: 'physical plausibility constraints', passed: /identity drift|geometry|physic|morph|limb|continuity/i.test(providerPrompt), weight: 8, detail: 'prompt carries anti-mutation / continuity constraints' },
    { id: 'evidence', label: 'evidence integrity', passed: Boolean(state.evidenceConstraints?.trim()), weight: 5, detail: state.evidenceConstraints?.trim() ? 'fabricated evidence is explicitly constrained' : 'add evidence constraints' },
    { id: 'purpose', label: 'visual function', passed: Boolean(state.visualFunction?.trim()), weight: 5, detail: state.visualFunction?.trim() ? 'visual purpose is explicit' : 'declare what the visual must explain or make the viewer feel' },
  ];
  const score = gates.reduce((total, gate) => total + (gate.passed ? gate.weight : 0), 0);
  const grade: SkillQualityAudit['grade'] = score >= 92 ? 'A' : score >= 82 ? 'B' : score >= 68 ? 'C' : 'D';
  const warnings: string[] = [];
  if (profile.requiresLiveCapabilityDiscovery) warnings.push('Resolve the live provider/model capability catalog before execution; do not assume every target exposes the same controls today.');
  if (!charLimitPass) warnings.push(`Prompt exceeds the ${profile.hardCharLimit}-character target and must be compressed before submission.`);
  if (!wordTargetPass) warnings.push('Prompt is likely over-detailed for this target; prefer fewer explicit decisions over repeated adjectives.');
  if (!i2vInputPass) warnings.push('Image-to-video requires an actual first frame/reference. The prompt compiler will not invent one silently.');
  if (request.mode === 'image-to-video' && /scene|environment|palette|style/i.test(providerPrompt) && profile.id === 'higgsfield-seedance') warnings.push('I2V should emphasize motion/change. Do not use the motion prompt to redesign what is already visible in the first frame.');
  if (request.literalText?.trim()) warnings.push('Literal text inside generated images is provider/model-sensitive. Prefer a separate text layer when exact wording matters.');
  if (movementParts.length > 2) warnings.push('More than two camera moves are competing in one shot; sequence them by time or split the shot.');
  if (hasStaticConflict) warnings.push('Static camera conflicts with another simultaneous camera movement.');
  return { score, grade, gates, warnings };
}

export function compileSkillPrompt(request: GenerationRequest): SkillCompilation {
  const state = { ...defaults, ...request.director };
  const normalizedRequest = { ...request, director: state };
  const profile = targetProfiles.find((item) => item.id === request.target) ?? targetProfiles[0];
  const refs = normalizedReferences(request.references);
  const continuity = buildContinuity(state, request.continuity);
  const language = detectedLanguage(state);
  const timeline = request.mode.includes('video') ? timelineTemplate(request.intent, clampedDuration(request.duration), language) : [];

  let providerPrompt: string;
  switch (profile.id) {
    case 'higgsfield-cinema':
      providerPrompt = compileHiggsfieldCinema(normalizedRequest, continuity, refs);
      break;
    case 'higgsfield-seedance':
      providerPrompt = compileHiggsfieldSeedance(normalizedRequest, continuity, refs, timeline);
      break;
    case 'higgsfield-kling':
      providerPrompt = compileKling(normalizedRequest, continuity, refs, timeline);
      break;
    case 'veo':
      providerPrompt = compileVeo(normalizedRequest, continuity, refs, timeline);
      break;
    case 'comfyui':
      providerPrompt = compileComfy(normalizedRequest, continuity, refs, timeline);
      break;
    case 'nvidia':
    case 'gemini':
    case 'generic-production':
    default:
      providerPrompt = compileGeneric(normalizedRequest, continuity, refs, timeline);
      break;
  }

  const canonical = compilePrompt(state);
  const quality = buildQuality(normalizedRequest, profile, providerPrompt, continuity, refs, timeline);
  const executionHints = [
    'Use one job per shot/scene and preserve the continuity pack across approved takes.',
    'Generate a storyboard/keyframe before expensive video generation when composition or identity is critical.',
    'Keep the strongest successful take; change only the diagnosed failure on the next iteration.',
    profile.requiresLiveCapabilityDiscovery ? 'Discover the live provider/model schema immediately before submission.' : 'No provider discovery required for prompt-only output.',
  ];

  return {
    target: profile,
    mode: request.mode,
    intent: request.intent,
    providerPrompt,
    canonicalProductionSpec: canonical.productionSpec,
    negativePrompt: canonical.negativePrompt,
    continuity,
    timeline,
    references: refs,
    quality,
    executionHints,
    provenance: Array.from(new Set(['abraxas-quality', ...profile.provenance, 'magnific-space-workflow', 'vibe-workflow', 'grok-readiness-gates'])),
  };
}

export function recommendGenerationRoute(requirements: RouteRequirements): RouteRecommendation {
  const rationale: string[] = [];
  if (requirements.localOnly) {
    rationale.push('Local-only requirement routes to ComfyUI; the selected workflow still determines the actual model capabilities.');
    return { primary: 'comfyui', alternatives: ['generic-production'], rationale, mustDiscoverLiveCapabilities: true };
  }
  if (requirements.mode === 'text-to-image' || requirements.mode === 'image-to-image') {
    rationale.push('Image work benefits from a still-image/cinema grammar before model execution.');
    if (requirements.identityCritical) rationale.push('Identity-critical work should attach an identity/reference role and preserve the continuity pack across variants.');
    return { primary: 'higgsfield-cinema', alternatives: ['generic-production', 'comfyui'], rationale, mustDiscoverLiveCapabilities: true };
  }
  if (requirements.videoEdit || requirements.mode === 'video-edit') {
    rationale.push('Video edit needs a live edit-capable model lane; do not assume a generation-only model can edit footage.');
    return { primary: 'higgsfield-kling', alternatives: ['higgsfield-seedance', 'comfyui'], rationale, mustDiscoverLiveCapabilities: true };
  }
  if (requirements.nativeAudio) {
    rationale.push('Native audio is a first-class requirement, so route toward an audio-aware video lane and verify it in the live catalog.');
    return { primary: 'veo', alternatives: ['higgsfield-seedance', 'generic-production'], rationale, mustDiscoverLiveCapabilities: true };
  }
  if (requirements.intent === 'social-hook' || requirements.intent === 'podcast-visual' || requirements.multiShot) {
    rationale.push('This job benefits from explicit temporal beats, reference semantics and short-form hook/payoff structure.');
    return { primary: 'higgsfield-seedance', alternatives: ['higgsfield-kling', 'veo'], rationale, mustDiscoverLiveCapabilities: true };
  }
  if (requirements.costSensitive) rationale.push('Cost sensitivity should be resolved against the live model catalog rather than hard-coded pricing.');
  if (requirements.longTake) rationale.push('Long-take limits change by model/version; resolve live duration support before execution.');
  rationale.push('Default video route favors a structured temporal prompt and then validates the actual model capabilities at execution time.');
  return { primary: 'higgsfield-seedance', alternatives: ['higgsfield-kling', 'veo'], rationale, mustDiscoverLiveCapabilities: true };
}
