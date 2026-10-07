import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { compileContentVision } from '../src/contentBridge';
import { applyFichaPatches, improveFichaPrompt, parseFichaDocument } from '../src/fichaIntake';
import {
  auditPrompt,
  brandPresets,
  compileCarouselPromptSpec,
  compilePrompt,
  defaults,
  type OutputLanguage,
} from '../src/promptEngine';
import { buildProviderExecutionPlan, providerRegistry } from '../src/providerRegistry';
import { deriveSceneStructure } from '../src/sceneEngine';
import {
  compileSkillPrompt,
  recommendGenerationRoute,
  targetProfiles,
  type GenerationIntent,
  type GenerationMode,
  type GenerationTargetId,
} from '../src/skillEngine';
import { compileShotPackage, generateStoryboard, type StoryboardGrammarId } from '../src/storyboard';
import { compileXRoll, xrollPresets } from '../src/xrollEngine';

const server = new McpServer({ name: 'abrxs-vision', version: '2.0.0' });
const outputLanguage = z.enum(['auto', 'en', 'es']).default('auto');
const generationMode = z.enum(['text-to-image', 'image-to-image', 'text-to-video', 'image-to-video', 'video-edit']);
const generationTarget = z.enum(['generic-production', 'higgsfield-cinema', 'higgsfield-seedance', 'higgsfield-kling', 'veo', 'comfyui', 'nvidia', 'gemini']);
const generationIntent = z.enum(['cinematic', 'social-hook', 'podcast-visual', 'product', 'education', 'documentary', 'dialogue', 'faceless', 'carousel']);
const referenceRole = z.enum(['identity', 'look', 'composition', 'wardrobe', 'location', 'motion', 'product', 'logo', 'palette', 'text-layout', 'first-frame', 'last-frame']);

server.registerTool('vision.get_status', {
  description: 'Return Abrxs Vision V2 local-core, MCP and provider status.', inputSchema: {},
}, async () => ({ content: [{ type: 'text', text: JSON.stringify({
  version: '2.0.0',
  offlineCore: true,
  promptStandard: 'ABRAXAS GenerationSpec + provider compiler',
  promptAudit: true,
  fichaIntake: true,
  contentBridge: true,
  xrollStudio: true,
  storyboard: true,
  providerPromptCompiler: true,
  routeRecommendation: true,
  targets: targetProfiles.map((target) => target.id),
  providers: providerRegistry.map((provider) => ({ id: provider.id, readiness: provider.readiness })),
  presets: brandPresets.map((preset) => preset.id),
  xrollPresets: xrollPresets.map((preset) => preset.id),
}, null, 2) }] }));

server.registerTool('vision.get_provider_registry', {
  description: 'Return the provider/target registry. Prepared cloud providers remain disabled until live credentials and capabilities are validated.', inputSchema: {},
}, async () => ({ content: [{ type: 'text', text: JSON.stringify({ providers: providerRegistry, targets: targetProfiles }, null, 2) }] }));

server.registerTool('vision.compile_prompt_pair', {
  description: 'Compile autonomous production-spec image and motion prompts with continuity, evidence constraints, negatives and a quality audit while preserving director intent.',
  inputSchema: {
    idea: z.string().min(1), subject: z.string().optional(), environment: z.string().optional(), action: z.string().optional(), visualFunction: z.string().optional(),
    camera: z.string().optional(), lens: z.string().optional(), focal: z.string().optional(), aperture: z.string().optional(), framing: z.string().optional(), angle: z.string().optional(), movement: z.string().optional(), lighting: z.string().optional(), palette: z.string().optional(), aspect: z.string().optional(), preset: z.string().optional(), language: outputLanguage,
  },
}, async (input) => {
  const result = compilePrompt({
    ...defaults, idea: input.idea, subject: input.subject ?? defaults.subject, environment: input.environment ?? defaults.environment, action: input.action ?? defaults.action,
    visualFunction: input.visualFunction ?? defaults.visualFunction, camera: input.camera ?? defaults.camera, lens: input.lens ?? defaults.lens, focal: input.focal ?? defaults.focal,
    aperture: input.aperture ?? defaults.aperture, framing: input.framing ?? defaults.framing, angle: input.angle ?? defaults.angle, movement: input.movement ?? defaults.movement,
    lighting: input.lighting ?? defaults.lighting, palette: input.palette ?? defaults.palette, aspect: input.aspect ?? defaults.aspect, brandPreset: input.preset ?? defaults.brandPreset,
    outputLanguage: input.language as OutputLanguage,
  });
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
});

