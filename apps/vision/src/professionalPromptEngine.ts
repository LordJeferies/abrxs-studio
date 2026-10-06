import { compileConstraintPack, renderConstraintBlock, type ConstraintPack } from './constraintEngine';
import { getOutputProfile, outputProfiles, type PromptOutputProfileId, type PromptOutputProfile } from './outputProfiles';
import { compilePrompt, defaults, type DirectorState } from './promptEngine';
import {
  compileSkillPrompt,
  targetProfiles,
  type GenerationIntent,
  type GenerationMode,
  type GenerationTargetId,
  type VisualReference,
} from './skillEngine';

export type OutputType = PromptOutputProfileId;
export type NegativePolicy = 'separate-native' | 'positive-constraints' | 'workflow-owned' | 'discover-live';

export type ProfessionalPromptBrief = {
  objective: string;
  mustHave: string;
  doNotWant: string;
  outputType: OutputType;
  outputRequirements: string;
  literalText: string;
  performance: string;
  physicsNotes: string;
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
  outputProfile: PromptOutputProfile;
  parameterPack: Record<string, string | number | boolean>;
  constraintPack: ConstraintPack;
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
  outputRequirements: 'production-ready result; clean composition; coherent anatomy/geometry; usable safe zones; suitable for downstream editing',
  literalText: '',
  performance: '',
  physicsNotes: 'preserve believable weight, contact, inertia, reflections and material response; do not introduce unexplained topology changes',
  motionIntent: 'one primary action with at most two secondary motions; camera movement must have a narrative reason',
  audioIntent: 'natural ambience and restrained synchronized accents; dialogue remains intelligible when present',
  referenceInstructions: 'treat every reference according to its assigned role; never let a look reference overwrite identity or first-frame geometry',
  continuityPriority: 'identity, wardrobe, hero props, location geography, light direction, screen direction and palette remain stable across related outputs',
};

const targetPolicy: Record<GenerationTargetId, { negativePolicy: NegativePolicy; promptRegime: string; notes: string[] }> = {
  'generic-production': {
    negativePolicy: 'separate-native',
    promptRegime: 'ABRAXAS production specification',
    notes: ['Keep positive intent and exclusion intent separate so a downstream adapter can map them safely.'],
  },
  'higgsfield-cinema': {
    negativePolicy: 'positive-constraints',
    promptRegime: 'compressed MCSLA / Cinema Studio budget',
    notes: ['Keep visible prompt text inside the live Cinema Studio budget.', 'Translate failure modes into a compact desired state instead of blindly appending negative syntax.'],
  },
  'higgsfield-seedance': {
    negativePolicy: 'positive-constraints',
    promptRegime: 'MCSLA + temporal beats; I2V motion-delta only',
    notes: ['For I2V, describe only motion/change and camera behavior from the supplied first frame.', 'One primary action per shot; use explicit beats only when timing matters.', 'Generic emotion should be decomposed into visible behavior.'],
  },
  'higgsfield-kling': {
    negativePolicy: 'discover-live',
    promptRegime: 'Scene / Characters / Action / Camera / Audio & Style when the live model supports that grammar',
    notes: ['Negative-field support and exact schema vary by model/version; inspect the live model before execution.', 'Preserve initial composition in I2V unless the requested move deliberately changes it.'],
  },
  veo: {
    negativePolicy: 'discover-live',
    promptRegime: 'subject + action + scene + style + camera + composition + ambience/light + audio',
    notes: ['Treat audio/dialogue as first-class direction when the selected live model supports it.', 'Do not assume a separate negative field exists until capability discovery.'],
  },
  comfyui: {
    negativePolicy: 'workflow-owned',
    promptRegime: 'positive + negative + workflow parameters',
    notes: ['The selected workflow owns sampler, scheduler, seed, dimensions and conditioning support.'],
  },
  nvidia: {
    negativePolicy: 'discover-live',
    promptRegime: 'capability-driven NVIDIA adapter',
    notes: ['Map the canonical brief only after the connected NIM/model endpoint and schema are known.'],
  },
  gemini: {
    negativePolicy: 'discover-live',
    promptRegime: 'capability-driven Gemini adapter',
    notes: ['Use declared model capabilities before assuming generation, text rendering, audio or negative controls.'],
  },
};

