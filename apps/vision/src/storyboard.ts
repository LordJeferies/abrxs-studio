import type { DirectorState } from './promptEngine';
import { deriveSceneStructure, type SceneStructureSpec } from './sceneEngine';
import {
  compileSkillPrompt,
  type GenerationIntent,
  type GenerationTargetId,
  type SkillCompilation,
} from './skillEngine';

export type StoryboardGrammarId =
  | 'classical'
  | 'suspense'
  | 'dialogue'
  | 'emotional'
  | 'documentary'
  | 'montage'
  | 'product'
  | 'social';

export type ShotSpec = {
  id: string;
  scene: number;
  shot: number;
  narrativeRole: string;
  framing: string;
  focal: string;
  angle: string;
  movement: string;
  duration: number;
  transition: string;
  promptHint: string;
  continuityKey: string;
  sceneGoal: string;
  sceneStructure: SceneStructureSpec;
};

export type StoryboardSpec = {
  id: string;
  title: string;
  grammar: StoryboardGrammarId;
  sceneCount: number;
  shotsPerScene: number;
  shots: ShotSpec[];
  sceneStructures: SceneStructureSpec[];
  readinessScore: number;
  continuityContract: string[];
};

type ShotPattern = Omit<ShotSpec, 'id' | 'scene' | 'shot' | 'continuityKey' | 'sceneGoal' | 'sceneStructure'>;