server.registerTool('vision.audit_prompt', {
  description: 'Score a visual direction before generation and report missing production decisions or genericity risks.',
  inputSchema: { idea: z.string().min(1), subject: z.string().optional(), environment: z.string().optional(), action: z.string().optional(), visualFunction: z.string().optional(), preset: z.string().optional(), language: outputLanguage },
}, async (input) => ({ content: [{ type: 'text', text: JSON.stringify(auditPrompt({
  ...defaults, idea: input.idea, subject: input.subject ?? defaults.subject, environment: input.environment ?? defaults.environment, action: input.action ?? defaults.action,
  visualFunction: input.visualFunction ?? defaults.visualFunction, brandPreset: input.preset ?? defaults.brandPreset, outputLanguage: input.language as OutputLanguage,
}), null, 2) }] }));

server.registerTool('vision.compile_xroll', {
  description: 'Create an ABRAXAS XRoll package with a master prompt, independent layer prompts, motion spec, composite spec and QA.',
  inputSchema: {
    idea: z.string().min(1),
    preset: z.string().optional(),
    duration: z.number().min(2).max(20).optional(),
    aspect: z.string().optional(),
    brand: z.string().optional(),
    style: z.string().optional(),
    layers: z.number().int().min(2).max(8).optional(),
    camera: z.string().optional(),
    motion: z.string().optional(),
  },
}, async (input) => {
  const preset = input.preset ? xrollPresets.find((item) => item.id === input.preset) : undefined;
  const result = compileXRoll({
    idea: input.idea,
    preset,
    duration: input.duration,
    aspect: input.aspect,
    brand: input.brand,
    style: input.style,
    layerCount: input.layers,
    camera: input.camera,
    motion: input.motion,
  });
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
});

server.registerTool('vision.list_xroll_presets', {
  description: 'List reusable XRoll structures available in Vision V2.', inputSchema: {},
}, async () => ({ content: [{ type: 'text', text: JSON.stringify(xrollPresets, null, 2) }] }));

server.registerTool('vision.inspect_ficha', {
  description: 'Parse a Geómetra/Content Creator HTML, JSON or TXT ficha without executing it. Returns detected editable prompt slots and context.',
  inputSchema: { filename: z.string().min(1), source: z.string().min(1) },
}, async ({ filename, source }) => {
  const document = parseFichaDocument(filename, source);
  return { content: [{ type: 'text', text: JSON.stringify({
    filename: document.filename,
    sourceType: document.sourceType,
    schema: document.schema,
    scriptId: document.scriptId,
    pieceCount: document.pieceCount,
    warnings: document.warnings,
    slots: document.slots.map((slot) => ({ id: slot.id, label: slot.label, breadcrumb: slot.breadcrumb, kind: slot.kind, prompt: slot.prompt, context: slot.context })),
  }, null, 2) }] };
});

server.registerTool('vision.improve_ficha_prompt', {
  description: 'Improve one detected ficha prompt into an ABRAXAS production-spec prompt without mutating the source document.',
  inputSchema: { filename: z.string().min(1), source: z.string().min(1), slotId: z.string().min(1), language: z.enum(['es', 'en']).default('es') },
}, async ({ filename, source, slotId, language }) => {
  const document = parseFichaDocument(filename, source);
  const slot = document.slots.find((item) => item.id === slotId);
  if (!slot) return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: 'Prompt slot not found.' }) }] };
  const after = improveFichaPrompt(slot, { language });
  return { content: [{ type: 'text', text: JSON.stringify({ ok: true, patch: { slotId, before: slot.prompt, after }, context: slot.context }, null, 2) }] };
});

server.registerTool('vision.patch_ficha', {
  description: 'Apply approved prompt patches to a ficha source and return a new document. The original input is never changed in place.',
  inputSchema: {
    filename: z.string().min(1),
    source: z.string().min(1),
    patches: z.array(z.object({ slotId: z.string().min(1), after: z.string().min(1) })).min(1),
  },
}, async ({ filename, source, patches }) => {
  const document = parseFichaDocument(filename, source);
  const normalized = patches.map((patch) => {
    const slot = document.slots.find((item) => item.id === patch.slotId);
    if (!slot) throw new Error(`Prompt slot not found: ${patch.slotId}`);
    return { slotId: patch.slotId, before: slot.prompt, after: patch.after };
  });
  const output = applyFichaPatches(document, normalized);
  return { content: [{ type: 'text', text: JSON.stringify({ ok: true, filename, sourceType: document.sourceType, output }, null, 2) }] };
});

