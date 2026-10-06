import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { compilePrompt, defaults } from '../src/promptEngine';
import { generateStoryboard, type StoryboardGrammarId } from '../src/storyboard';

const server = new McpServer({ name: 'abrxs-vision', version: '0.2.0' });

server.registerTool('vision.get_status', {
  description: 'Return Abrxs Vision local-core and provider status.',
  inputSchema: {},
}, async () => ({
  content: [{ type: 'text', text: JSON.stringify({ version: '0.2.0', offlineCore: true, promptOnly: true, nvidia: 'next', gemini: 'next' }, null, 2) }],
}));

server.registerTool('vision.compile_prompt_pair', {
  description: 'Compile a cinematic image prompt and motion prompt while preserving director intent.',
  inputSchema: {
    idea: z.string().min(1),
    camera: z.string().optional(),
    focal: z.string().optional(),
    preset: z.string().optional(),
  },
}, async ({ idea, camera, focal, preset }) => {
  const result = compilePrompt({ ...defaults, idea, camera: camera ?? defaults.camera, focal: focal ?? defaults.focal, brandPreset: preset ?? defaults.brandPreset });
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
