import { compilePrompt, defaults, type DirectorState } from './promptEngine';
import {
  compileSkillPrompt,
  targetProfiles,
  type GenerationIntent,
  type GenerationMode,
  type GenerationTargetId,
  type VisualReference,
} from './skillEngine';

export type OutputType =
  | 'hero-image'
  | 'storyboard-frame'
  | 'cinematic-video'
  | 'xroll'
  | 'carousel-frame'
  | 'product-shot'
  | 'reference-analysis';

export type NegativePolicy = 'separate-native' | 'positive-constraints' | 'workflow-owned' | 'discover-live';

export type ProfessionalPromptBrief = {
  objective: string;
  mustHave: string;
  doNotWant: string;
  outputType: OutputType;
  outputRequirements: string;
  literalText: string;
  motionIntent: string;
  audioIntent: string;
  referenceInstructions: string;
  continuityPriority: string;
};

export type ProfessionalPromptRequest = {
  director: DirectorState;
  target: GenerationTargetId;
  mode: GenerationMode;
  intent: GenerationIntent;
  duration?: number;
  references?: VisualReference[];
  startImageProvided?: boolean;
  brief?: Partial<ProfessionalPromptBrief>;
};

export type ProfessionalPromptGate = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
  weight: number;
};

export type ProfessionalPromptPacket = {
  positivePrompt: string;
  negativePrompt: string;
  targetPrompt: string;
  productionSpec: string;
  outputContract: string;
  targetPolicy: {
    negativePolicy: NegativePolicy;
    promptRegime: string;
    notes: string[];
  };
  quality: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D';
    gates: ProfessionalPromptGate[];
    warnings: string[];
  };
  timeline: ReturnType<typeof compileSkillPrompt>['timeline'];
  continuity: ReturnType<typeof compileSkillPrompt>['continuity'];
  references: ReturnType<typeof compileSkillPrompt>['references'];
  provenance: string[];
};

export const professionalBriefDefaults: ProfessionalPromptBrief = {
  objective: 'Make the visual communicate one clear idea through observable action, composition and evidence rather than decoration.',
  mustHave: 'one dominant subject or mechanism; motivated camera and light; physically credible materials; readable focal hierarchy',
  doNotWant: 'generic AI gloss; arbitrary neon; duplicate subjects; anatomy drift; fake evidence; random text; meaningless UI; decorative clutter',
  outputType: 'hero-image',
  outputRequirements: 'production-ready result, clean composition, coherent anatomy/geometry, usable safe zones, suitable for downstream editing',
  literalText: '',
  motionIntent: 'one primary action with at most two secondary motions; camera movement must have a narrative reason',
  audioIntent: 'natural ambience and restrained synchronized accents; dialogue remains intelligible when present',
  referenceInstructions: 'treat every reference according to its assigned role; never let a look reference overwrite identity or first-frame geometry',
  continuityPriority: 'identity, wardrobe, hero props, location geography, light direction, screen direction and palette remain stable across related outputs',
};

const targetPolicy: Record<GenerationTargetId, { negativePolicy: NegativePolicy; promptRegime: string; notes: string[] }> = {
  'generic-production': {
    negativePolicy: 'separate-native',
    promptRegime: 'ABRAXAS production specification',
    notes: ['Keep positive intent and exclusions separate so a downstream adapter can map them safely.'],
  },
  'higgsfield-cinema': {
    negativePolicy: 'positive-constraints',
    promptRegime: 'compressed MCSLA / Cinema Studio budget',
    notes: ['Cinema Studio prompt budget is tight; keep subject, action and camera concrete.', 'Translate exclusions into stability/composition constraints instead of relying on a negative-prompt field.'],
  },
  'higgsfield-seedance': {
    negativePolicy: 'positive-constraints',
    promptRegime: 'MCSLA + temporal beats; I2V motion-delta only',
    notes: ['For I2V, describe only motion/change and camera behavior from the supplied first frame.', 'One primary action per shot; use explicit beats only when timing matters.', 'Generic emotion should be decomposed into visible behavior.'],
  },
  'higgsfield-kling': {
    negativePolicy: 'discover-live',
    promptRegime: 'concise motion + camera + continuity',
    notes: ['Negative-field support varies by model/version; discover the live schema before execution.', 'Preserve initial composition in I2V unless the requested move deliberately changes it.'],
  },
  veo: {
    negativePolicy: 'discover-live',
    promptRegime: 'subject + action + scene + camera + ambience + audio',
    notes: ['Treat audio as part of the direction when the selected live model supports it.', 'Do not assume a negative field exists until capability discovery.'],
  },
  comfyui: {
    negativePolicy: 'workflow-owned',
    promptRegime: 'positive + negative + workflow parameters',
    notes: ['The selected workflow owns sampler, scheduler, seed, dimensions and conditioning support.'],
  },
  nvidia: {
    negativePolicy: 'discover-live',
    promptRegime: 'capability-driven adapter',
    notes: ['Map the canonical brief only after the live endpoint/model schema is known.'],
  },
  gemini: {
    negativePolicy: 'discover-live',
    promptRegime: 'capability-driven adapter',
    notes: ['Use model discovery/declared capability before assuming generation controls.'],
  },
};