server.registerTool('vision.compile_content_visual', {
  description: 'Bridge a Content Creator visual intent into Vision V2. Keeps the original prompt draft for audit and can optionally produce an XRoll package.',
  inputSchema: {
    engine: z.enum(['basic', 'vision']).default('vision'),
    contentId: z.string().min(1),
    title: z.string().optional(),
    thesis: z.string().min(1),
    objective: z.string().optional(),
    visualIntent: z.string().optional(),
    visualFunction: z.string().optional(),
    format: z.string().optional(),
    platform: z.string().optional(),
    brandPresetId: z.string().optional(),
    promptDraft: z.string().optional(),
    subject: z.string().optional(),
    environment: z.string().optional(),
    action: z.string().optional(),
    outputLanguage: z.enum(['auto', 'es', 'en']).default('auto'),
    target: generationTarget.default('generic-production'),
    mode: generationMode.optional(),
    intent: generationIntent.optional(),
    xroll: z.boolean().default(false),
    xrollLayers: z.number().int().min(2).max(8).optional(),
  },
}, async (input) => {
  const result = compileContentVision({
    engine: input.engine,
    target: input.target as GenerationTargetId,
    mode: input.mode as GenerationMode | undefined,
    intent: input.intent as GenerationIntent | undefined,
    visual: {
      contentId: input.contentId,
      title: input.title,
      thesis: input.thesis,
      objective: input.objective,
      visualIntent: input.visualIntent,
      visualFunction: input.visualFunction,
      format: input.format,
      platform: input.platform,
      brandPresetId: input.brandPresetId,
      promptDraft: input.promptDraft,
      subject: input.subject,
      environment: input.environment,
      action: input.action,
      outputLanguage: input.outputLanguage,
      xroll: input.xroll ? { enabled: true, layers: input.xrollLayers } : undefined,
    },
  });
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
});

server.registerTool('vision.audit_scene_structure', {
  description: 'Audit whether a scene has enough dramatic structure to justify shot planning or expensive generation. Returns Goal, Obstacle, Tactic, Reversal and Value Shift as explicit, inferred or unresolved; missing structure is not invented silently.',
  inputSchema: {
    idea: z.string().min(1),
    scene: z.number().int().min(1).max(100).default(1),
    sceneCount: z.number().int().min(1).max(100).default(1),
    subject: z.string().optional(),
    action: z.string().optional(),
    visualFunction: z.string().optional(),
    environment: z.string().optional(),
    goal: z.string().optional(),
    obstacle: z.string().optional(),
    tactic: z.string().optional(),
    reversal: z.string().optional(),
    valueShift: z.string().optional(),
  },
}, async (input) => {
  const sceneCount = Math.max(input.scene, input.sceneCount);
  const result = deriveSceneStructure(
    input.idea,
    {
      ...defaults,
      idea: input.idea,
      subject: input.subject ?? defaults.subject,
      action: input.action ?? defaults.action,
      visualFunction: input.visualFunction ?? defaults.visualFunction,
      environment: input.environment ?? defaults.environment,
    },
    input.scene,
    sceneCount,
    {
      goal: input.goal,
      obstacle: input.obstacle,
      tactic: input.tactic,
      reversal: input.reversal,
      valueShift: input.valueShift,
    },
  );
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
});

server.registerTool('vision.compile_provider_prompt', {
  description: 'Compile a provider/model-aware prompt package. This never spends provider credits; it returns the translated prompt, QA gates, continuity, timeline and an execution plan.',
  inputSchema: {
    idea: z.string().min(1),
    target: generationTarget.default('higgsfield-seedance'),
    mode: generationMode.default('text-to-video'),
    intent: generationIntent.default('cinematic'),
    duration: z.number().min(2).max(60).default(8),
    subject: z.string().optional(), environment: z.string().optional(), action: z.string().optional(), visualFunction: z.string().optional(),
    focal: z.string().optional(), framing: z.string().optional(), angle: z.string().optional(), movement: z.string().optional(), lighting: z.string().optional(), preset: z.string().optional(),
    language: outputLanguage,
    startImageProvided: z.boolean().default(false),
    literalText: z.string().optional(), audioDirection: z.string().optional(), modelHint: z.string().optional(), modelId: z.string().optional(),
    references: z.array(z.object({ name: z.string().min(1), role: referenceRole, note: z.string().optional() })).default([]),
  },
}, async (input) => {
  const compilation = compileSkillPrompt({
    director: {
      ...defaults, idea: input.idea, subject: input.subject ?? defaults.subject, environment: input.environment ?? defaults.environment, action: input.action ?? defaults.action,
      visualFunction: input.visualFunction ?? defaults.visualFunction, focal: input.focal ?? defaults.focal, framing: input.framing ?? defaults.framing, angle: input.angle ?? defaults.angle,
      movement: input.movement ?? defaults.movement, lighting: input.lighting ?? defaults.lighting, brandPreset: input.preset ?? defaults.brandPreset, outputLanguage: input.language as OutputLanguage,
    },
    target: input.target as GenerationTargetId,
    mode: input.mode as GenerationMode,
    intent: input.intent as GenerationIntent,
    duration: input.duration,
    references: input.references,
    startImageProvided: input.startImageProvided,
    literalText: input.literalText,
    audioDirection: input.audioDirection,
    modelHint: input.modelHint,
  });
  return { content: [{ type: 'text', text: JSON.stringify({ ...compilation, executionPlan: buildProviderExecutionPlan(compilation, input.modelId) }, null, 2) }] };
});

