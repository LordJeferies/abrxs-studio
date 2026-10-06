import { brandPresets, compilePrompt, defaults } from '../src/promptEngine';
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

if (command === 'status') {
  print({
    name: 'Abrxs Vision Art Creator',
    version: '0.2.0',
    localCore: true,
    offline: ['prompt', 'carousel', 'storyboard', 'project-store', 'basic-image-analysis', 'basic-video-metadata'],
    providers: { promptOnly: 'ready', nvidia: 'adapter-next', gemini: 'adapter-next', higgsfield: 'prepared', comfyui: 'prepared' },
  });
  process.exit(0);
}

if (command === 'prompt') {
  const idea = value('--idea', defaults.idea);
  const camera = value('--camera', defaults.camera);
  const focal = value('--focal', defaults.focal);
  const preset = value('--preset', defaults.brandPreset);
  const result = compilePrompt({ ...defaults, idea, camera, focal, brandPreset: preset });
  print(result);
  process.exit(0);
}

if (command === 'storyboard') {
  const idea = value('--idea', defaults.idea);
  const grammar = value('--grammar', 'classical') as StoryboardGrammarId;
  const scenes = Number(value('--scenes', '2'));
  const shots = Number(value('--shots', '4'));
  print(generateStoryboard(idea, grammar, scenes, shots, defaults));
  process.exit(0);
}

if (command === 'smoke') {
  const prompt = compilePrompt({ ...defaults, idea: 'A founder makes a difficult decision.' });
  const board = generateStoryboard('A founder makes a difficult decision.', 'suspense', 2, 4, defaults);
  const failures: string[] = [];
  if (!prompt.imagePrompt.includes('founder')) failures.push('prompt did not preserve idea');
  if (!prompt.motionPrompt.toLowerCase().includes('camera movement')) failures.push('motion prompt missing camera movement');
  if (board.shots.length !== 8) failures.push('storyboard shot count mismatch');
  if (!brandPresets.length) failures.push('brand presets missing');
  if (!storyboardGrammars.length) failures.push('storyboard grammars missing');
  if (failures.length) {
    print({ ok: false, failures });
    process.exit(1);
  }
  print({ ok: true, tests: 5, imagePromptChars: prompt.imagePrompt.length, storyboardShots: board.shots.length });
  process.exit(0);
}

print(`Abrxs Vision CLI\n\nCommands:\n  status\n  prompt --idea "..." [--camera "35mm film"] [--focal "50mm"] [--preset clean-editorial]\n  storyboard --idea "..." [--grammar suspense] [--scenes 2] [--shots 4]\n  smoke`);