const SLOP = /\b(beautiful|stunning|epic|amazing|masterpiece|ultra[- ]?detailed|best quality|award[- ]?winning|cinematic masterpiece|premium cinematic|bonito|impresionante|épico|obra maestra)\b/gi;
const GENERIC_EMOTION = /\b(sad|angry|surprised|scared|thoughtful|in love|tense|triste|enojad[oa]|sorprendid[oa]|asustad[oa]|pensativ[oa]|enamorado|tenso)\b/i;

function mergeBrief(brief?: Partial<ProfessionalPromptBrief>): ProfessionalPromptBrief {
  return { ...professionalBriefDefaults, ...(brief ?? {}) };
}

function cleanList(value: string) {
  return value
    .split(/[;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .join('; ');
}

function countPrimaryActions(action: string) {
  const verbs = action.split(/\b(?:and then|then|while|after that|y luego|luego|mientras|después)\b|[;]+/i).map((item) => item.trim()).filter(Boolean);
  return Math.max(1, verbs.length);
}

function positiveStabilityConstraints(brief: ProfessionalPromptBrief) {
  return [
    'single intended subject/hero object unless multiple subjects are explicitly requested',
    'anatomically coherent face, hands and body throughout the shot',
    'stable object geometry and material response',
    'established wardrobe, props and location only',
    'continuous motivated camera path without teleportation',
    'consistent light direction, exposure logic and color treatment',
    brief.continuityPriority,
    brief.doNotWant ? `user exclusion intent is satisfied by keeping the composition free of unrelated additions or failure modes: ${cleanList(brief.doNotWant)}` : '',
  ].filter(Boolean).join('; ');
}

function outputContract(brief: ProfessionalPromptBrief, director: DirectorState) {
  const text = brief.literalText.trim()
    ? `Literal text requested: “${brief.literalText.trim()}”. Treat exact typography as model-sensitive; if exact spelling cannot be guaranteed, reserve a clean text-safe zone and deliver typography as a separate layer.`
    : 'No literal in-image text is required; prefer clean image regions over pseudo-text.';
  return [
    `OUTPUT TYPE: ${brief.outputType}`,
    `CANVAS: ${director.aspect}`,
    `REQUIREMENTS: ${brief.outputRequirements}`,
    text,
    `DOWNSTREAM: result must remain useful for Vision/Dresser compositing, review and versioned export.`,
  ].join('\n');
}

function stripNegativeLines(prompt: string) {
  return prompt
    .split('\n')
    .filter((line) => !/^\s*(NEGATIVE|NEGATIVES|AVOID)\s*:/i.test(line))
    .join('\n')
    .trim();
}

function compileTargetPrompt(basePrompt: string, negativePrompt: string, brief: ProfessionalPromptBrief, target: GenerationTargetId) {
  const policy = targetPolicy[target];
  const output = outputContract(brief, defaults);
  if (policy.negativePolicy === 'positive-constraints') {
    return [
      stripNegativeLines(basePrompt),
      `STABILITY / EXCLUSION CONSTRAINTS: ${positiveStabilityConstraints(brief)}`,
      `OUTPUT CONTRACT: ${brief.outputType}; ${brief.outputRequirements}`,
    ].filter(Boolean).join('\n');
  }
  if (policy.negativePolicy === 'workflow-owned') {
    return [
      basePrompt,
      'USER NEGATIVE / DO NOT WANT',
      negativePrompt,
      'OUTPUT CONTRACT',
      output,
    ].join('\n\n');
  }
  if (policy.negativePolicy === 'discover-live') {
    return [
      basePrompt,
      `EXCLUSION BRIEF FOR ADAPTER: ${cleanList(brief.doNotWant)}`,
      `OUTPUT CONTRACT: ${brief.outputType}; ${brief.outputRequirements}`,
      'ADAPTER RULE: map exclusions/negative fields only when the live model schema explicitly supports them; otherwise convert them to positive stability/composition constraints.',
    ].filter(Boolean).join('\n');
  }
  return [basePrompt, `NEGATIVE / DO NOT WANT: ${negativePrompt}`, `OUTPUT CONTRACT: ${brief.outputType}; ${brief.outputRequirements}`].join('\n');
}

function professionalAudit(request: ProfessionalPromptRequest, brief: ProfessionalPromptBrief, targetPrompt: string, baseScore: number) {
  const director = { ...defaults, ...request.director };
  const actionCount = countPrimaryActions(director.action);
  const slop = `${director.idea} ${director.style}`.match(SLOP) ?? [];
  const genericEmotion = GENERIC_EMOTION.test(`${director.idea} ${director.action} ${director.atmosphere}`);
  const video = request.mode.includes('video');
  const i2v = request.mode === 'image-to-video';
  const firstFrame = Boolean(request.startImageProvided) || (request.references ?? []).some((reference) => String(reference.role).toLowerCase() === 'first-frame');
  const gates: ProfessionalPromptGate[] = [
    { id: 'canonical', label: 'Canonical production spec', passed: baseScore >= 80, detail: `Base ABRAXAS skill quality ${baseScore}/100`, weight: 18 },
    { id: 'want', label: 'What I want', passed: brief.objective.trim().length >= 16 && brief.mustHave.trim().length >= 12, detail: 'Objective and must-have decisions are explicit.', weight: 12 },
    { id: 'do-not', label: 'What I do not want', passed: brief.doNotWant.trim().length >= 8, detail: 'Failure modes/exclusions are explicit and target policy controls how they are translated.', weight: 10 },
    { id: 'output', label: 'Output contract', passed: brief.outputRequirements.trim().length >= 12, detail: `${brief.outputType} · ${director.aspect}`, weight: 12 },
    { id: 'action-load', label: 'Action load', passed: !video || actionCount <= 3, detail: `${actionCount} action phase(s); keep one primary action with at most two secondary motions.`, weight: 10 },
    { id: 'anti-slop', label: 'Anti-slop language', passed: slop.length <= 1, detail: slop.length ? `Replace vague terms: ${Array.from(new Set(slop.map((item) => item.toLowerCase()))).join(', ')}` : 'Direction is expressed as observable decisions.', weight: 10 },
    { id: 'emotion', label: 'Performance specificity', passed: !genericEmotion, detail: genericEmotion ? 'A generic emotion is present; decompose it into eyes, breath, posture, hands and facial behavior.' : 'No unresolved generic-emotion label detected.', weight: 8 },
    { id: 'i2v', label: 'I2V first-frame contract', passed: !i2v || firstFrame, detail: i2v ? (firstFrame ? 'First frame supplied/tagged.' : 'I2V needs an actual first frame.') : 'Not an I2V request.', weight: 8 },
    { id: 'literal-text', label: 'Literal text risk', passed: !brief.literalText.trim() || brief.outputType === 'carousel-frame' || request.mode.includes('image'), detail: brief.literalText.trim() ? 'Exact text is isolated as a model-sensitive requirement.' : 'No exact in-image text requested.', weight: 5 },
    { id: 'target-policy', label: 'Provider policy', passed: !/^\s*NEGATIVE\s*:/mi.test(targetPrompt) || targetPolicy[request.target].negativePolicy !== 'positive-constraints', detail: `${targetPolicy[request.target].promptRegime} · negatives=${targetPolicy[request.target].negativePolicy}`, weight: 7 },
  ];
  const score = gates.reduce((total, gate) => total + (gate.passed ? gate.weight : 0), 0);
  const warnings: string[] = [];
  if (slop.length) warnings.push('Replace vague quality adjectives with concrete camera, light, material, behavior or composition decisions.');
  if (genericEmotion) warnings.push('Generic emotion detected. Describe physical performance instead of leaving the model to choose a random emotional realization.');
  if (video && actionCount > 3) warnings.push('The shot carries too many action phases. Split the scene or reduce it to one primary action plus one or two secondary motions.');
  if (i2v && !firstFrame) warnings.push('Do not execute I2V until an actual first frame is supplied.');
  if (brief.literalText.trim()) warnings.push('Exact text inside generated imagery is provider-sensitive. Prefer a separate text layer when spelling must be exact.');
  if (targetPolicy[request.target].negativePolicy === 'discover-live') warnings.push('Negative/exclusion support must be mapped from the live provider schema before execution.');
  const grade: 'A' | 'B' | 'C' | 'D' = score >= 92 ? 'A' : score >= 82 ? 'B' : score >= 68 ? 'C' : 'D';
  return { score, grade, gates, warnings };
}

export function compileProfessionalPrompt(request: ProfessionalPromptRequest): ProfessionalPromptPacket {
  const director = { ...defaults, ...request.director };
  const brief = mergeBrief(request.brief);
  const base = compilePrompt(director);
  const skill = compileSkillPrompt({
    director,
    target: request.target,
    mode: request.mode,
    intent: request.intent,
    duration: request.duration,
    references: request.references,
    startImageProvided: request.startImageProvided,
    literalText: brief.literalText,
    audioDirection: brief.audioIntent,
  });

  const positivePrompt = [
    'ABRXS PROFESSIONAL POSITIVE PROMPT',
    `OBJECTIVE: ${brief.objective}`,
    `MUST HAVE: ${cleanList(brief.mustHave)}`,
    `SUBJECT: ${director.subject}`,
    `ACTION: ${director.action}`,
    `ENVIRONMENT: ${director.environment}`,
    `CAMERA: ${director.framing}; ${director.angle}; ${director.focal}; ${director.lens}; ${director.movement}`,
    `LIGHT: ${director.lighting}`,
    `LOOK / MATERIAL: ${director.palette}; ${director.atmosphere}; ${director.materialTexture ?? defaults.materialTexture}`,
    `CONTINUITY: ${brief.continuityPriority}; ${director.continuity ?? defaults.continuity}`,
    `REFERENCES: ${brief.referenceInstructions}`,
    request.mode.includes('video') ? `MOTION INTENT: ${brief.motionIntent}` : '',
    request.mode.includes('video') ? `AUDIO INTENT: ${brief.audioIntent}` : '',
    `OUTPUT: ${brief.outputType}; ${brief.outputRequirements}; canvas ${director.aspect}`,
  ].filter(Boolean).join('\n');

  const negativePrompt = cleanList([base.negativePrompt, brief.doNotWant].filter(Boolean).join('; '));
  const targetPrompt = compileTargetPrompt(skill.providerPrompt, negativePrompt, brief, request.target);
  const contract = outputContract(brief, director);
  const productionSpec = [
    base.productionSpec,
    '',
    '# PROFESSIONAL BRIEF',
    `WHAT I WANT: ${brief.objective}`,
    `MUST HAVE: ${cleanList(brief.mustHave)}`,
    `WHAT I DO NOT WANT: ${cleanList(brief.doNotWant)}`,
    `OUTPUT: ${contract}`,
    `MOTION: ${brief.motionIntent}`,
    `AUDIO: ${brief.audioIntent}`,
    `REFERENCE POLICY: ${brief.referenceInstructions}`,
    `CONTINUITY PRIORITY: ${brief.continuityPriority}`,
  ].join('\n');
  const quality = professionalAudit(request, brief, targetPrompt, skill.quality.score);

  return {
    positivePrompt,
    negativePrompt,
    targetPrompt,
    productionSpec,
    outputContract: contract,
    targetPolicy: targetPolicy[request.target],
    quality,
    timeline: skill.timeline,
    continuity: skill.continuity,
    references: skill.references,
    provenance: Array.from(new Set([
      'ABRAXAS production criteria',
      'OSideMedia higgsfield-prompt skill v3.7.2: MCSLA, I2V motion-delta, one-primary-action, emotion decomposition, anti-slop, identity/motion separation',
      'OSideMedia Higgsfield production pipeline: continuity modules, one-job-per-scene, diagnose-then-change-one-variable',
      'Higgsfield official CLI/SDK: live capability discovery before execution',
      'rediumvex Seedance skills: timed beats, camera/light/audio synchronization for short-form',
      'cclank lanshu kit: target-specific prompt grammar and cross-model translation',
      'Vibe-Workflow: modular/swappable provider execution concept',
      'Magnific Spaces: visible workflow/history mental model',
      ...skill.provenance,
    ])),
  };
}

export function professionalTargetProfiles() {
  return targetProfiles.map((profile) => ({ ...profile, ...targetPolicy[profile.id] }));
}
