import {
  auditPrompt,
  brandPresets,
  compileCarouselPromptSpec,
  compilePrompt,
  defaults,
  type OutputLanguage,
} from '../src/promptEngine';
import { buildProviderExecutionPlan, providerRegistry, providerForTarget } from '../src/providerRegistry';
import { deriveSceneStructure } from '../src/sceneEngine';
import {
  compileSkillPrompt,
  generationIntents,
  recommendGenerationRoute,
  targetProfiles,
  type GenerationIntent,
  type GenerationMode,
  type GenerationTargetId,
  type VisualReference,
} from '../src/skillEngine';
import { compileShotPackage, generateStoryboard, storyboardGrammars, type StoryboardGrammarId } from '../src/storyboard';
import { higgsfieldCliStatus, listHiggsfieldModels, preflightHiggsfieldGeneration, runHiggsfieldGeneration } from './providerCli';

const args = process.argv.slice(2);
const command = args[0] ?? 'help';

function value(flag: string, fallback = '') {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function values(flag: string) {
  const found: string[] = [];
  for (let index = 0; index < args.length - 1; index += 1) {
    if (args[index] === flag && args[index + 1]) found.push(args[index + 1]);
  }
  return found;
}

function flag(name: string) {
  return args.includes(name);
}

function print(valueToPrint: unknown) {
  process.stdout.write(`${typeof valueToPrint === 'string' ? valueToPrint : JSON.stringify(valueToPrint, null, 2)}\n`);
}

function language(): OutputLanguage {
  const candidate = value('--lang', 'auto');
  return candidate === 'en' || candidate === 'es' ? candidate : 'auto';
}

function mode(): GenerationMode {
  const candidate = value('--mode', 'text-to-video') as GenerationMode;
  const allowed: GenerationMode[] = ['text-to-image', 'image-to-image', 'text-to-video', 'image-to-video', 'video-edit'];
  return allowed.includes(candidate) ? candidate : 'text-to-video';
}

function target(): GenerationTargetId {
  const candidate = value('--target', 'higgsfield-seedance') as GenerationTargetId;
  return targetProfiles.some((profile) => profile.id === candidate) ? candidate : 'higgsfield-seedance';
}

function intent(): GenerationIntent {
  const candidate = value('--intent', 'cinematic') as GenerationIntent;
  return generationIntents.includes(candidate) ? candidate : 'cinematic';
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
    materialTexture: value('--materials', defaults.materialTexture),
    textZones: value('--text-zones', defaults.textZones),
    continuity: value('--continuity', defaults.continuity),
    evidenceConstraints: value('--evidence', defaults.evidenceConstraints),
    outputLanguage: language(),
  };
}

function parsedReferences(): VisualReference[] {
  return values('--ref').map((raw) => {
    const separator = raw.indexOf(':');
    if (separator < 1) return { role: 'look', name: raw };
    return { role: raw.slice(0, separator), name: raw.slice(separator + 1) };
  });
}

function skillCompilation() {
  const references = parsedReferences();
  const startImageProvided = flag('--start-image') || references.some((reference) => String(reference.role).toLowerCase() === 'first-frame');
  return compileSkillPrompt({
    director: promptState(),
    target: target(),
    mode: mode(),
    intent: intent(),
    duration: Number(value('--duration', '8')) || 8,
    references,
    startImageProvided,
    literalText: value('--literal-text', ''),
    audioDirection: value('--audio', ''),
    modelHint: value('--model-hint', ''),
  });
}

