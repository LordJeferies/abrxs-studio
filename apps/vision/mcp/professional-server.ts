import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { outputProfiles } from '../src/outputProfiles';
import { defaults } from '../src/promptEngine';
import { compileProfessionalPrompt, professionalBriefDefaults, professionalTargetProfiles } from '../src/professionalPromptEngine';

const server = new McpServer({ name: 'abrxs-vision-professional', version: '0.6.0' });
const target = z.enum(['generic-production','higgsfield-cinema','higgsfield-seedance','higgsfield-kling','veo','comfyui','nvidia','gemini']);
const mode = z.enum(['text-to-image','image-to-image','text-to-video','image-to-video','video-edit']);
const intent = z.enum(['cinematic','social-hook','podcast-visual','product','education','documentary','dialogue','faceless','carousel']);
const outputType = z.enum(['hero-image','storyboard-frame','carousel-slide','xroll-still','cinematic-shot','xroll-video','product-hero','clean-plate','transparent-layer','social-vertical-video','reference-analysis']);

server.registerTool('vision.pro.targets', {
  description: 'Return professional target policies, including prompt regime and how No Prompt/exclusion intent is mapped for each target.', inputSchema: {},
}, async () => ({ content: [{ type: 'text', text: JSON.stringify(professionalTargetProfiles(), null, 2) }] }));

server.registerTool('vision.pro.outputs', {
  description: 'Return supported professional output contracts: deliverables, acceptance rules, text policy, alpha and recommended canvas.', inputSchema: {},
}, async () => ({ content: [{ type: 'text', text: JSON.stringify(outputProfiles, null, 2) }] }));

server.registerTool('vision.pro.compile', {
  description: 'Compile one canonical professional brief into positive direction, canonical No Prompt intent, provider-specific target prompt, output contract, parameter pack, continuity and QA. Exclusions are not blindly sent as negative syntax.',
  inputSchema: {
    idea: z.string().min(1),
    target: target.default('higgsfield-seedance'),
    mode: mode.default('text-to-video'),
    intent: intent.default('cinematic'),
    duration: z.number().min(2).max(60).default(8),
    subject: z.string().optional(), environment: z.string().optional(), action: z.string().optional(),
    focal: z.string().optional(), framing: z.string().optional(), angle: z.string().optional(), movement: z.string().optional(), lighting: z.string().optional(), preset: z.string().optional(), aspect: z.string().optional(),
    objective: z.string().optional(), mustHave: z.string().optional(), doNotWant: z.string().optional(), outputType: outputType.default('cinematic-shot'), outputRequirements: z.string().optional(), literalText: z.string().optional(), performance: z.string().optional(), physicsNotes: z.string().optional(), motionIntent: z.string().optional(), audioIntent: z.string().optional(), referenceInstructions: z.string().optional(), continuityPriority: z.string().optional(), startImageProvided: z.boolean().default(false),
  },
}, async (input) => {
  const packet = compileProfessionalPrompt({
    director: {
      ...defaults,
      idea: input.idea,
      subject: input.subject ?? defaults.subject,
      environment: input.environment ?? defaults.environment,
      action: input.action ?? defaults.action,
      focal: input.focal ?? defaults.focal,
      framing: input.framing ?? defaults.framing,
      angle: input.angle ?? defaults.angle,
      movement: input.movement ?? defaults.movement,
      lighting: input.lighting ?? defaults.lighting,
      brandPreset: input.preset ?? defaults.brandPreset,
      aspect: input.aspect ?? defaults.aspect,
    },
    target: input.target,
    mode: input.mode,
    intent: input.intent,
    duration: input.duration,
    startImageProvided: input.startImageProvided,
    brief: {
      objective: input.objective ?? professionalBriefDefaults.objective,
      mustHave: input.mustHave ?? professionalBriefDefaults.mustHave,
      doNotWant: input.doNotWant ?? professionalBriefDefaults.doNotWant,
      outputType: input.outputType,
      outputRequirements: input.outputRequirements ?? professionalBriefDefaults.outputRequirements,
      literalText: input.literalText ?? '',
      performance: input.performance ?? professionalBriefDefaults.performance,
      physicsNotes: input.physicsNotes ?? professionalBriefDefaults.physicsNotes,
      motionIntent: input.motionIntent ?? professionalBriefDefaults.motionIntent,
      audioIntent: input.audioIntent ?? professionalBriefDefaults.audioIntent,
      referenceInstructions: input.referenceInstructions ?? professionalBriefDefaults.referenceInstructions,
      continuityPriority: input.continuityPriority ?? professionalBriefDefaults.continuityPriority,
    },
  });
  return { content: [{ type: 'text', text: JSON.stringify(packet, null, 2) }] };
});

server.registerTool('vision.pro.audit', {
  description: 'Audit a professional prompt brief for output compatibility, specificity, action/camera load, anti-slop, physical performance, I2V readiness, typography risk, constraint translation and provider prompt budget.',
  inputSchema: { idea: z.string().min(1), target: target.default('higgsfield-seedance'), mode: mode.default('text-to-video'), outputType: outputType.default('cinematic-shot'), doNotWant: z.string().optional(), objective: z.string().optional(), mustHave: z.string().optional(), performance: z.string().optional(), outputRequirements: z.string().optional() },
}, async (input) => {
  const packet = compileProfessionalPrompt({
    director: { ...defaults, idea: input.idea }, target: input.target, mode: input.mode, intent: 'cinematic',
    brief: {
      objective: input.objective ?? professionalBriefDefaults.objective,
      mustHave: input.mustHave ?? professionalBriefDefaults.mustHave,
      doNotWant: input.doNotWant ?? professionalBriefDefaults.doNotWant,
      outputType: input.outputType,
      performance: input.performance ?? professionalBriefDefaults.performance,
      outputRequirements: input.outputRequirements ?? professionalBriefDefaults.outputRequirements,
    },
  });
  return { content: [{ type: 'text', text: JSON.stringify({ quality: packet.quality, outputContract: packet.outputContract, constraintPack: packet.constraintPack, parameterPack: packet.parameterPack }, null, 2) }] };
});

await server.connect(new StdioServerTransport());