server.registerTool('vision.recommend_generation_route', {
  description: 'Recommend an image/video target lane from task requirements. Live model capability discovery is still required before cloud execution.',
  inputSchema: {
    mode: generationMode,
    intent: generationIntent.optional(),
    localOnly: z.boolean().optional(), identityCritical: z.boolean().optional(), nativeAudio: z.boolean().optional(), videoEdit: z.boolean().optional(), longTake: z.boolean().optional(), multiShot: z.boolean().optional(), costSensitive: z.boolean().optional(),
  },
}, async (input) => ({ content: [{ type: 'text', text: JSON.stringify(recommendGenerationRoute({
  mode: input.mode as GenerationMode,
  intent: input.intent as GenerationIntent | undefined,
  localOnly: input.localOnly, identityCritical: input.identityCritical, nativeAudio: input.nativeAudio, videoEdit: input.videoEdit, longTake: input.longTake, multiShot: input.multiShot, costSensitive: input.costSensitive,
}), null, 2) }] }));

server.registerTool('vision.compile_carousel_prompt', {
  description: 'Compile an autonomous carousel-slide production prompt with narrative role, visual direction, continuity and negative constraints.',
  inputSchema: { number: z.number().int().min(1).default(1), title: z.string().min(1), body: z.string().default(''), role: z.enum(['HOOK', 'CONTEXT', 'PROGRESSION', 'MECHANISM', 'PAYOFF']).default('PROGRESSION'), style: z.string().default('premium editorial visual system'), textMode: z.enum(['integrated', 'separate', 'clean']).default('separate'), preset: z.string().default(defaults.brandPreset), aspect: z.string().default(defaults.aspect) },
}, async (input) => ({ content: [{ type: 'text', text: JSON.stringify(compileCarouselPromptSpec({ number: input.number, title: input.title, body: input.body, narrativeRole: input.role }, input.style, input.textMode, input.preset, input.aspect), null, 2) }] }));

server.registerTool('vision.create_storyboard', {
  description: 'Create an offline storyboard with scene-readiness structure and continuity contracts from a cinematic grammar.',
  inputSchema: { idea: z.string().min(1), grammar: z.enum(['classical', 'suspense', 'dialogue', 'emotional', 'documentary', 'montage', 'product', 'social']).default('classical'), scenes: z.number().int().min(1).max(12).default(2), shotsPerScene: z.number().int().min(1).max(12).default(4) },
}, async ({ idea, grammar, scenes, shotsPerScene }) => ({ content: [{ type: 'text', text: JSON.stringify(generateStoryboard(idea, grammar as StoryboardGrammarId, scenes, shotsPerScene, defaults), null, 2) }] }));

server.registerTool('vision.compile_storyboard_shot', {
  description: 'Compile one storyboard shot through a target-specific provider grammar while preserving scene structure and continuity.',
  inputSchema: {
    idea: z.string().min(1), grammar: z.enum(['classical', 'suspense', 'dialogue', 'emotional', 'documentary', 'montage', 'product', 'social']).default('classical'),
    scene: z.number().int().min(1).max(12).default(1), shot: z.number().int().min(1).max(12).default(1), target: generationTarget.default('higgsfield-seedance'), preset: z.string().default(defaults.brandPreset),
  },
}, async (input) => {
  const board = generateStoryboard(input.idea, input.grammar as StoryboardGrammarId, Math.max(1, input.scene), Math.max(1, input.shot), { ...defaults, idea: input.idea, brandPreset: input.preset });
  const selected = board.shots.find((item) => item.scene === input.scene && item.shot === input.shot);
  if (!selected) return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: 'Requested shot does not exist.' }) }] };
  const compiled = compileShotPackage(selected, { ...defaults, idea: input.idea, brandPreset: input.preset }, input.idea, input.target as GenerationTargetId);
  return { content: [{ type: 'text', text: JSON.stringify({ shot: selected, compiled }, null, 2) }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);
