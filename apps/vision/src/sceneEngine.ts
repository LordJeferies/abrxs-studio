import { defaults, type DirectorState } from './promptEngine';

export type SceneStructureField = 'goal' | 'obstacle' | 'tactic' | 'reversal' | 'valueShift';
export type SceneEvidenceLevel = 'explicit' | 'inferred' | 'unresolved';

export type SceneStructureEntry = {
  value: string;
  level: SceneEvidenceLevel;
  source: 'idea' | 'director' | 'structure';
};

export type SceneStructureSpec = {
  scene: number;
  phase: 'setup' | 'pressure' | 'turn' | 'payoff';
  goal: SceneStructureEntry;
  obstacle: SceneStructureEntry;
  tactic: SceneStructureEntry;
  reversal: SceneStructureEntry;
  valueShift: SceneStructureEntry;
  readinessScore: number;
  grade: 'A' | 'B' | 'C' | 'D';
  unresolved: SceneStructureField[];
  warnings: string[];
  promptContext: string;
};

export type SceneStructureOverrides = Partial<Record<SceneStructureField, string>>;

const OBSTACLE = /\b(but|however|except|blocked|friction|risk|problem|hesitat|doubt|resist|against|fails?|failure|can't|cannot|pero|sin embargo|excepto|bloque|fricci[oó]n|riesgo|problema|duda|resist|contra|falla|frena)\b/i;
const REVERSAL = /\b(until|then|suddenly|discover|realiz|reveal|turns out|changes?|unexpected|but then|entonces|de pronto|descubr|revel|cambia|resulta que|pero entonces)\b/i;
const VALUE_SHIFT = /\bfrom\s+([^,.!?;]+?)\s+to\s+([^,.!?;]+)|\bde\s+([^,.!?;]+?)\s+a\s+([^,.!?;]+)/i;

function sentences(value: string) {
  return value.split(/(?<=[.!?;])\s+|\n+/).map((item) => item.trim()).filter(Boolean);
}

function sentenceMatching(value: string, pattern: RegExp) {
  return sentences(value).find((sentence) => pattern.test(sentence)) ?? '';
}

function meaningful(value: string | undefined, fallback?: string) {
  const trimmed = value?.trim() ?? '';
  const baseline = fallback?.trim() ?? '';
  return trimmed && trimmed !== baseline ? trimmed : '';
}

function entry(value: string, level: SceneEvidenceLevel, source: SceneStructureEntry['source']): SceneStructureEntry {
  return { value, level, source };
}

function phaseFor(scene: number, sceneCount: number): SceneStructureSpec['phase'] {
  if (sceneCount <= 1) return 'payoff';
  if (scene === 1) return 'setup';
  if (scene === sceneCount) return 'payoff';
  if (scene / sceneCount >= 0.66) return 'turn';
  return 'pressure';
}

function scoreEntry(value: SceneStructureEntry) {
  return value.level === 'explicit' ? 20 : value.level === 'inferred' ? 12 : 0;
}

function fieldSummary(label: string, value: SceneStructureEntry) {
  return value.level === 'unresolved' || !value.value ? '' : `${label}: ${value.value}`;
}

export function deriveSceneStructure(
  idea: string,
  director: DirectorState,
  scene: number,
  sceneCount: number,
  overrides: SceneStructureOverrides = {},
): SceneStructureSpec {
  const sourceIdea = idea.trim();
  const phase = phaseFor(scene, sceneCount);
  const explicitObstacle = sentenceMatching(sourceIdea, OBSTACLE);
  const explicitReversal = sentenceMatching(sourceIdea, REVERSAL);
  const shiftMatch = sourceIdea.match(VALUE_SHIFT);
  const explicitShift = shiftMatch
    ? `from ${(shiftMatch[1] ?? shiftMatch[3] ?? '').trim()} to ${(shiftMatch[2] ?? shiftMatch[4] ?? '').trim()}`
    : '';
  const visualFunction = meaningful(director.visualFunction, defaults.visualFunction);
  const action = meaningful(director.action, defaults.action);
  const subject = meaningful(director.subject, defaults.subject) || director.subject.trim() || 'the subject';

  const goal = overrides.goal?.trim()
    ? entry(overrides.goal.trim(), 'explicit', 'structure')
    : visualFunction
      ? entry(`${subject}: ${visualFunction}`, 'explicit', 'director')
      : sourceIdea
        ? entry(`Make the central objective of “${sourceIdea}” observable in behavior or evidence.`, 'inferred', 'idea')
        : entry('', 'unresolved', 'structure');

  const obstacle = overrides.obstacle?.trim()
    ? entry(overrides.obstacle.trim(), 'explicit', 'structure')
    : explicitObstacle
      ? entry(explicitObstacle, 'explicit', 'idea')
      : entry('', 'unresolved', 'structure');

  const tactic = overrides.tactic?.trim()
    ? entry(overrides.tactic.trim(), 'explicit', 'structure')
    : action
      ? entry(action, 'explicit', 'director')
      : entry('Show one observable action the subject takes in response to the situation.', 'inferred', 'structure');

  const reversal = overrides.reversal?.trim()
    ? entry(overrides.reversal.trim(), 'explicit', 'structure')
    : explicitReversal
      ? entry(explicitReversal, 'explicit', 'idea')
      : entry('', 'unresolved', 'structure');

  const valueShift = overrides.valueShift?.trim()
    ? entry(overrides.valueShift.trim(), 'explicit', 'structure')
    : explicitShift
      ? entry(explicitShift, 'explicit', 'idea')
      : reversal.level !== 'unresolved'
        ? entry('The viewer should end the scene with a materially different understanding, emotional state or decision pressure than at the start.', 'inferred', 'structure')
        : entry('', 'unresolved', 'structure');

  const values: Array<[SceneStructureField, SceneStructureEntry]> = [
    ['goal', goal],
    ['obstacle', obstacle],
    ['tactic', tactic],
    ['reversal', reversal],
    ['valueShift', valueShift],
  ];
  const unresolved = values.filter(([, value]) => value.level === 'unresolved').map(([field]) => field);
  const readinessScore = values.reduce((total, [, value]) => total + scoreEntry(value), 0);
  const grade: SceneStructureSpec['grade'] = readinessScore >= 88 ? 'A' : readinessScore >= 68 ? 'B' : readinessScore >= 48 ? 'C' : 'D';
  const warnings: string[] = [];
  if (obstacle.level === 'unresolved') warnings.push('No concrete obstacle is explicit in the source. Do not invent one silently before expensive generation.');
  if (reversal.level === 'unresolved') warnings.push('No reversal/turn is explicit. A visually clean scene can still feel structurally dead without a change in information or pressure.');
  if (valueShift.level === 'unresolved') warnings.push('The value shift is unresolved. Define what changes from the beginning to the end of the scene.');
  if (!sourceIdea) warnings.push('The scene has no source idea; structural readiness cannot be assessed reliably.');

  const promptContext = [
    `Scene ${scene}/${sceneCount} · ${phase}`,
    fieldSummary('Goal', goal),
    fieldSummary('Obstacle', obstacle),
    fieldSummary('Tactic', tactic),
    fieldSummary('Reversal', reversal),
    fieldSummary('Value shift', valueShift),
  ].filter(Boolean).join(' | ');

  return {
    scene,
    phase,
    goal,
    obstacle,
    tactic,
    reversal,
    valueShift,
    readinessScore,
    grade,
    unresolved,
    warnings,
    promptContext,
  };
}

export function sceneStructureFields(structure: SceneStructureSpec) {
  return [
    ['goal', structure.goal],
    ['obstacle', structure.obstacle],
    ['tactic', structure.tactic],
    ['reversal', structure.reversal],
    ['valueShift', structure.valueShift],
  ] as const;
}
