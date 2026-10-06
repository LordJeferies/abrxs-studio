import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { defaults } from '../src/promptEngine';
import { compileProfessionalPrompt, professionalBriefDefaults, professionalTargetProfiles } from '../src/professionalPromptEngine';

const server = new McpServer({ name: 'abrxs-vision-professional', version: '0.6.0' });
const target = z.enum(['generic-production','higgsfield-cinema','higgsfield-seedance','higgsfield-kling','veo','comfyui','nvidia','gemini']);
const mode = z.enum(['text-to-image','image-to-image','text-to-video','image-to-video','video-edit']);
const intent = z.enum(['cinematic','social-hook','podcast-visual','product','education','documentary','dialogue','faceless','carousel']);
const outputType = z.enum(['hero-image','storyboard-frame','cinematic-video','xroll','carousel-frame','product-shot','reference-analysis']);

server.registerTool('vision.pro.targets', {
  description: 'Return professional target policies, including negative-prompt strategy and prompt regime.', inputSchema: {},
}, async () => ({ content: [{ type: 'text', text: JSON.stringify(professionalTargetProfiles(), null, 2) }] }));

server.registerTool('vision.pro.compile', {
  description: 'Compile a professional provider-aware prompt packet with What I Want, What I Do Not Want, output contract, continuity, target policy and QA.',
  inputSchema: {
    idea: z.string().min(1),
    target: target.default('higgsfield-seedance'),
    mode: mode.default('text-to-video'),
    intent: intent.default('cinematic'),
    duration: z.number().min(2).max(60).default(8),
    subject: z.string().optional(), environment: z.string().optional(), action: z.string().optional(),
    focal: z.string().optional(), framing: z.string().optional(), angle: z.string().optional(), movement: z.string().optional(), lighting: z.string().optional(), preset: z.string().optional(), aspect: z.string().optional(),
    objective: z.string().optional(), mustHave: z.string().optional(), doNotWant: z.string().optional(), outputType: outputType.default('cinematic-video'), outputRequirements: z.string().optional(), literalText: z.string().optional(), motionIntent: z.string().optional(), audioIntent: z.string().optional(), referenceInstructions: z.string().optional(), continuityPriority: z.string().optional(), startImageProvided: z.boolean().default(false),
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
      motionIntent: input.motionIntent ?? professionalBriefDefaults.motionIntent,
      audioIntent: input.audioIntent ?? professionalBriefDefaults.audioIntent,
      referenceInstructions: input.referenceInstructions ?? professionalBriefDefaults.referenceInstructions,
      continuityPriority: input.continuityPriority ?? professionalBriefDefaults.continuityPriority,
    },
  });
  return { content: [{ type: 'text', text: JSON.stringify(packet, null, 2) }] };
});

server.registerTool('vision.pro.audit', {
  description: 'Audit a professional prompt brief for specificity, action load, anti-slop, performance specificity, I2V readiness, literal text risk and target policy.',
  inputSchema: { idea: z.string().min(1), target: target.default('higgsfield-seedance'), mode: mode.default('text-to-video'), doNotWant: z.string().optional(), objective: z.string().optional(), outputRequirements: z.string().optional() },
}, async (input) => {
  const packet = compileProfessionalPrompt({
    director: { ...defaults, idea: input.idea }, target: input.target, mode: input.mode, intent: 'cinematic',
    brief: { objective: input.objective ?? professionalBriefDefaults.objective, doNotWant: input.doNotWant ?? professionalBriefDefaults.doNotWant, outputRequirements: input.outputRequirements ?? professionalBriefDefaults.outputRequirements },
  });
  return { content: [{ type: 'text', text: JSON.stringify(packet.quality, null, 2) }] };
});

await server.connect(new StdioServerTransport());