export const storyboardGrammars: Array<{
  id: StoryboardGrammarId;
  name: string;
  description: string;
  intent: GenerationIntent;
  pattern: ShotPattern[];
}> = [
  {
    id: 'classical',
    name: 'Classical Coverage',
    description: 'Establish geography, move closer for information, finish with a reaction or detail.',
    intent: 'cinematic',
    pattern: [
      { narrativeRole: 'Establish', framing: 'Wide', focal: '35mm', angle: 'Eye level', movement: 'Static', duration: 3.6, transition: 'Hard cut', promptHint: 'establish geography, eyelines and subject relationships clearly' },
      { narrativeRole: 'Develop', framing: 'Medium', focal: '50mm', angle: 'Eye level', movement: 'Slow dolly in', duration: 3.2, transition: 'Hard cut', promptHint: 'move closer only as the dramatic information becomes more specific' },
      { narrativeRole: 'Reaction', framing: 'Close-up', focal: '85mm', angle: 'Eye level', movement: 'Static', duration: 2.8, transition: 'Hard cut', promptHint: 'hold on a precise human reaction with restrained movement and clean eye line' },
      { narrativeRole: 'Detail', framing: 'Extreme close-up', focal: '85mm', angle: 'High angle', movement: 'Slider right', duration: 2.2, transition: 'Hard cut', promptHint: 'show the concrete detail, gesture or evidence that closes the beat' },
    ],
  },
  {
    id: 'suspense',
    name: 'Suspense Reveal',
    description: 'Delay information, isolate clues and use a controlled reveal.',
    intent: 'cinematic',
    pattern: [
      { narrativeRole: 'Orient', framing: 'Wide', focal: '35mm', angle: 'Eye level', movement: 'Slow dolly in', duration: 4.0, transition: 'Hard cut', promptHint: 'orient the viewer while withholding the key information' },
      { narrativeRole: 'Clue', framing: 'Close-up', focal: '85mm', angle: 'High angle', movement: 'Static', duration: 2.1, transition: 'Hard cut', promptHint: 'isolate one suspicious clue without explaining it' },
      { narrativeRole: 'Reaction', framing: 'Medium close-up', focal: '85mm', angle: 'Eye level', movement: 'Slow dolly in', duration: 3.0, transition: 'Hard cut', promptHint: 'compress the frame around the subject reaction and preserve the withheld information' },
      { narrativeRole: 'Reveal', framing: 'Wide', focal: '24mm', angle: 'Low angle', movement: 'Dolly out', duration: 3.4, transition: 'Hard cut', promptHint: 'reveal the hidden spatial or narrative information decisively' },
    ],
  },
  {
    id: 'dialogue',
    name: 'Dialogue Coverage',
    description: 'Two-shot geography, alternating OTS coverage, reactions and insert.',
    intent: 'dialogue',
    pattern: [
      { narrativeRole: 'Two-shot', framing: 'Medium', focal: '35mm', angle: 'Eye level', movement: 'Static', duration: 3.4, transition: 'Hard cut', promptHint: 'establish both speakers, screen direction and eyelines' },
      { narrativeRole: 'Speaker A', framing: 'Medium close-up', focal: '50mm', angle: 'Eye level', movement: 'Static', duration: 3.0, transition: 'Hard cut', promptHint: 'over-the-shoulder coverage toward speaker A while preserving eyeline and shoulder geography' },
      { narrativeRole: 'Speaker B', framing: 'Medium close-up', focal: '50mm', angle: 'Eye level', movement: 'Static', duration: 3.0, transition: 'Hard cut', promptHint: 'reverse over-the-shoulder coverage toward speaker B while preserving the same axis' },
      { narrativeRole: 'Reaction', framing: 'Close-up', focal: '85mm', angle: 'Eye level', movement: 'Static', duration: 2.5, transition: 'Hard cut', promptHint: 'hold a useful reaction for editorial flexibility and emotional punctuation' },
      { narrativeRole: 'Insert', framing: 'Extreme close-up', focal: '85mm', angle: 'High angle', movement: 'Slider right', duration: 1.8, transition: 'Hard cut', promptHint: 'show a concrete object or gesture that supports what is being said' },
    ],
  },
  {
    id: 'emotional',
    name: 'Emotional Isolation',
    description: 'Negative space and progressively tighter images emphasize internal emotion.',
    intent: 'cinematic',
    pattern: [
      { narrativeRole: 'Isolation', framing: 'Wide', focal: '50mm', angle: 'Eye level', movement: 'Static', duration: 4.5, transition: 'Hard cut', promptHint: 'place the subject small inside deliberate negative space and let behavior carry emotion' },
      { narrativeRole: 'Observe', framing: 'Medium', focal: '50mm', angle: 'Profile', movement: 'Static', duration: 3.8, transition: 'Hard cut', promptHint: 'observe behavior without editorial aggression; preserve quiet body language' },
      { narrativeRole: 'Emotion', framing: 'Close-up', focal: '85mm', angle: 'Eye level', movement: 'Slow dolly in', duration: 3.6, transition: 'Hard cut', promptHint: 'move gently into the decisive emotional change without beauty-ad posing' },
      { narrativeRole: 'Release', framing: 'Wide', focal: '35mm', angle: 'Eye level', movement: 'Dolly out', duration: 4.2, transition: 'Dissolve', promptHint: 'release tension by opening the space again and showing the consequence of the beat' },
    ],
  },
  {
    id: 'documentary',
    name: 'Observational Documentary',
    description: 'Flexible real-world coverage with restrained handheld movement and useful inserts.',
    intent: 'documentary',
    pattern: [
      { narrativeRole: 'Context', framing: 'Wide', focal: '35mm', angle: 'Eye level', movement: 'Handheld restrained', duration: 4.0, transition: 'Hard cut', promptHint: 'observe the real environment without over-staging or impossible blocking' },
      { narrativeRole: 'Action', framing: 'Medium', focal: '50mm', angle: 'Eye level', movement: 'Tracking', duration: 4.0, transition: 'Hard cut', promptHint: 'follow useful action while preserving documentary realism and spatial orientation' },
      { narrativeRole: 'Human detail', framing: 'Close-up', focal: '85mm', angle: 'Eye level', movement: 'Handheld restrained', duration: 2.8, transition: 'Hard cut', promptHint: 'capture a tactile or human detail with natural imperfection' },
      { narrativeRole: 'Environment detail', framing: 'Extreme close-up', focal: '85mm', angle: 'High angle', movement: 'Static', duration: 2.0, transition: 'Hard cut', promptHint: 'collect an editorial insert that can bridge cuts and prove the location' },
    ],
  },
  {
    id: 'montage',
    name: 'Rhythmic Montage',
    description: 'Short contrasting shots designed around shape, action and rhythmic progression.',
    intent: 'social-hook',
    pattern: [
      { narrativeRole: 'Beat', framing: 'Wide', focal: '24mm', angle: 'Low angle', movement: 'Tracking', duration: 1.8, transition: 'Hard cut', promptHint: 'strong graphic action that reads instantly without sacrificing subject identity' },
      { narrativeRole: 'Texture', framing: 'Extreme close-up', focal: '85mm', angle: 'High angle', movement: 'Slider right', duration: 1.2, transition: 'Hard cut', promptHint: 'tactile macro detail with one clear directional movement' },
      { narrativeRole: 'Human', framing: 'Close-up', focal: '50mm', angle: 'Eye level', movement: 'Handheld restrained', duration: 1.6, transition: 'Hard cut', promptHint: 'human reaction or gesture that resets attention and adds meaning' },
      { narrativeRole: 'Payoff', framing: 'Wide', focal: '35mm', angle: 'Eye level', movement: 'Crane', duration: 2.4, transition: 'Hard cut', promptHint: 'finish the montage beat with a larger visual payoff rather than another decorative shot' },
    ],
  },
  {
    id: 'product',
    name: 'Product Hero',
    description: 'Establish, texture, functionality and a controlled hero finish.',
    intent: 'product',
    pattern: [
      { narrativeRole: 'Establish', framing: 'Medium', focal: '50mm', angle: 'Eye level', movement: 'Orbit', duration: 3.0, transition: 'Hard cut', promptHint: 'introduce product silhouette, scale and premium material response' },
      { narrativeRole: 'Texture', framing: 'Extreme close-up', focal: '85mm', angle: 'Low angle', movement: 'Slider right', duration: 2.0, transition: 'Hard cut', promptHint: 'macro texture and physically credible material detail' },
      { narrativeRole: 'Use', framing: 'Close-up', focal: '50mm', angle: 'Eye level', movement: 'Tracking', duration: 2.8, transition: 'Hard cut', promptHint: 'show function through a clear human interaction instead of floating feature text' },
      { narrativeRole: 'Hero', framing: 'Medium close-up', focal: '85mm', angle: 'Low angle', movement: 'Slow dolly in', duration: 3.4, transition: 'Dissolve', promptHint: 'finish on a controlled hero composition with accurate brand/material continuity' },
    ],
  },
  {
    id: 'social',
    name: 'Social Cinematic Hook',
    description: 'Fast hook, context, pattern interruption and payoff for short-form content.',
    intent: 'social-hook',
    pattern: [
      { narrativeRole: 'Hook', framing: 'Close-up', focal: '35mm', angle: 'Low angle', movement: 'Slow dolly in', duration: 1.2, transition: 'Hard cut', promptHint: 'instant pattern interruption that remains specific and story-relevant rather than gimmicky' },
      { narrativeRole: 'Context', framing: 'Medium', focal: '50mm', angle: 'Eye level', movement: 'Tracking', duration: 2.2, transition: 'Hard cut', promptHint: 'clarify subject, environment and stakes immediately' },
      { narrativeRole: 'Proof', framing: 'Extreme close-up', focal: '85mm', angle: 'High angle', movement: 'Slider right', duration: 1.6, transition: 'Hard cut', promptHint: 'show concrete evidence or detail that supports the hook' },
      { narrativeRole: 'Payoff', framing: 'Wide', focal: '35mm', angle: 'Eye level', movement: 'Dolly out', duration: 2.8, transition: 'Hard cut', promptHint: 'finish the micro-story with a clear visual consequence and room for the next beat' },
    ],
  },
];