const SLOP = /\b(beautiful|stunning|epic|amazing|masterpiece|ultra[- ]?detailed|best quality|award[- ]?winning|cinematic masterpiece|premium cinematic|bonito|impresionante|épico|obra maestra)\b/gi;
const GENERIC_EMOTION = /\b(sad|angry|surprised|scared|thoughtful|in love|tense|triste|enojad[oa]|sorprendid[oa]|asustad[oa]|pensativ[oa]|enamorad[oa]|tenso|tensa)\b/i;
const LEGACY_OUTPUTS: Record<string, PromptOutputProfileId> = {
  'cinematic-video': 'cinematic-shot',
  xroll: 'xroll-video',
  'carousel-frame': 'carousel-slide',
  'product-shot': 'product-hero',
};

function normalizedOutput(value: string | undefined): PromptOutputProfileId {
  if (LEGACY_OUTPUTS[value ?? '']) return LEGACY_OUTPUTS[value ?? ''];
  return outputProfiles.some((profile) => profile.id === value) ? value as PromptOutputProfileId : 'hero-image';
}

function mergeBrief(brief?: Partial<ProfessionalPromptBrief>): ProfessionalPromptBrief {
  return {
    ...professionalBriefDefaults,
    ...(brief ?? {}),
    outputType: normalizedOutput(brief?.outputType),
  };
}

function list(value: string) {
  return value.split(/[;\n]+/).map((part) => part.trim()).filter(Boolean);
}

function cleanList(value: string) {
  return list(value).join('; ');
}

function countActionPhases(action: string) {
  return Math.max(1, action.split(/\b(?:and then|then|while|after that|y luego|luego|mientras|después)\b|[;]+/i).map((item) => item.trim()).filter(Boolean).length);
}

function countCameraMoves(movement: string) {
  return Math.max(1, movement.split(/\+| then |, then |;| y luego | después /i).map((item) => item.trim()).filter(Boolean).length);
}

function outputContract(brief: ProfessionalPromptBrief, director: DirectorState, profile: PromptOutputProfile) {
  const text = brief.literalText.trim()
    ? `Literal text requested: “${brief.literalText.trim()}”. Text policy: ${profile.textPolicy}. If exact spelling cannot be guaranteed by the live model, deliver a clean image plus a separate typography layer.`
    : `Literal text: none required. Text policy: ${profile.textPolicy}.`;
  return [
    `OUTPUT TYPE: ${profile.label.en}`,
    `CANVAS: ${profile.recommendedAspect ?? director.aspect}`,
    `DELIVERABLES: ${profile.deliverables.join('; ')}`,
    `PROFILE CONTRACT: ${profile.promptInstruction}`,
    `ACCEPTANCE: ${profile.acceptance.join('; ')}`,
    `ADDITIONAL REQUIREMENTS: ${cleanList(brief.outputRequirements)}`,
    text,
    `ALPHA / TRANSPARENCY: ${profile.alpha ? 'required' : 'not required unless explicitly requested'}`,
    'DOWNSTREAM: output remains suitable for Vision/Dresser compositing, human review and versioned export.',
  ].join('\n');
}

function fitCharBudget(value: string, limit: number) {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= limit) return clean;
  return clean.slice(0, Math.max(0, limit)).trimEnd();
}