if (command === 'status') {
  print({
    name: 'Abrxs Vision Art Creator',
    version: '0.5.0',
    localCore: true,
    promptStandard: 'ABRAXAS production-spec + provider skill engine v0.5',
    offline: ['prompt', 'prompt-audit', 'scene-readiness', 'provider-prompt-compile', 'route-recommendation', 'carousel', 'storyboard', 'project-store', 'basic-image-analysis', 'basic-video-metadata'],
    targets: targetProfiles.map((profile) => profile.id),
    providers: providerRegistry.map((provider) => ({ id: provider.id, readiness: provider.readiness })),
    higgsfieldCli: higgsfieldCliStatus(),
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

if (command === 'scene-audit') {
  const state = promptState();
  const scene = Math.max(1, Number(value('--scene', '1')) || 1);
  const sceneCount = Math.max(scene, Number(value('--scene-count', '1')) || 1);
  print(deriveSceneStructure(
    state.idea,
    state,
    scene,
    sceneCount,
    {
      goal: value('--goal', '') || undefined,
      obstacle: value('--obstacle', '') || undefined,
      tactic: value('--tactic', '') || undefined,
      reversal: value('--reversal', '') || undefined,
      valueShift: value('--value-shift', '') || undefined,
    },
  ));
  process.exit(0);
}

if (command === 'skill' || command === 'provider-prompt') {
  const compilation = skillCompilation();
  print({ ...compilation, executionPlan: buildProviderExecutionPlan(compilation, value('--model', '') || undefined) });
  process.exit(0);
}

if (command === 'route') {
  print(recommendGenerationRoute({
    mode: mode(),
    intent: intent(),
    localOnly: flag('--local-only'),
    identityCritical: flag('--identity-critical'),
    nativeAudio: flag('--native-audio'),
    videoEdit: flag('--video-edit') || mode() === 'video-edit',
    longTake: flag('--long-take'),
    multiShot: flag('--multi-shot'),
    costSensitive: flag('--cost-sensitive'),
  }));
  process.exit(0);
}

if (command === 'providers') {
  print({ providers: providerRegistry, targets: targetProfiles });
  process.exit(0);
}

if (command === 'models') {
  print(listHiggsfieldModels());
  process.exit(0);
}

if (command === 'preflight') {
  const modelId = value('--model', '');
  if (!modelId) {
    print({ ok: false, blocked: true, reason: 'Choose a live Higgsfield model id first with `npm run vision:cli -- models`, then pass --model <id>.' });
    process.exit(2);
  }
  print(preflightHiggsfieldGeneration({
    modelId,
    aspectRatio: value('--aspect', '') || undefined,
    duration: mode().includes('video') ? Number(value('--duration', '8')) || 8 : undefined,
    startImage: value('--start-image', '') || undefined,
    resolution: value('--resolution', '') || undefined,
  }));
  process.exit(0);
}

if (command === 'run') {
  const compilation = skillCompilation();
  const provider = providerForTarget(compilation.target.id);
  if (provider.id !== 'higgsfield') {
    print({ ok: false, blocked: true, reason: `Target ${compilation.target.id} is not executable through the Higgsfield CLI adapter.` });
    process.exit(2);
  }
  const modelId = value('--model', '');
  if (!modelId) {
    print({ ok: false, blocked: true, reason: 'Choose a live Higgsfield model id first with `npm run vision:cli -- models`, then pass --model <id>.' });
    process.exit(2);
  }
  if (mode() === 'image-to-video' && !value('--start-image', '').trim()) {
    print({ ok: false, blocked: true, reason: 'CLI image-to-video execution requires --start-image <local-path-or-media-id>. A semantic identity reference does not substitute the first frame.' });
    process.exit(2);
  }
  print(runHiggsfieldGeneration({
    modelId,
    prompt: compilation.providerPrompt,
    confirmSpend: flag('--confirm-spend'),
    aspectRatio: value('--aspect', '') || undefined,
    duration: mode().includes('video') ? Number(value('--duration', '8')) || 8 : undefined,
    startImage: value('--start-image', '') || undefined,
    resolution: value('--resolution', '') || undefined,
  }));
  process.exit(0);
}

if (command === 'carousel') {
  const title = value('--title', 'A clear decision needs a visible criterion');
  const body = value('--body', 'Show the mechanism, not a decorative summary.');
  const role = value('--role', 'HOOK').toUpperCase() as 'HOOK' | 'CONTEXT' | 'PROGRESSION' | 'MECHANISM' | 'PAYOFF';
  const rawMode = value('--text-mode', 'separate');
  const textMode = rawMode === 'integrated' || rawMode === 'clean' ? rawMode : 'separate';
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
  const board = generateStoryboard(idea, grammar, scenes, shots, { ...promptState(), idea });
  const targetId = target();
  print({
    ...board,
    promptTarget: targetId,
    shotPackages: board.shots.map((shot) => ({ id: shot.id, package: compileShotPackage(shot, promptState(), idea, targetId) })),
  });
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
    'editorial conceptual photography', 'separate', 'joc-editorial', '4:5',
  );
  const weakScene = deriveSceneStructure('A founder reads a document.', { ...defaults, subject: 'the founder', action: 'reads the document' }, 1, 1);
  const strongScene = deriveSceneStructure(
    'A founder must sign the agreement, but one operational risk blocks the decision. She checks the risk against a written criterion. Then she discovers the risk is mitigated and moves from hesitation to commitment.',
    { ...defaults, subject: 'the founder', action: 'checks the risk against a written criterion', visualFunction: 'make the decision change visible' },
    1,
    1,
  );
  const board = generateStoryboard('A founder must sign, but one risk remains. Then the evidence clears the risk and she moves from hesitation to commitment.', 'suspense', 2, 4, defaults);
  const firstFrame: VisualReference = { role: 'first-frame', name: 'approved-shot-01.png' };
  const seedance = compileSkillPrompt({
    director: { ...defaults, idea: 'A founder commits to a difficult decision.', action: 'looks at the final criterion, then signs once' },
    mode: 'image-to-video', target: 'higgsfield-seedance', intent: 'cinematic', duration: 8, references: [firstFrame], startImageProvided: true,
  });
  const cinema = compileSkillPrompt({
    director: { ...defaults, idea: 'Joc explains a decision criterion using one physical card.', brandPreset: 'joc-editorial' },
    mode: 'text-to-image', target: 'higgsfield-cinema', intent: 'education', references: [],
  });
  const routeResult = recommendGenerationRoute({ mode: 'text-to-video', intent: 'social-hook', multiShot: true });
  const executionPlan = buildProviderExecutionPlan(seedance);
  const shotPackage = compileShotPackage(board.shots[0], defaults, board.title, 'higgsfield-seedance');
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
  if (!weakScene.unresolved.includes('obstacle') || !weakScene.unresolved.includes('reversal')) failures.push('scene audit should not invent missing obstacle/reversal');
  if (strongScene.unresolved.length || strongScene.readinessScore <= weakScene.readinessScore) failures.push('explicit scene structure did not improve readiness');
  if (board.shots.length !== 8 || board.continuityContract.length < 5 || board.sceneStructures.length !== 2) failures.push('storyboard continuity/structure/count mismatch');
  if (!seedance.providerPrompt.includes('MOTION DELTA ONLY')) failures.push('Seedance I2V did not switch to motion-delta grammar');
  if (!seedance.timeline.length || seedance.timeline[0].start !== 0) failures.push('Seedance temporal plan missing');
  if (seedance.quality.score < 90) failures.push(`provider skill quality too low: ${seedance.quality.score}`);
  if (cinema.providerPrompt.length > 512) failures.push('Cinema Studio prompt exceeds 512-char target');
  if (routeResult.primary !== 'higgsfield-seedance') failures.push('social/multishot route did not select Seedance lane');
  if (executionPlan.executableNow) failures.push('paid provider execution must remain blocked without explicit model selection');
  if (!shotPackage.providerPrompt || shotPackage.quality.score < 80) failures.push('storyboard shot package not production-ready');
  if (!providerRegistry.some((provider) => provider.id === 'higgsfield')) failures.push('Higgsfield provider registry missing');
  if (!brandPresets.some((preset) => preset.id === 'joc-editorial')) failures.push('JOC visual preset missing');
  if (!storyboardGrammars.length) failures.push('storyboard grammars missing');

  if (failures.length) { print({ ok: false, failures }); process.exit(1); }
  print({
    ok: true,
    tests: 23,
    promptQuality: prompt.quality.score,
    providerSkillQuality: seedance.quality.score,
    weakSceneReadiness: weakScene.readinessScore,
    strongSceneReadiness: strongScene.readinessScore,
    cinemaPromptChars: cinema.providerPrompt.length,
    storyboardShots: board.shots.length,
    providerCount: providerRegistry.length,
  });
  process.exit(0);
}

print(`Abrxs Vision CLI v0.5\n\nCommands:\n  status\n  prompt --idea "..." [--preset joc-editorial] [--lang auto|en|es]\n  audit --idea "..."\n  scene-audit --idea "..." [--goal "..."] [--obstacle "..."] [--tactic "..."] [--reversal "..."] [--value-shift "..."]\n  skill --idea "..." --target higgsfield-seedance --mode text-to-video --intent cinematic --duration 8 [--ref first-frame:path.png]\n  route --mode text-to-video --intent social-hook [--identity-critical] [--native-audio] [--local-only]\n  providers\n  models                         # live Higgsfield model discovery via official CLI\n  preflight --model <live-model-id> [--mode image-to-video --start-image /path/frame.png]\n  run --model <live-model-id> ... --confirm-spend\n  carousel --title "..." --body "..." [--role HOOK] [--preset joc-editorial]\n  storyboard --idea "..." --grammar suspense --target higgsfield-seedance\n  smoke\n\nReference syntax: repeat --ref role:name-or-path. Roles include identity, look, composition, wardrobe, location, motion, product, logo, palette, text-layout, first-frame and last-frame.\n`);
