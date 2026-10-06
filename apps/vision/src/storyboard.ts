import type { DirectorState } from './promptEngine';

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
};

export type StoryboardSpec = {
  id: string;
  title: string;
  grammar: StoryboardGrammarId;
  sceneCount: number;
  shotsPerScene: number;
  shots: ShotSpec[];
};

type ShotPattern = Omit<ShotSpec, 'id' | 'scene' | 'shot'>;

export const storyboardGrammars: Array<{
  id: StoryboardGrammarId;
  name: string;
  description: string;
  pattern: ShotPattern[];
}> = [
  {
    id: 'classical',
    name: 'Classical Coverage',
    description: 'Establish geography, move closer for information, finish with a reaction or detail.',
    pattern: [
      { narrativeRole: 'Establish', framing: 'Wide', focal: '35mm', angle: 'Eye level', movement: 'Static', duration: 3.6, transition: 'Hard cut', promptHint: 'establish geography and subject relationships clearly' },
      { narrativeRole: 'Develop', framing: 'Medium', focal: '50mm', angle: 'Eye level', movement: 'Slow dolly in', duration: 3.2, transition: 'Hard cut', promptHint: 'move closer as the dramatic information becomes specific' },
      { narrativeRole: 'Reaction', framing: 'Close-up', focal: '85mm', angle: 'Eye level', movement: 'Static', duration: 2.8, transition: 'Hard cut', promptHint: 'hold on a precise human reaction with restrained movement' },
      { narrativeRole: 'Detail', framing: 'Extreme close-up', focal: '85mm', angle: 'High angle', movement: 'Slider right', duration: 2.2, transition: 'Hard cut', promptHint: 'show the concrete detail that closes the beat' },
    ],
  },
  {
    id: 'suspense',
    name: 'Suspense Reveal',
    description: 'Delay information, isolate clues and use a controlled reveal.',
    pattern: [
      { narrativeRole: 'Orient', framing: 'Wide', focal: '35mm', angle: 'Eye level', movement: 'Slow dolly in', duration: 4.0, transition: 'Hard cut', promptHint: 'orient the viewer while withholding the key information' },
      { narrativeRole: 'Clue', framing: 'Close-up', focal: '85mm', angle: 'High angle', movement: 'Static', duration: 2.1, transition: 'Hard cut', promptHint: 'isolate one suspicious clue without explaining it' },
      { narrativeRole: 'Reaction', framing: 'Medium close-up', focal: '85mm', angle: 'Eye level', movement: 'Slow dolly in', duration: 3.0, transition: 'Hard cut', promptHint: 'compress the frame around the subject reaction' },
      { narrativeRole: 'Reveal', framing: 'Wide', focal: '24mm', angle: 'Low angle', movement: 'Dolly out', duration: 3.4, transition: 'Hard cut', promptHint: 'reveal the hidden spatial or narrative information decisively' },
    ],
  },
  {
    id: 'dialogue',
    name: 'Dialogue Coverage',
    description: 'Two-shot geography, alternating OTS coverage, reactions and insert.',
    pattern: [
      { narrativeRole: 'Two-shot', framing: 'Medium', focal: '35mm', angle: 'Eye level', movement: 'Static', duration: 3.4, transition: 'Hard cut', promptHint: 'establish both speakers and eyelines' },
      { narrativeRole: 'Speaker A', framing: 'Medium close-up', focal: '50mm', angle: 'Eye level', movement: 'Static', duration: 3.0, transition: 'Hard cut', promptHint: 'over-the-shoulder coverage toward speaker A' },
      { narrativeRole: 'Speaker B', framing: 'Medium close-up', focal: '50mm', angle: 'Eye level', movement: 'Static', duration: 3.0, transition: 'Hard cut', promptHint: 'reverse over-the-shoulder coverage toward speaker B' },
      { narrativeRole: 'Reaction', framing: 'Close-up', focal: '85mm', angle: 'Eye level', movement: 'Static', duration: 2.5, transition: 'Hard cut', promptHint: 'hold a useful reaction for editorial flexibility' },
      { narrativeRole: 'Insert', framing: 'Extreme close-up', focal: '85mm', angle: 'High angle', movement: 'Slider right', duration: 1.8, transition: 'Hard cut', promptHint: 'insert object or gesture supporting the dialogue beat' },
    ],
  },
  {
    id: 'emotional',
    name: 'Emotional Isolation',
    description: 'Negative space and progressively tighter images emphasize internal emotion.',
    pattern: [
      { narrativeRole: 'Isolation', framing: 'Wide', focal: '50mm', angle: 'Eye level', movement: 'Static', duration: 4.5, transition: 'Hard cut', promptHint: 'place the subject small inside deliberate negative space' },
      { narrativeRole: 'Observe', framing: 'Medium', focal: '50mm', angle: 'Profile', movement: 'Static', duration: 3.8, transition: 'Hard cut', promptHint: 'observe behavior without editorial aggression' },
      { narrativeRole: 'Emotion', framing: 'Close-up', focal: '85mm', angle: 'Eye level', movement: 'Slow dolly in', duration: 3.6, transition: 'Hard cut', promptHint: 'move gently into the decisive emotional change' },
      { narrativeRole: 'Release', framing: 'Wide', focal: '35mm', angle: 'Eye level', movement: 'Dolly out', duration: 4.2, transition: 'Dissolve', promptHint: 'release tension by opening the space again' },
    ],
  },
  {
    id: 'documentary',
    name: 'Observational Documentary',
    description: 'Flexible real-world coverage with restrained handheld movement and useful inserts.',
    pattern: [
      { narrativeRole: 'Context', framing: 'Wide', focal: '35mm', angle: 'Eye level', movement: 'Handheld restrained', duration: 4.0, transition: 'Hard cut', promptHint: 'observe the real environment without over-staging' },
      { narrativeRole: 'Action', framing: 'Medium', focal: '50mm', angle: 'Eye level', movement: 'Tracking', duration: 4.0, transition: 'Hard cut', promptHint: 'follow useful action while preserving documentary realism' },
      { narrativeRole: 'Human detail', framing: 'Close-up', focal: '85mm', angle: 'Eye level', movement: 'Handheld restrained', duration: 2.8, transition: 'Hard cut', promptHint: 'capture a tactile or human detail with natural imperfection' },
      { narrativeRole: 'Environment detail', framing: 'Extreme close-up', focal: '85mm', angle: 'High angle', movement: 'Static', duration: 2.0, transition: 'Hard cut', promptHint: 'collect an editorial insert that can bridge cuts' },
    ],
  },
  {
    id: 'montage',
    name: 'Rhythmic Montage',
    description: 'Short contrasting shots designed around shape, action and rhythmic progression.',
    pattern: [
      { narrativeRole: 'Beat', framing: 'Wide', focal: '24mm', angle: 'Low angle', movement: 'Tracking', duration: 1.8, transition: 'Hard cut', promptHint: 'strong graphic action that reads instantly' },
      { narrativeRole: 'Texture', framing: 'Extreme close-up', focal: '85mm', angle: 'High angle', movement: 'Slider right', duration: 1.2, transition: 'Hard cut', promptHint: 'tactile macro detail with directional movement' },
      { narrativeRole: 'Human', framing: 'Close-up', focal: '50mm', angle: 'Eye level', movement: 'Handheld restrained', duration: 1.6, transition: 'Hard cut', promptHint: 'human reaction or gesture that resets attention' },
      { narrativeRole: 'Payoff', framing: 'Wide', focal: '35mm', angle: 'Eye level', movement: 'Crane', duration: 2.4, transition: 'Hard cut', promptHint: 'finish the montage beat with a larger visual payoff' },
    ],
  },
  {
    id: 'product',
    name: 'Product Hero',
    description: 'Establish, texture, functionality and a controlled hero finish.',
    pattern: [
      { narrativeRole: 'Establish', framing: 'Medium', focal: '50mm', angle: 'Eye level', movement: 'Orbit', duration: 3.0, transition: 'Hard cut', promptHint: 'introduce product silhouette and premium material response' },
      { narrativeRole: 'Texture', framing: 'Extreme close-up', focal: '85mm', angle: 'Low angle', movement: 'Slider right', duration: 2.0, transition: 'Hard cut', promptHint: 'macro texture and material detail' },
      { narrativeRole: 'Use', framing: 'Close-up', focal: '50mm', angle: 'Eye level', movement: 'Tracking', duration: 2.8, transition: 'Hard cut', promptHint: 'show function through a clear human interaction' },
      { narrativeRole: 'Hero', framing: 'Medium close-up', focal: '85mm', angle: 'Low angle', movement: 'Slow dolly in', duration: 3.4, transition: 'Dissolve', promptHint: 'finish on a clean premium hero composition' },
    ],
  },
  {
    id: 'social',
    name: 'Social Cinematic Hook',
    description: 'Fast hook, context, pattern interruption and payoff for short-form content.',
    pattern: [
      { narrativeRole: 'Hook', framing: 'Close-up', focal: '35mm', angle: 'Low angle', movement: 'Slow dolly in', duration: 1.2, transition: 'Hard cut', promptHint: 'instant visual interruption that remains premium rather than gimmicky' },
      { narrativeRole: 'Context', framing: 'Medium', focal: '50mm', angle: 'Eye level', movement: 'Tracking', duration: 2.2, transition: 'Hard cut', promptHint: 'clarify subject and environment immediately' },
      { narrativeRole: 'Proof', framing: 'Extreme close-up', focal: '85mm', angle: 'High angle', movement: 'Slider right', duration: 1.6, transition: 'Hard cut', promptHint: 'show concrete evidence or detail that supports the hook' },
      { narrativeRole: 'Payoff', framing: 'Wide', focal: '35mm', angle: 'Eye level', movement: 'Dolly out', duration: 2.8, transition: 'Hard cut', promptHint: 'finish the micro-story with a clear visual payoff' },
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

  for (let scene = 1; scene <= scenes; scene += 1) {
    for (let shot = 1; shot <= perScene; shot += 1) {
      const pattern = grammar.pattern[(shot - 1) % grammar.pattern.length];
      shots.push({
        ...pattern,
        id: `scene-${scene}-shot-${shot}`,
        scene,
        shot,
        promptHint: `${pattern.promptHint}; visual story context: ${idea}; preserve ${director.style.toLowerCase()} and ${director.lighting.toLowerCase()}`,
      });
    }
  }

  return {
    id: `storyboard-${grammar.id}`,
    title: idea || 'Untitled storyboard',
    grammar: grammar.id,
    sceneCount: scenes,
    shotsPerScene: perScene,
    shots,
  };
}

export function compileShotPrompt(shot: ShotSpec, director: DirectorState, idea: string) {
  return [
    idea,
    `Scene ${shot.scene}, shot ${shot.shot}: ${shot.narrativeRole}`,
    `${shot.framing}, ${shot.angle}, ${shot.focal}`,
    `Camera movement: ${shot.movement}`,
    `Lighting: ${director.lighting}`,
    `Palette: ${director.palette}`,
    `Style: ${director.style}`,
    `Narrative direction: ${shot.promptHint}`,
    `Approximate shot duration ${shot.duration.toFixed(1)} seconds`,
    `Transition intent: ${shot.transition}`,
    'maintain spatial continuity, subject identity, wardrobe continuity and physically plausible camera behavior',
  ].join(', ');
}