function compileTargetPrompt(
  basePrompt: string,
  brief: ProfessionalPromptBrief,
  target: GenerationTargetId,
  constraints: ConstraintPack,
  profile: PromptOutputProfile,
) {
  const policy = targetPolicy[target];
  const outputLine = `OUTPUT: ${profile.label.en}; ${profile.promptInstruction}`;
  const required = cleanList(brief.mustHave);
  const performance = cleanList(brief.performance);
  const physics = cleanList(brief.physicsNotes);

  if (target === 'higgsfield-cinema') {
    const compact = [
      basePrompt.replace(/\bAvoid\s*:[^.]+\.?/gi, '').trim(),
      required ? `Need: ${required}` : '',
      performance ? `Performance: ${performance}` : '',
      constraints.positive[0] ? `Hold: ${constraints.positive[0]}` : '',
    ].filter(Boolean).join(' ');
    return fitCharBudget(compact, 512);
  }

  if (policy.negativePolicy === 'positive-constraints') {
    return [
      basePrompt,
      required ? `MUST HAVE: ${required}` : '',
      performance ? `PERFORMANCE: ${performance}` : '',
      physics ? `PHYSICS / MATERIAL BEHAVIOR: ${physics}` : '',
      outputLine,
      renderConstraintBlock(constraints),
    ].filter(Boolean).join('\n');
  }

  if (policy.negativePolicy === 'workflow-owned') {
    return [
      basePrompt,
      required ? `MUST HAVE: ${required}` : '',
      outputLine,
      renderConstraintBlock(constraints),
    ].filter(Boolean).join('\n\n');
  }

  if (policy.negativePolicy === 'discover-live') {
    return [
      basePrompt,
      required ? `MUST HAVE: ${required}` : '',
      performance ? `PERFORMANCE / MICRO-BEHAVIOR: ${performance}` : '',
      physics ? `PHYSICS / MATERIAL BEHAVIOR: ${physics}` : '',
      outputLine,
      `EXCLUSION INTENT: ${cleanList(brief.doNotWant)}`,
      'ADAPTER RULE: map exclusion intent to a native negative field only when the live schema supports one; otherwise translate it into positive stability/composition constraints before submission.',
    ].filter(Boolean).join('\n');
  }

  return [
    basePrompt,
    required ? `MUST HAVE: ${required}` : '',
    performance ? `PERFORMANCE / MICRO-BEHAVIOR: ${performance}` : '',
    physics ? `PHYSICS / MATERIAL BEHAVIOR: ${physics}` : '',
    outputLine,
    renderConstraintBlock(constraints),
  ].filter(Boolean).join('\n');
}

