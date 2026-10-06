import { compileConstraintPack, renderConstraintBlock, type ConstraintPack } from './constraintEngine';
import type { DirectorState } from './promptEngine';
import { getOutputProfile, type PromptOutputProfile, type PromptOutputProfileId } from './outputProfiles';
import { compileSkillPrompt, type GenerationRequest, type SkillCompilation } from './skillEngine';

export type ProfessionalPromptBrief = {
  outputProfile: PromptOutputProfileId;
  mustHave: string;
  mustAvoid: string;
  performance: string;
  literalText: string;
  audioIntent: string;
  physicsNotes: string;
  deliveryNotes: string;
};

export type ProfessionalGate = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
};

export type ProfessionalQuality = {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  gates: ProfessionalGate[];
  warnings: string[];
};

export type ProfessionalCompilation = SkillCompilation & {
  professionalPrompt: string;
  outputProfile: PromptOutputProfile;
  constraintPack: ConstraintPack;
  professionalQuality: ProfessionalQuality;
  parameterPack: Record<string, string | number | boolean>;
  brief: ProfessionalPromptBrief;
};

export const defaultProfessionalBrief: ProfessionalPromptBrief = {
  outputProfile: 'hero-image',
  mustHave: '',
  mustAvoid: 'generic AI gloss; random pseudo-text; anatomy errors; unmotivated neon; generic stock-business staging',
  performance: '',
  literalText: '',
  audioIntent: '',
  physicsNotes: '',
  deliveryNotes: '',
};

function items(value: string) {
  return value.split(/\n|;/).map((item) => item.trim()).filter(Boolean);
}

function compact(value: string, limit: number) {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
}

function professionalQuality(
  request: GenerationRequest,
  brief: ProfessionalPromptBrief,
  profile: PromptOutputProfile,
  constraints: ConstraintPack,
  prompt: string,
): ProfessionalQuality {
  const video = request.mode.includes('video');
  const hasHumanSubject = /person|human|man|woman|founder|joc|speaker|character|persona|hombre|mujer|cliente/i.test(request.director.subject);
  const userMustHave = items(brief.mustHave);
  const actionParts = request.director.action.split(/\b(?:and then|then|while|y luego|después|mientras)\b|;/i).map((item) => item.trim()).filter(Boolean);
  const cameraParts = request.director.movement.split(/\+| then |, then |;/i).map((item) => item.trim()).filter(Boolean);
  const gates: ProfessionalGate[] = [
    { id: 'output', label: 'output contract', passed: Boolean(profile.id && profile.deliverables.length), detail: `${profile.label.en}: ${profile.deliverables.join(', ')}` },
    { id: 'must-have', label: 'must-have clarity', passed: userMustHave.length <= 8, detail: userMustHave.length ? `${userMustHave.length} explicit requirement(s)` : 'no extra must-have list; canonical brief remains authoritative' },
    { id: 'constraint-strategy', label: 'constraint strategy', passed: constraints.unresolved.length === 0, detail: constraints.unresolved.length ? `${constraints.unresolved.length} free-form exclusion(s) need positive rewriting/human QA` : `${constraints.strategy} prevention is target-aware` },
    { id: 'action-economy', label: 'action economy', passed: !video || actionParts.length <= 3, detail: !video ? 'still output' : `${Math.max(1, actionParts.length)} action phrase(s); one primary + up to two secondary is preferred` },
    { id: 'camera-economy', label: 'camera economy', passed: !video || cameraParts.length <= 2, detail: !video ? 'still output' : `${Math.max(1, cameraParts.length)} camera move phrase(s)` },
    { id: 'performance', label: 'performance specificity', passed: !video || !hasHumanSubject || Boolean(brief.performance.trim()) || request.director.action.trim().length >= 18, detail: brief.performance.trim() ? 'physical performance/micro-behavior supplied' : 'behavior comes from the action field; add micro-behavior when emotional fidelity matters' },
    { id: 'literal-text', label: 'literal text safety', passed: !brief.literalText.trim() || profile.textPolicy !== 'none', detail: brief.literalText.trim() ? `exact copy requested; text policy=${profile.textPolicy}` : 'no exact rendered text requested' },
    { id: 'overprompting', label: 'prompt economy', passed: prompt.split(/\s+/).filter(Boolean).length <= (request.mode.includes('video') ? 360 : 300), detail: `${prompt.split(/\s+/).filter(Boolean).length} words after professional compilation` },
  ];
  const passed = gates.filter((gate) => gate.passed).length;
  const score = Math.round((passed / gates.length) * 100);
  const grade: ProfessionalQuality['grade'] = score >= 92 ? 'A' : score >= 80 ? 'B' : score >= 65 ? 'C' : 'D';
  const warnings: string[] = [];
  if (constraints.unresolved.length) warnings.push(`Rewrite these exclusions as a desired state for this target: ${constraints.unresolved.join('; ')}`);
  if (brief.literalText.trim() && profile.textPolicy === 'separate-preferred') warnings.push('Exact typography is safer as a separate layer. Generate a clean plate plus text asset unless the selected live model proves reliable text rendering.');
  if (video && actionParts.length > 3) warnings.push('Too many actions compete in one clip. Split into shots or keep one primary action with one or two secondary motions.');
  if (video && cameraParts.length > 2) warnings.push('Too many camera moves compete in one shot. Sequence by time or split the shot.');
  if (brief.mustHave.split(/\n|;/).filter(Boolean).length > 8) warnings.push('The must-have list is becoming a second prompt. Move structural detail back into subject/action/environment or split the output into separate shots/assets.');
  return { score, grade, gates, warnings };
}

