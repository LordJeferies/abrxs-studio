import {
  auditPrompt,
  brandPresets,
  compileCarouselPromptSpec,
  compilePrompt,
  defaults,
  type OutputLanguage,
} from '../src/promptEngine';
import { generateStoryboard, storyboardGrammars, type StoryboardGrammarId } from '../src/storyboard';

const args = process.argv.slice(2);
const command = args[0] ?? 'help';

function value(flag: string, fallback = '') {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function print(valueToPrint: unknown) {
  process.stdout.write(`${typeof valueToPrint === 'string' ? valueToPrint : JSON.stringify(valueToPrint, null, 2)}\n`);
}

function language(): OutputLanguage {
  const candidate = value('--lang', 'auto');
  return candidate === 'en' || candidate === 'es' ? candidate : 'auto';
}

function promptState() {
  return {
    ...defaults,
    idea: value('--idea', defaults.idea),
    subject: value('--subject', defaults.subject),
    environment: value('--environment', defaults.environment),
    action: value('--action', defaults.action),
    camera: value('--camera', defaults.camera),
    lens: value('--lens', defaults.lens),
    focal: value('--focal', defaults.focal),
    aperture: value('--aperture', defaults.aperture),
    framing: value('--framing', defaults.framing),
    angle: value('--angle', defaults.angle),
    movement: value('--movement', defaults.movement),
    lighting: value('--lighting', defaults.lighting),
    palette: value('--palette', defaults.palette),
    atmosphere: value('--atmosphere', defaults.atmosphere),
    style: value('--style', defaults.style),
    aspect: value('--aspect', defaults.aspect),
    brandPreset: value('--preset', defaults.brandPreset),
    visualFunction: value('--function', defaults.visualFunction),
    outputLanguage: language(),
  };
}

if (command === 'status') {
  print({
    name: 'Abrxs Vision Art Creator',
    version: '0.3.0',
    localCore: true,
    promptStandard: 'ABRAXAS production-spec v0.3',
    offline: ['prompt', 'prompt-audit', 'carousel', 'storyboard', 'project-store', 'basic-image-analysis', 'basic-video-metadata'],
    presets: brandPresets.map((preset) => preset.id),
    providers: { promptOnly: 'ready', nvidia: 'adapter-next', gemini: 'adapter-next', higgsfield: 'prepared', comfyui: 'prepared' },
  });
  process.exit(0);
}

if (command === 'prompt') {
  print(compilePrompt(promptState()));
  process.exit(0);
}

if (command === 'audit') {
  print(auditPrompt(promptState()));
  process.exit(0);
}

if (command === 'carousel') {
  const title = value('--title', 'A clear decision needs a visible criterion');
  const body = value('--body', 'Show the mechanism, not a decorative summary.');
  const role = value('--role', 'HOOK').toUpperCase() as 'HOOK' | 'CONTEXT' | 'PROGRESSION' | 'MECHANISM' | 'PAYOFF';
  const mode = value('--text-mode', 'separate');
  const textMode = mode === 'integrated' || mode === 'clean' ? mode : 'separate';
  print(compileCarouselPromptSpec(
    { number: Number(value('--number', '1')) || 1, title, body, narrativeRole: role },
    value('--style', 'premium editorial visual system'),
    textMode,
    value('--preset', defaults.brandPreset),
    value('--aspect', defaults.aspect),
  ));
  process.exit(0);
}

if (command === 'storyboard') {
  const idea = value('--idea', defaults.idea);
  const grammar = value('--grammar', 'classical') as StoryboardGrammarId;
  const scenes = Number(value('--scenes', '2'));
  const shots = Number(value('--shots', '4'));
  print(generateStoryboard(idea, grammar, scenes, shots, { ...defaults, outputLanguage: language() }));
  process.exit(0);
}

if (command === 'smoke') {
  const prompt = compilePrompt({
    ...defaults,
    idea: 'A founder makes a difficult decision after discovering one concrete operational risk.',
    subject: 'one founder holding a marked decision memo',
    environment: 'quiet real studio office after hours',
    action: 'cross-checking one risk against a written decision criterion',
  });
  const jocPrompt = compilePrompt({
    ...defaults,
    idea: 'Joc makes a decision criterion visible instead of listing services.',
    subject: 'Joc at a real worktable with three decision cards',
    environment: 'restrained editorial studio',
    action: 'placing the criterion card above two task cards to clarify hierarchy',
    brandPreset: 'joc-editorial',
  });
  const carousel = compileCarouselPromptSpec(
    { number: 1, title: 'The client does not buy tasks', body: 'They need a criterion to decide.', narrativeRole: 'HOOK' },
    'editorial conceptual photography',
    'separate',
    'joc-editorial',
    '4:5',
  );
  const board = generateStoryboard('A founder makes a difficult decision.', 'suspense', 2, 4, defaults);
  const failures: string[] = [];

  if (!prompt.imagePrompt.toLowerCase().includes('founder')) failures.push('prompt did not preserve idea/subject');
  if (!prompt.imagePrompt.includes('VISUAL FUNCTION:')) failures.push('image prompt missing visual function');
  if (!prompt.imagePrompt.includes('MATERIAL & TEXTURE:')) failures.push('image prompt missing material/texture');
  if (!prompt.imagePrompt.includes('CONTINUITY:')) failures.push('image prompt missing continuity');
  if (!prompt.productionSpec.includes('OUTPUT CONTRACT:')) failures.push('production spec missing output contract');
  if (prompt.quality.score < 90) failures.push(`default complete prompt quality too low: ${prompt.quality.score}`);
  if (!jocPrompt.imagePrompt.includes('deep wine')) failures.push('JOC preset did not propagate visual DNA');
  if (!carousel.imagePrompt.includes('NEGATIVE CONSTRAINTS:')) failures.push('carousel prompt missing negative constraints');
  if (!carousel.visualDirection || !carousel.continuityNote) failures.push('carousel spec missing visual direction or continuity');
  if (board.shots.length !== 8) failures.push('storyboard shot count mismatch');
  if (!brandPresets.some((preset) => preset.id === 'joc-editorial')) failures.push('JOC visual preset missing');
  if (!storyboardGrammars.length) failures.push('storyboard grammars missing');

  if (failures.length) {
    print({ ok: false, failures });
    process.exit(1);
  }

  print({
    ok: true,
    tests: 12,
    promptQuality: prompt.quality,
    imagePromptChars: prompt.imagePrompt.length,
    productionSpecChars: prompt.productionSpec.length,
    carouselPromptChars: carousel.imagePrompt.length,
    storyboardShots: board.shots.length,
  });
  process.exit(0);
}

print(`Abrxs Vision CLI v0.3\n\nCommands:\n  status\n  prompt --idea "..." [--subject "..."] [--function "..."] [--camera "35mm film"] [--focal "50mm"] [--preset joc-editorial] [--lang auto|en|es]\n  audit --idea "..." [same prompt options]\n  carousel --title "..." --body "..." [--role HOOK|CONTEXT|PROGRESSION|MECHANISM|PAYOFF] [--text-mode integrated|separate|clean] [--preset joc-editorial]\n  storyboard --idea "..." [--grammar suspense] [--scenes 2] [--shots 4] [--lang auto|en|es]\n  smoke`);