function professionalAudit(
  request: ProfessionalPromptRequest,
  brief: ProfessionalPromptBrief,
  profile: PromptOutputProfile,
  targetPrompt: string,
  constraints: ConstraintPack,
  baseScore: number,
) {
  const director = { ...defaults, ...request.director };
  const actionCount = countActionPhases(director.action);
  const cameraMoves = countCameraMoves(director.movement);
  const slop = `${director.idea} ${director.style}`.match(SLOP) ?? [];
  const genericEmotion = GENERIC_EMOTION.test(`${director.idea} ${director.action} ${director.atmosphere}`);
  const video = request.mode.includes('video');
  const i2v = request.mode === 'image-to-video';
  const firstFrame = Boolean(request.startImageProvided) || (request.references ?? []).some((reference) => String(reference.role).toLowerCase() === 'first-frame');
  const modeMatches = profile.kind === 'video' ? video : profile.kind === 'layer' ? !video : !video;
  const promptWords = targetPrompt.split(/\s+/).filter(Boolean).length;
  const charBudgetPass = request.target !== 'higgsfield-cinema' || targetPrompt.length <= 512;
  const mustHaveCount = list(brief.mustHave).length;

  const gates: ProfessionalPromptGate[] = [
    { id: 'canonical', label: 'Canonical production spec', passed: baseScore >= 80, detail: `Base ABRAXAS skill quality ${baseScore}/100`, weight: 14 },
    { id: 'want', label: 'What I want', passed: brief.objective.trim().length >= 16, detail: 'Objective is explicit and observable.', weight: 8 },
    { id: 'must-have', label: 'Must-have clarity', passed: mustHaveCount <= 8, detail: `${mustHaveCount} explicit requirement(s); keep the list focused.`, weight: 8 },
    { id: 'do-not', label: 'No Prompt / exclusion intent', passed: brief.doNotWant.trim().length >= 8, detail: `${constraints.strategy}; ${constraints.unresolved.length} unresolved exclusion(s)`, weight: 8 },
    { id: 'output', label: 'Output contract', passed: Boolean(profile.id && profile.deliverables.length), detail: `${profile.label.en} · ${profile.deliverables.join(', ')}`, weight: 10 },
    { id: 'mode-output', label: 'Output / mode compatibility', passed: modeMatches, detail: `${request.mode} → ${profile.kind}`, weight: 6 },
    { id: 'action-load', label: 'Action load', passed: !video || actionCount <= 3, detail: `${actionCount} action phase(s); one primary + up to two secondary is preferred.`, weight: 8 },
    { id: 'camera-load', label: 'Camera load', passed: !video || cameraMoves <= 2, detail: `${cameraMoves} camera movement phrase(s).`, weight: 6 },
    { id: 'anti-slop', label: 'Anti-slop language', passed: slop.length <= 1, detail: slop.length ? `Replace vague terms: ${Array.from(new Set(slop.map((item) => item.toLowerCase()))).join(', ')}` : 'Direction is expressed as observable decisions.', weight: 8 },
    { id: 'emotion', label: 'Performance specificity', passed: !genericEmotion || brief.performance.trim().length >= 12, detail: genericEmotion ? (brief.performance.trim() ? 'Generic emotion has a physical performance description.' : 'Decompose emotion into eyes, breath, posture, hands and facial behavior.') : 'No unresolved generic-emotion label detected.', weight: 7 },
    { id: 'i2v', label: 'I2V first-frame contract', passed: !i2v || firstFrame, detail: i2v ? (firstFrame ? 'First frame supplied/tagged.' : 'I2V needs an actual first frame.') : 'Not an I2V request.', weight: 6 },
    { id: 'literal-text', label: 'Literal text risk', passed: !brief.literalText.trim() || profile.textPolicy !== 'none', detail: brief.literalText.trim() ? `Exact text isolated; policy=${profile.textPolicy}.` : 'No exact in-image text requested.', weight: 4 },
    { id: 'constraints', label: 'Constraint translation', passed: constraints.unresolved.length === 0, detail: constraints.unresolved.length ? 'Some exclusions need a human rewrite into desired-state language.' : 'All current exclusions mapped to target-safe constraints.', weight: 4 },
    { id: 'prompt-budget', label: 'Provider prompt budget', passed: charBudgetPass && promptWords <= (video ? 420 : 340), detail: request.target === 'higgsfield-cinema' ? `${targetPrompt.length}/512 chars` : `${promptWords} words`, weight: 3 },
  ];

  const score = gates.reduce((total, gate) => total + (gate.passed ? gate.weight : 0), 0);
  const warnings: string[] = [];
  if (!modeMatches) warnings.push(`Output type ${profile.label.en} does not match generation mode ${request.mode}.`);
  if (slop.length) warnings.push('Replace vague quality adjectives with concrete camera, light, material, behavior or composition decisions.');
  if (genericEmotion && !brief.performance.trim()) warnings.push('Generic emotion detected. Describe physical performance instead of leaving the model to choose a random emotional realization.');
  if (video && actionCount > 3) warnings.push('The shot carries too many action phases. Split the scene or reduce it to one primary action plus one or two secondary motions.');
  if (video && cameraMoves > 2) warnings.push('The shot carries too many camera moves. Sequence them explicitly or split the shot.');
  if (i2v && !firstFrame) warnings.push('Do not execute I2V until an actual first frame is supplied.');
  if (brief.literalText.trim() && profile.textPolicy === 'separate-preferred') warnings.push('Exact text is safer as a separate typography layer unless the selected live model proves reliable text rendering.');
  if (constraints.unresolved.length) warnings.push(`Rewrite unresolved exclusions as a desired state before provider execution: ${constraints.unresolved.join('; ')}`);
  if (targetPolicy[request.target].negativePolicy === 'discover-live') warnings.push('Negative/exclusion support must be mapped from the live provider schema before execution.');
  if (!charBudgetPass) warnings.push('Target prompt exceeds the provider prompt budget and must be compressed before execution.');
  if (mustHaveCount > 8) warnings.push('The must-have list is becoming a second prompt. Split the asset/shot or move structural detail into the canonical scene fields.');
  const grade: 'A' | 'B' | 'C' | 'D' = score >= 92 ? 'A' : score >= 82 ? 'B' : score >= 68 ? 'C' : 'D';
  return { score, grade, gates, warnings };
}

