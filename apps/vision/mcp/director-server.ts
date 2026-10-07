import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  DIRECTOR_CATEGORIES,
  DIRECTOR_OPTIONS,
  DIRECTOR_PRESETS,
  auditDirectorPrompt,
  compileDirectorPrompt,
  recommendPresets,
  selectionsFromPreset,
  type DirectorCategory,
  type DirectorMode,
  type DirectorSelections,
} from '../src/directorFinal';
import { anatomizePromptV25 } from '../src/promptAnatomyV25';

const server = new McpServer({ name: 'abrxs-vision-director', version: '2.5.0' });
const mode = z.enum(['image','video','xroll']).default('video');
const category = z.enum([
  'shot','camera','lens','angle','aperture','focus','shutter','frameRate','whiteBalance','composition','lighting','movement','subjectMotion','environmentMotion','look','atmosphere','material','fx',
]);

const selectionsSchema = z.record(category, z.string()).optional();

server.registerTool('vision.director.get_status', {
  description: 'Return Abrxs Vision V2.5 Director capabilities and catalog counts.',
  inputSchema: {},
}, async () => ({ content: [{ type: 'text', text: JSON.stringify({
  version: '2.5.0',
  role: 'visual prompt improver + cinematic director + ABRAXAS production compiler',
  sourceTruthFirst: true,
  categories: DIRECTOR_CATEGORIES.length,
  visualOptions: DIRECTOR_OPTIONS.length,
  presets: DIRECTOR_PRESETS.length,
  modes: ['image','video','xroll'],
  generation: 'never executed by this MCP server',
}, null, 2) }] }));

server.registerTool('vision.director.list_categories', {
  description: 'List V2.5 cinematic decision categories with plain-language explanations.',
  inputSchema: {},
}, async () => ({ content: [{ type: 'text', text: JSON.stringify(DIRECTOR_CATEGORIES, null, 2) }] }));

server.registerTool('vision.director.list_options', {
  description: 'List visual/cinematic choices for one Director category, including effect, feeling, use/avoid guidance and exact prompt language.',
  inputSchema: { category },
}, async ({ category: selectedCategory }) => ({ content: [{ type: 'text', text: JSON.stringify(DIRECTOR_OPTIONS.filter((item) => item.category === selectedCategory), null, 2) }] }));

server.registerTool('vision.director.list_presets', {
  description: 'List editable V2.5 Director presets. Presets are decision combinations, not locked prompt strings.',
  inputSchema: {},
}, async () => ({ content: [{ type: 'text', text: JSON.stringify(DIRECTOR_PRESETS, null, 2) }] }));

server.registerTool('vision.director.recommend_presets', {
  description: 'Recommend Director presets from a supplied base text/script/idea without changing the source truth.',
  inputSchema: { sourceText: z.string().min(1), mode, limit: z.number().int().min(1).max(12).default(6) },
}, async ({ sourceText, mode: selectedMode, limit }) => ({ content: [{ type: 'text', text: JSON.stringify(recommendPresets(sourceText, selectedMode as DirectorMode, limit), null, 2) }] }));

server.registerTool('vision.director.direct_from_text', {
  description: 'Compile base text/script/idea plus explicit cinematic selections into a production-ready ABRAXAS prompt. Preserves source truth; never calls a generation provider.',
  inputSchema: {
    sourceText: z.string().min(1),
    mode,
    presetId: z.string().optional(),
    selections: selectionsSchema,
    aspect: z.string().optional(),
    duration: z.string().optional(),
    preserveText: z.boolean().default(false),
  },
}, async (input) => {
  const preset = input.presetId ? DIRECTOR_PRESETS.find((item) => item.id === input.presetId) : undefined;
  const explicit = (input.selections || {}) as DirectorSelections;
  const merged = { ...(preset ? selectionsFromPreset(preset) : {}), ...explicit };
  const result = compileDirectorPrompt({
    sourceText: input.sourceText,
    mode: input.mode as DirectorMode,
    selections: merged,
    aspect: input.aspect,
    duration: input.duration,
    preserveText: input.preserveText,
  });
  return { content: [{ type: 'text', text: JSON.stringify({
    sourceText: input.sourceText,
    preset: preset?.id || null,
    result,
    audit: auditDirectorPrompt(result.prompt, input.mode as DirectorMode),
  }, null, 2) }] };
});

server.registerTool('vision.director.audit_prompt', {
  description: 'Audit a prompt for source specificity, observable action, camera/lens, composition, lighting, motion, look, constraints and output contract.',
  inputSchema: { prompt: z.string().min(1), mode },
}, async ({ prompt, mode: selectedMode }) => ({ content: [{ type: 'text', text: JSON.stringify({
  audit: auditDirectorPrompt(prompt, selectedMode as DirectorMode),
  anatomy: anatomizePromptV25(prompt),
}, null, 2) }] }));

server.registerTool('vision.director.improve_selection', {
  description: 'Return candidate exact Director options for improving only a selected prompt fragment. This is a deterministic menu for an agent/user to choose from; it does not silently rewrite the rest of the prompt.',
  inputSchema: {
    selectedText: z.string().min(1),
    category,
    limit: z.number().int().min(1).max(12).default(6),
  },
}, async ({ selectedText, category: selectedCategory, limit }) => {
  const choices = DIRECTOR_OPTIONS.filter((item) => item.category === selectedCategory).slice(0, limit);
  return { content: [{ type: 'text', text: JSON.stringify({
    selectedText,
    category: selectedCategory,
    instruction: 'Choose one option and replace only the selected fragment unless the user explicitly requests a broader rewrite.',
    choices,
  }, null, 2) }] };
});

server.registerTool('vision.director.resolve_recipe', {
  description: 'Expand one preset into exact visual decisions and prompt fragments for review before application.',
  inputSchema: { presetId: z.string().min(1) },
}, async ({ presetId }) => {
  const preset = DIRECTOR_PRESETS.find((item) => item.id === presetId);
  if (!preset) return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: 'Director preset not found.' }) }] };
  const decisions = Object.entries(preset.values).flatMap(([categoryId, optionId]) => {
    const selected = DIRECTOR_OPTIONS.find((item) => item.category === categoryId as DirectorCategory && item.id === optionId);
    return selected ? [{ category: categoryId, ...selected }] : [];
  });
  return { content: [{ type: 'text', text: JSON.stringify({ ok: true, preset, decisions }, null, 2) }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);
