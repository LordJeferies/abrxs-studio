import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({ command: process.execPath, args: ['--import', 'tsx', 'mcp/server.ts'], cwd: process.cwd(), stderr: 'pipe' });
const client = new Client({ name: 'abrxs-vision-smoke', version: '2.0.0' });

function firstText(result: { content?: unknown[] }) {
  const item = result.content?.[0] as { type?: string; text?: string } | undefined;
  if (!item || item.type !== 'text' || !item.text) throw new Error('MCP tool returned no text content.');
  return item.text;
}

try {
  await client.connect(transport);
  const tools = await client.listTools();
  const names = tools.tools.map((tool) => tool.name).sort();
  const expected = [
    'vision.audit_prompt',
    'vision.audit_scene_structure',
    'vision.compile_carousel_prompt',
    'vision.compile_content_visual',
    'vision.compile_prompt_pair',
    'vision.compile_provider_prompt',
    'vision.compile_storyboard_shot',
    'vision.compile_xroll',
    'vision.create_storyboard',
    'vision.get_provider_registry',
    'vision.get_status',
    'vision.improve_ficha_prompt',
    'vision.inspect_ficha',
    'vision.list_xroll_presets',
    'vision.patch_ficha',
    'vision.recommend_generation_route',
  ];
  for (const name of expected) if (!names.includes(name)) throw new Error(`Missing MCP tool: ${name}`);

  const statusResult = await client.callTool({ name: 'vision.get_status', arguments: {} });
  const status = JSON.parse(firstText(statusResult as { content?: unknown[] })) as { version?: string; xrollStudio?: boolean; fichaIntake?: boolean; contentBridge?: boolean };
  if (status.version !== '2.0.0' || !status.xrollStudio || !status.fichaIntake || !status.contentBridge) throw new Error('Vision MCP did not report the V2 control surface.');

  const promptResult = await client.callTool({ name: 'vision.compile_prompt_pair', arguments: { idea: 'Joc makes a client decision criterion visible instead of listing tasks.', subject: 'Joc at a real worktable with three decision cards', action: 'placing one criterion card above two task cards', preset: 'joc-editorial', focal: '50mm', language: 'en' } });
  const prompt = JSON.parse(firstText(promptResult as { content?: unknown[] })) as { imagePrompt: string; productionSpec: string; quality: { score: number } };
  if (!prompt.imagePrompt.includes('VISUAL FUNCTION:')) throw new Error('MCP prompt missing visual function.');
  if (!prompt.productionSpec.includes('OUTPUT CONTRACT:')) throw new Error('MCP prompt missing production output contract.');
  if (prompt.quality.score < 90) throw new Error(`MCP prompt quality unexpectedly low: ${prompt.quality.score}`);

  const auditResult = await client.callTool({ name: 'vision.audit_prompt', arguments: { idea: 'premium cinematic professional', language: 'en' } });
  const audit = JSON.parse(firstText(auditResult as { content?: unknown[] })) as { warnings: string[] };
  if (!audit.warnings.length) throw new Error('MCP audit did not flag an underspecified generic idea.');

  const xrollResult = await client.callTool({ name: 'vision.compile_xroll', arguments: { idea: 'A pipeline looks full but no opportunity has a next action.', preset: 'data-focus', layers: 5, aspect: '9:16' } });
  const xroll = JSON.parse(firstText(xrollResult as { content?: unknown[] })) as { schema?: string; layers?: unknown[]; masterPrompt?: string; motionPrompt?: string; compositeSpec?: string };
  if (xroll.schema !== 'abrxs.vision.xroll.v2' || xroll.layers?.length !== 5 || !xroll.masterPrompt || !xroll.motionPrompt || !xroll.compositeSpec) throw new Error('MCP XRoll compiler returned an incomplete package.');

  const fichaJson = JSON.stringify({ schema: 'abrxs.test', pieces: [{ id: 'piece-1', title: 'Decision card', prompt_override: 'cinematic businessman deciding', assets: [{ id: 'asset-1', visual: 'criterion card', promptNoText: 'business card image' }] }] });
  const inspectResult = await client.callTool({ name: 'vision.inspect_ficha', arguments: { filename: 'sample.json', source: fichaJson } });
  const inspect = JSON.parse(firstText(inspectResult as { content?: unknown[] })) as { slots?: Array<{ id: string; kind: string }> };
  if ((inspect.slots?.length ?? 0) < 2) throw new Error('MCP ficha intake did not detect expected prompt slots.');
  const slotId = inspect.slots?.[0]?.id;
  if (!slotId) throw new Error('MCP ficha intake returned no slot id.');

  const improveResult = await client.callTool({ name: 'vision.improve_ficha_prompt', arguments: { filename: 'sample.json', source: fichaJson, slotId, language: 'en' } });
  const improvement = JSON.parse(firstText(improveResult as { content?: unknown[] })) as { patch?: { before?: string; after?: string } };
  if (!improvement.patch?.after || improvement.patch.after === improvement.patch.before) throw new Error('MCP ficha improver did not produce a staged prompt patch.');

  const patchResult = await client.callTool({ name: 'vision.patch_ficha', arguments: { filename: 'sample.json', source: fichaJson, patches: [{ slotId, after: improvement.patch.after }] } });
  const patched = JSON.parse(firstText(patchResult as { content?: unknown[] })) as { ok?: boolean; output?: string };
  if (!patched.ok || !patched.output?.includes('ABRAXAS')) throw new Error('MCP ficha patch did not produce an updated copy.');

  const bridgeResult = await client.callTool({ name: 'vision.compile_content_visual', arguments: { engine: 'vision', contentId: 'JOC-001', thesis: 'The buyer needs a criterion, not more tasks.', visualIntent: 'Make the criterion visibly reorganize several equivalent options.', format: 'vertical reel 9:16', brandPresetId: 'joc-editorial', xroll: true, xrollLayers: 4 } });
  const bridge = JSON.parse(firstText(bridgeResult as { content?: unknown[] })) as { schema?: string; engine?: string; prompt?: unknown; xroll?: { layers?: unknown[] } };
  if (bridge.schema !== 'abrxs.vision.content-bridge.v2' || bridge.engine !== 'vision' || !bridge.prompt || bridge.xroll?.layers?.length !== 4) throw new Error('MCP Content Bridge did not return a Vision V2 package.');

  const weakSceneResult = await client.callTool({
    name: 'vision.audit_scene_structure',
    arguments: { idea: 'A founder sits at a desk and reads a document.', subject: 'the founder', action: 'reads the document', scene: 1, sceneCount: 1 },
  });
  const weakScene = JSON.parse(firstText(weakSceneResult as { content?: unknown[] })) as { readinessScore: number; unresolved: string[] };
  if (!weakScene.unresolved.includes('obstacle') || !weakScene.unresolved.includes('reversal')) throw new Error('Scene audit invented or failed to flag missing obstacle/reversal.');

  const strongSceneResult = await client.callTool({
    name: 'vision.audit_scene_structure',
    arguments: {
      idea: 'A founder must decide whether to sign the agreement, but a hidden operational risk blocks the decision. She cross-checks the risk against a written criterion. Then she discovers the risk is already mitigated and moves from hesitation to commitment.',
      subject: 'the founder',
      action: 'cross-checks the risk against a written criterion',
      visualFunction: 'make the decision criterion and change of conviction visible',
      scene: 1,
      sceneCount: 1,
    },
  });
  const strongScene = JSON.parse(firstText(strongSceneResult as { content?: unknown[] })) as { readinessScore: number; unresolved: string[] };
  if (strongScene.readinessScore <= weakScene.readinessScore || strongScene.unresolved.length) throw new Error('Scene audit did not reward explicit structure.');

  const providerResult = await client.callTool({
    name: 'vision.compile_provider_prompt',
    arguments: {
      idea: 'A founder commits to the decision after checking one final criterion.', mode: 'image-to-video', target: 'higgsfield-seedance', intent: 'cinematic', duration: 8,
      references: [{ name: 'approved-shot-01.png', role: 'first-frame' }], startImageProvided: true,
    },
  });
  const provider = JSON.parse(firstText(providerResult as { content?: unknown[] })) as { providerPrompt: string; quality: { score: number }; timeline: unknown[]; executionPlan: { executableNow: boolean } };
  if (!provider.providerPrompt.includes('MOTION DELTA ONLY')) throw new Error('MCP Seedance I2V did not use motion-delta grammar.');
  if (provider.quality.score < 90) throw new Error(`MCP provider prompt quality unexpectedly low: ${provider.quality.score}`);
  if (!provider.timeline.length) throw new Error('MCP provider prompt missing temporal plan.');
  if (provider.executionPlan.executableNow) throw new Error('MCP provider execution should be blocked without live model selection.');

  const routeResult = await client.callTool({ name: 'vision.recommend_generation_route', arguments: { mode: 'text-to-video', intent: 'social-hook', multiShot: true } });
  const route = JSON.parse(firstText(routeResult as { content?: unknown[] })) as { primary: string };
  if (route.primary !== 'higgsfield-seedance') throw new Error('MCP route recommendation mismatch.');

  const registryResult = await client.callTool({ name: 'vision.get_provider_registry', arguments: {} });
  const registry = JSON.parse(firstText(registryResult as { content?: unknown[] })) as { providers: Array<{ id: string }>; targets: Array<{ id: string }> };
  if (!registry.providers.some((item) => item.id === 'higgsfield')) throw new Error('MCP provider registry missing Higgsfield.');
  if (!registry.targets.some((item) => item.id === 'comfyui')) throw new Error('MCP target registry missing ComfyUI.');

  const carouselResult = await client.callTool({ name: 'vision.compile_carousel_prompt', arguments: { title: 'The client does not buy tasks', body: 'They need a criterion to decide.', role: 'HOOK', preset: 'joc-editorial', textMode: 'separate', aspect: '4:5' } });
  const carousel = JSON.parse(firstText(carouselResult as { content?: unknown[] })) as { imagePrompt: string; continuityNote: string };
  if (!carousel.imagePrompt.includes('NEGATIVE CONSTRAINTS:')) throw new Error('MCP carousel prompt missing negative constraints.');
  if (!carousel.continuityNote) throw new Error('MCP carousel prompt missing continuity note.');

  const storyboardResult = await client.callTool({ name: 'vision.create_storyboard', arguments: { idea: 'A founder hesitates before signing a decisive agreement because one operational risk remains unresolved. Then the final evidence clears the risk and she moves from hesitation to commitment.', grammar: 'suspense', scenes: 2, shotsPerScene: 4 } });
  const storyboard = JSON.parse(firstText(storyboardResult as { content?: unknown[] })) as { shots?: unknown[]; continuityContract?: unknown[]; sceneStructures?: unknown[]; readinessScore?: number };
  if (storyboard.shots?.length !== 8) throw new Error('Storyboard MCP tool returned unexpected shot count.');
  if (!storyboard.continuityContract?.length) throw new Error('Storyboard MCP tool missing continuity contract.');
  if (!storyboard.sceneStructures?.length || (storyboard.readinessScore ?? 0) <= 0) throw new Error('Storyboard MCP tool missing scene readiness structure.');

  const shotResult = await client.callTool({ name: 'vision.compile_storyboard_shot', arguments: { idea: 'A founder hesitates before signing because one risk remains, then discovers the risk is mitigated.', grammar: 'suspense', scene: 1, shot: 1, target: 'higgsfield-seedance' } });
  const shot = JSON.parse(firstText(shotResult as { content?: unknown[] })) as { compiled?: { providerPrompt?: string; quality?: { score: number } }; shot?: { sceneStructure?: unknown } };
  if (!shot.compiled?.providerPrompt || (shot.compiled.quality?.score ?? 0) < 80) throw new Error('Storyboard shot compiler did not return a usable provider package.');
  if (!shot.shot?.sceneStructure) throw new Error('Storyboard shot package did not preserve scene structure.');

  process.stdout.write(`${JSON.stringify({ ok: true, version: status.version, tools: names, promptQuality: prompt.quality.score, providerQuality: provider.quality.score, xrollLayers: xroll.layers?.length, fichaSlots: inspect.slots?.length, weakScene: weakScene.readinessScore, strongScene: strongScene.readinessScore }, null, 2)}\n`);
} finally {
  await client.close().catch(() => undefined);
}