export function compileProfessionalPrompt(request: ProfessionalPromptRequest): ProfessionalPromptPacket {
  const director = { ...defaults, ...request.director };
  const brief = mergeBrief(request.brief);
  const profile = getOutputProfile(brief.outputType);
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
  const constraints = compileConstraintPack(director, request.target, request.mode, {
    mustAvoid: brief.doNotWant,
    literalText: brief.literalText,
  });

  const positivePrompt = [
    'ABRXS PROFESSIONAL POSITIVE PROMPT',
    `OBJECTIVE: ${brief.objective}`,
    `MUST HAVE: ${cleanList(brief.mustHave)}`,
    `SUBJECT: ${director.subject}`,
    `ACTION: ${director.action}`,
    brief.performance.trim() ? `PERFORMANCE / MICRO-BEHAVIOR: ${cleanList(brief.performance)}` : '',
    `ENVIRONMENT: ${director.environment}`,
    `CAMERA: ${director.framing}; ${director.angle}; ${director.focal}; ${director.lens}; ${director.movement}`,
    `LIGHT: ${director.lighting}`,
    `LOOK / MATERIAL: ${director.palette}; ${director.atmosphere}; ${director.materialTexture ?? defaults.materialTexture}`,
    `PHYSICS: ${cleanList(brief.physicsNotes)}`,
    `CONTINUITY: ${brief.continuityPriority}; ${director.continuity ?? defaults.continuity}`,
    `REFERENCES: ${brief.referenceInstructions}`,
    request.mode.includes('video') ? `MOTION INTENT: ${brief.motionIntent}` : '',
    request.mode.includes('video') ? `AUDIO INTENT: ${brief.audioIntent}` : '',
    `OUTPUT: ${profile.label.en}; ${profile.promptInstruction}; canvas ${profile.recommendedAspect ?? director.aspect}`,
    `POSITIVE STABILITY: ${constraints.positive.join('; ')}`,
  ].filter(Boolean).join('\n');

  const negativePrompt = [
    'CANONICAL EXCLUSION INTENT · DO NOT SEND BLINDLY TO EVERY MODEL',
    ...Array.from(new Set([...constraints.negative, ...list(base.negativePrompt)])).map((item) => `- ${item}`),
  ].join('\n');
  const targetPrompt = compileTargetPrompt(skill.providerPrompt, brief, request.target, constraints, profile);
  const contract = outputContract(brief, director, profile);
  const productionSpec = [
    base.productionSpec,
    '',
    '# PROFESSIONAL BRIEF',
    `WHAT I WANT: ${brief.objective}`,
    `MUST HAVE: ${cleanList(brief.mustHave)}`,
    `WHAT I DO NOT WANT: ${cleanList(brief.doNotWant)}`,
    brief.performance.trim() ? `PERFORMANCE: ${cleanList(brief.performance)}` : '',
    `PHYSICS: ${cleanList(brief.physicsNotes)}`,
    `OUTPUT CONTRACT:\n${contract}`,
    request.mode.includes('video') ? `MOTION: ${brief.motionIntent}` : '',
    request.mode.includes('video') ? `AUDIO: ${brief.audioIntent}` : '',
    `REFERENCE POLICY: ${brief.referenceInstructions}`,
    `CONTINUITY PRIORITY: ${brief.continuityPriority}`,
    `CONSTRAINT STRATEGY: ${constraints.strategy}`,
    constraints.notes.length ? `CONSTRAINT NOTES: ${constraints.notes.join('; ')}` : '',
  ].filter(Boolean).join('\n');
  const quality = professionalAudit(request, brief, profile, targetPrompt, constraints, skill.quality.score);
  const parameterPack: Record<string, string | number | boolean> = {
    aspectRatio: profile.recommendedAspect ?? director.aspect,
    durationSeconds: request.duration ?? 8,
    outputType: profile.id,
    outputKind: profile.kind,
    alphaRequired: profile.alpha,
    textPolicy: profile.textPolicy,
    providerTarget: request.target,
    constraintStrategy: constraints.strategy,
  };

  return {
    positivePrompt,
    negativePrompt,
    targetPrompt,
    productionSpec,
    outputContract: contract,
    outputProfile: profile,
    parameterPack,
    constraintPack: constraints,
    targetPolicy: targetPolicy[request.target],
    quality,
    timeline: skill.timeline,
    continuity: skill.continuity,
    references: skill.references,
    provenance: Array.from(new Set([
      'ABRAXAS production criteria',
      'OSideMedia higgsfield-prompt skill v3.7.2: MCSLA, I2V motion-delta, one-primary-action, emotion decomposition, anti-slop, identity/motion separation',
      'OSideMedia shared negative-constraints: artifact prevention and positive desired-state phrasing',
      'OSideMedia Higgsfield production pipeline: continuity modules, one-job-per-scene, diagnose-then-change-one-variable',
      'Higgsfield official CLI/SDK: live capability discovery before execution',
      'cclank lanshu prompt-translator: preserve semantic content while changing target-model structure/labels',
      'cclank lanshu model-selector: route by duration/audio/edit/locality/consistency requirements instead of one universal model',
      'rediumvex Seedance skills: timed beats, camera/light/audio synchronization for short-form',
      'Vibe-Workflow: modular/swappable provider execution concept',
      'Magnific Spaces: visible workflow/history mental model',
      ...skill.provenance,
    ])),
  };
}

export function professionalTargetProfiles() {
  return targetProfiles.map((profile) => ({ ...profile, ...targetPolicy[profile.id] }));
}