function professionalPromptFor(
  request: GenerationRequest,
  base: SkillCompilation,
  brief: ProfessionalPromptBrief,
  profile: PromptOutputProfile,
  constraints: ConstraintPack,
) {
  const mustHave = items(brief.mustHave);
  const fullBlock = [
    base.providerPrompt,
    '',
    `OUTPUT TYPE: ${profile.label.en}`,
    `OUTPUT CONTRACT: ${profile.promptInstruction}`,
    `ACCEPTANCE: ${profile.acceptance.join('; ')}`,
    mustHave.length ? `MUST HAVE: ${mustHave.join('; ')}` : '',
    brief.performance.trim() ? `PERFORMANCE / MICRO-BEHAVIOR: ${brief.performance.trim()}` : '',
    brief.literalText.trim() ? `LITERAL TEXT: ${brief.literalText.trim()}` : '',
    brief.physicsNotes.trim() ? `PHYSICS / MATERIAL BEHAVIOR: ${brief.physicsNotes.trim()}` : '',
    brief.audioIntent.trim() && request.mode.includes('video') ? `AUDIO INTENT: ${brief.audioIntent.trim()}` : '',
    brief.deliveryNotes.trim() ? `DELIVERY NOTES: ${brief.deliveryNotes.trim()}` : '',
    '',
    renderConstraintBlock(constraints),
  ].filter(Boolean).join('\n');

  if (base.target.id === 'higgsfield-cinema') {
    // Cinema Studio has a strict prompt budget. Keep the provider prompt concise and
    // leave the full professional brief visible in canonicalProductionSpec/QA.
    const compactNeed = mustHave.length ? ` Need: ${mustHave.slice(0, 3).join('; ')}.` : '';
    const compactPerformance = brief.performance.trim() ? ` Performance: ${compact(brief.performance, 90)}.` : '';
    const compactConstraint = constraints.positive[0] ? ` Hold: ${compact(constraints.positive[0], 90)}.` : '';
    return compact(`${base.providerPrompt}${compactNeed}${compactPerformance}${compactConstraint}`, 512);
  }

  return fullBlock;
}

export function compileProfessionalPrompt(request: GenerationRequest, input?: Partial<ProfessionalPromptBrief>): ProfessionalCompilation {
  const brief = { ...defaultProfessionalBrief, ...input };
  const outputProfile = getOutputProfile(brief.outputProfile);
  const enhancedRequest: GenerationRequest = {
    ...request,
    literalText: brief.literalText || request.literalText,
    audioDirection: brief.audioIntent || request.audioDirection,
  };
  const base = compileSkillPrompt(enhancedRequest);
  const constraintPack = compileConstraintPack(request.director, base.target.id, request.mode, {
    mustAvoid: brief.mustAvoid,
    literalText: brief.literalText,
  });
  const professionalPrompt = professionalPromptFor(enhancedRequest, base, brief, outputProfile, constraintPack);
  const professionalQualityResult = professionalQuality(enhancedRequest, brief, outputProfile, constraintPack, professionalPrompt);
  const parameterPack: Record<string, string | number | boolean> = {
    aspectRatio: request.director.aspect,
    durationSeconds: request.duration ?? 8,
    outputProfile: outputProfile.id,
    alphaRequired: outputProfile.alpha,
    textPolicy: outputProfile.textPolicy,
    providerTarget: base.target.id,
    constraintStrategy: constraintPack.strategy,
  };

  return {
    ...base,
    providerPrompt: professionalPrompt,
    professionalPrompt,
    outputProfile,
    constraintPack,
    professionalQuality: professionalQualityResult,
    parameterPack,
    brief,
    executionHints: [
      ...base.executionHints,
      'Treat the user Avoid / No Prompt list as a QA boundary, not a blind bag of negative tokens. Translate exclusions into positive desired states when the target benefits from positive prompting.',
      'Keep output-profile requirements separate from model parameters: aspect, duration, resolution, seed and provider-specific controls belong in the parameter pack when the live schema exposes them.',
      'If an iteration fails, preserve approved decisions and change one diagnosed variable at a time.',
    ],
    provenance: Array.from(new Set([...base.provenance, 'oside-negative-constraints', 'oside-one-action', 'lanshu-prompt-translator', 'lanshu-model-selector', 'abraxas-output-contracts'])),
  };
}
