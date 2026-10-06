import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  auditPrompt,
  brandPresets,
  compileCarouselPromptSpec,
  compilePrompt,
  defaults,
  type OutputLanguage,
} from '../src/promptEngine';
import { generateStoryboard, type StoryboardGrammarId } from '../src/storyboard';

const server = new McpServer({ name: 'abrxs-vision', version: '0.3.0' });
const outputLanguage = z.enum(['auto', 'en', 'es']).default('auto');

server.registerTool('vision.get_status', {
  description: 'Return Abrxs Vision local-core, prompt-standard and provider status.',
  inputSchema: {},
}, async () => ({
  content: [{
    type: 'text',
    text: JSON.stringify({
      version: '0.3.0',
      offlineCore: true,
      promptStandard: 'ABRAXAS production-spec v0.3',
      promptOnly: true,
      promptAudit: true,
      carouselCompiler: true,
      presets: brandPresets.map((preset) => preset.id),
      nvidia: 'next',
      gemini: 'next',
    }, null, 2),
  }],
}));

server.registerTool('vision.compile_prompt_pair', {
  description: 'Compile autonomous production-spec image and motion prompts with continuity, evidence constraints, negatives and a quality audit while preserving director intent.',
  inputSchema: {
    idea: z.string().min(1),
    subject: z.string().optional(),
    environment: z.string().optional(),
    action: z.string().optional(),
    visualFunction: z.string().optional(),
    camera: z.string().optional(),
    lens: z.string().optional(),
    focal: z.string().optional(),
    aperture: z.string().optional(),
    framing: z.string().optional(),
    angle: z.string().optional(),
    movement: z.string().optional(),
    lighting: z.string().optional(),
    palette: z.string().optional(),
    aspect: z.string().optional(),
    preset: z.string().optional(),
    language: outputLanguage,
  },
}, async (input) => {
  const result = compilePrompt({
    ...defaults,
    idea: input.idea,
    subject: input.subject ?? defaults.subject,
    environment: input.environment ?? defaults.environment,
    action: input.action ?? defaults.action,
    visualFunction: input.visualFunction ?? defaults.visualFunction,
    camera: input.camera ?? defaults.camera,
    lens: input.lens ?? defaults.lens,
    focal: input.focal ?? defaults.focal,
    aperture: input.aperture ?? defaults.aperture,
    framing: input.framing ?? defaults.framing,
    angle: input.angle ?? defaults.angle,
    movement: input.movement ?? defaults.movement,
    lighting: input.lighting ?? defaults.lighting,
    palette: input.palette ?? defaults.palette,
    aspect: input.aspect ?? defaults.aspect,
    brandPreset: input.preset ?? defaults.brandPreset,
    outputLanguage: input.language as OutputLanguage,
  });
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
});

server.registerTool('vision.audit_prompt', {
  description: 'Score a visual direction before generation and report missing production decisions or genericity risks.',
  inputSchema: {
    idea: z.string().min(1),
    subject: z.string().optional(),
    environment: z.string().optional(),
    action: z.string().optional(),
    visualFunction: z.string().optional(),
    preset: z.string().optional(),
    language: outputLanguage,
  },
}, async (input) => {
  const result = auditPrompt({
    ...defaults,
    idea: input.idea,
    subject: input.subject ?? defaults.subject,
    environment: input.environment ?? defaults.environment,
    action: input.action ?? defaults.action,
    visualFunction: input.visualFunction ?? defaults.visualFunction,
    brandPreset: input.preset ?? defaults.brandPreset,
    outputLanguage: input.language as OutputLanguage,
  });
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
});

server.registerTool('vision.compile_carousel_prompt', {
  description: 'Compile an autonomous carousel-slide production prompt with narrative role, visual direction, continuity and negative constraints.',
  inputSchema: {
    number: z.number().int().min(1).default(1),
    title: z.string().min(1),
    body: z.string().default(''),
    role: z.enum(['HOOK', 'CONTEXT', 'PROGRESSION', 'MECHANISM', 'PAYOFF']).default('PROGRESSION'),
    style: z.string().default('premium editorial visual system'),
    textMode: z.enum(['integrated', 'separate', 'clean']).default('separate'),
    preset: z.string().default(defaults.brandPreset),
    aspect: z.string().default(defaults.aspect),
  },
}, async (input) => {
  const result = compileCarouselPromptSpec(
    { number: input.number, title: input.title, body: input.body, narrativeRole: input.role },
    input.style,
    input.textMode,
    input.preset,
    input.aspect,
  );
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
});

server.registerTool('vision.create_storyboard', {
  description: 'Create an offline storyboard from a cinematic grammar.',
  inputSchema: {
    idea: z.string().min(1),
    grammar: z.enum(['classical', 'suspense', 'dialogue', 'emotional', 'documentary', 'montage', 'product', 'social']).default('classical'),
    scenes: z.number().int().min(1).max(12).default(2),
    shotsPerScene: z.number().int().min(1).max(12).default(4),
  },
}, async ({ idea, grammar, scenes, shotsPerScene }) => {
  const result = generateStoryboard(idea, grammar as StoryboardGrammarId, scenes, shotsPerScene, defaults);
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);
