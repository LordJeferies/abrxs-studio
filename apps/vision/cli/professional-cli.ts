import { defaults, type DirectorState } from '../src/promptEngine';
import {
  compileProfessionalPrompt,
  professionalBriefDefaults,
  professionalTargetProfiles,
  type OutputType,
  type ProfessionalPromptBrief,
} from '../src/professionalPromptEngine';
import { generationIntents, targetProfiles, type GenerationIntent, type GenerationMode, type GenerationTargetId } from '../src/skillEngine';

const args = process.argv.slice(2);
const command = args[0] ?? 'help';

function value(flag: string, fallback = '') {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function print(data: unknown) {
  process.stdout.write(`${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}\n`);
}

function target(): GenerationTargetId {
  const candidate = value('--target', 'higgsfield-seedance') as GenerationTargetId;
  return targetProfiles.some((item) => item.id === candidate) ? candidate : 'higgsfield-seedance';
}

function mode(): GenerationMode {
  const candidate = value('--mode', 'text-to-video') as GenerationMode;
  const allowed: GenerationMode[] = ['text-to-image', 'image-to-image', 'text-to-video', 'image-to-video', 'video-edit'];
  return allowed.includes(candidate) ? candidate : 'text-to-video';
}

function intent(): GenerationIntent {
  const candidate = value('--intent', 'cinematic') as GenerationIntent;
  return generationIntents.includes(candidate) ? candidate : 'cinematic';
}

function director(): DirectorState {
  return {
    ...defaults,
    idea: value('--idea', defaults.idea),
    subject: value('--subject', defaults.subject),
    environment: value('--environment', defaults.environment),
    action: value('--action', defaults.action),
    focal: value('--focal', defaults.focal),
    framing: value('--framing', defaults.framing),
    angle: value('--angle', defaults.angle),
    movement: value('--movement', defaults.movement),
    lighting: value('--lighting', defaults.lighting),
    palette: value('--palette', defaults.palette),
    aspect: value('--aspect', defaults.aspect),
    brandPreset: value('--preset', defaults.brandPreset),
  };
}

function brief(): ProfessionalPromptBrief {
  const outputType = value('--output-type', professionalBriefDefaults.outputType) as OutputType;
  return {
    ...professionalBriefDefaults,
    objective: value('--objective', professionalBriefDefaults.objective),
    mustHave: value('--must-have', professionalBriefDefaults.mustHave),
    doNotWant: value('--do-not', professionalBriefDefaults.doNotWant),
    outputType,
    outputRequirements: value('--output', professionalBriefDefaults.outputRequirements),
    literalText: value('--literal-text', ''),
    motionIntent: value('--motion', professionalBriefDefaults.motionIntent),
    audioIntent: value('--audio', professionalBriefDefaults.audioIntent),
    referenceInstructions: value('--references', professionalBriefDefaults.referenceInstructions),
    continuityPriority: value('--continuity', professionalBriefDefaults.continuityPriority),
  };
}

if (command === 'targets') {
  print(professionalTargetProfiles());
  process.exit(0);
}

if (command === 'compile' || command === 'prompt') {
  print(compileProfessionalPrompt({
    director: director(),
    target: target(),
    mode: mode(),
    intent: intent(),
    duration: Number(value('--duration', '8')) || 8,
    startImageProvided: args.includes('--start-image'),
    brief: brief(),
  }));
  process.exit(0);
}

if (command === 'audit') {
  const result = compileProfessionalPrompt({ director: director(), target: target(), mode: mode(), intent: intent(), duration: Number(value('--duration', '8')) || 8, startImageProvided: args.includes('--start-image'), brief: brief() });
  print(result.quality);
  process.exit(result.quality.grade === 'D' ? 1 : 0);
}

print(`Abrxs Vision Professional Prompt CLI\n\nCommands:\n  targets\n  compile --idea "..." --target higgsfield-seedance --mode text-to-video --intent cinematic \\\n    --objective "..." --must-have "..." --do-not "..." --output-type cinematic-video --output "..."\n  audit --idea "..." [same options]\n\nCore brief fields:\n  --objective        What the visual must communicate or accomplish\n  --must-have        Required visual decisions/elements\n  --do-not           Failure modes, clichés and exclusions\n  --output-type      hero-image | storyboard-frame | cinematic-video | xroll | carousel-frame | product-shot | reference-analysis\n  --output           Delivery/output requirements\n  --literal-text     Exact text if required (model-sensitive)\n  --motion           Motion intent for video\n  --audio            Sound intent for video\n  --references       Reference-role instructions\n  --continuity       Identity/location/wardrobe/geometry continuity priorities\n`);