export function generateStoryboard(
  idea: string,
  grammarId: StoryboardGrammarId,
  sceneCount: number,
  shotsPerScene: number,
  director: DirectorState,
): StoryboardSpec {
  const grammar = storyboardGrammars.find((item) => item.id === grammarId) ?? storyboardGrammars[0];
  const scenes = Math.max(1, Math.min(12, Math.round(sceneCount)));
  const perScene = Math.max(1, Math.min(12, Math.round(shotsPerScene)));
  const shots: ShotSpec[] = [];
  const sceneStructures = Array.from({ length: scenes }, (_, index) => deriveSceneStructure(idea, director, index + 1, scenes));

  for (let scene = 1; scene <= scenes; scene += 1) {
    const sceneStructure = sceneStructures[scene - 1];
    for (let shot = 1; shot <= perScene; shot += 1) {
      const pattern = grammar.pattern[(shot - 1) % grammar.pattern.length];
      shots.push({
        ...pattern,
        id: `scene-${scene}-shot-${shot}`,
        scene,
        shot,
        continuityKey: `scene-${scene}:${director.subject}:${director.environment}:${director.palette}`,
        sceneGoal: sceneStructure.promptContext,
        sceneStructure,
        promptHint: `${pattern.promptHint}; visual story context: ${idea}; structural phase: ${sceneStructure.phase}; preserve ${director.style.toLowerCase()} and ${director.lighting.toLowerCase()}`,
      });
    }
  }

  const readinessScore = Math.round(sceneStructures.reduce((total, structure) => total + structure.readinessScore, 0) / sceneStructures.length);
  return {
    id: `storyboard-${grammar.id}`,
    title: idea || 'Untitled storyboard',
    grammar: grammar.id,
    sceneCount: scenes,
    shotsPerScene: perScene,
    shots,
    sceneStructures,
    readinessScore,
    continuityContract: [
      `Identity: ${director.subject}`,
      `Location: ${director.environment}`,
      `Lighting: ${director.lighting}`,
      `Palette: ${director.palette}`,
      `Style: ${director.style}`,
      'Keep screen direction, wardrobe, hero props and spatial relationships stable until a shot explicitly changes them.',
    ],
  };
}

export function compileShotPackage(
  shot: ShotSpec,
  director: DirectorState,
  idea: string,
  target: GenerationTargetId = 'generic-production',
): SkillCompilation {
  const grammarIntent: GenerationIntent = /hook|proof|payoff/i.test(shot.narrativeRole)
    ? 'social-hook'
    : /speaker|two-shot/i.test(shot.narrativeRole)
      ? 'dialogue'
      : 'cinematic';
  const resolvedStructure = shot.sceneStructure.promptContext;
  return compileSkillPrompt({
    director: {
      ...director,
      idea: `${idea}. Scene structure: ${resolvedStructure}`,
      framing: shot.framing,
      focal: shot.focal,
      angle: shot.angle,
      movement: shot.movement,
      action: `${director.action}. Shot purpose: ${shot.promptHint}`,
      visualFunction: `${shot.narrativeRole}: ${shot.promptHint}. Structural purpose: ${resolvedStructure}`,
      continuity: `${director.continuity ?? ''} Storyboard continuity key: ${shot.continuityKey}`.trim(),
    },
    mode: 'text-to-video',
    target,
    intent: grammarIntent,
    duration: shot.duration,
  });
}

export function compileShotPrompt(
  shot: ShotSpec,
  director: DirectorState,
  idea: string,
  target: GenerationTargetId = 'generic-production',
) {
  return compileShotPackage(shot, director, idea, target).providerPrompt;
}
