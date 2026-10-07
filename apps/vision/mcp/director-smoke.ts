import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({ command: process.execPath, args: ['--import', 'tsx', 'mcp/director-server.ts'], cwd: process.cwd(), stderr: 'pipe' });
const client = new Client({ name: 'abrxs-vision-director-smoke', version: '2.5.0' });

function firstText(result: { content?: unknown[] }) {
  const item = result.content?.[0] as { type?: string; text?: string } | undefined;
  if (!item || item.type !== 'text' || !item.text) throw new Error('Director MCP returned no text content.');
  return item.text;
}

try {
  await client.connect(transport);
  const tools = await client.listTools();
  const names = tools.tools.map((tool) => tool.name).sort();
  const expected = [
    'vision.director.audit_prompt',
    'vision.director.direct_from_text',
    'vision.director.get_status',
    'vision.director.improve_selection',
    'vision.director.list_categories',
    'vision.director.list_options',
    'vision.director.list_presets',
    'vision.director.recommend_presets',
    'vision.director.resolve_recipe',
  ];
  for (const name of expected) if (!names.includes(name)) throw new Error(`Missing Director MCP tool: ${name}`);

  const statusResult = await client.callTool({ name: 'vision.director.get_status', arguments: {} });
  const status = JSON.parse(firstText(statusResult as { content?: unknown[] })) as { version?: string; categories?: number; visualOptions?: number; presets?: number };
  if (status.version !== '2.5.0' || (status.categories ?? 0) < 18 || (status.visualOptions ?? 0) < 100 || (status.presets ?? 0) < 15) throw new Error('Director MCP status does not expose the final V2.5 catalog.');

  const recommendResult = await client.callTool({ name: 'vision.director.recommend_presets', arguments: { sourceText: 'A decision-maker compares equivalent proposals but has no criterion, creating quiet internal pressure.', mode: 'video', limit: 5 } });
  const recommendations = JSON.parse(firstText(recommendResult as { content?: unknown[] })) as Array<{ id: string }>;
  if (!recommendations.some((item) => item.id === 'intimate-pressure')) throw new Error('Director MCP did not recommend intimate-pressure for decision tension.');

  const directResult = await client.callTool({ name: 'vision.director.direct_from_text', arguments: {
    sourceText: 'A decision-maker compares three proposals and stops before choosing because no criterion is visible.',
    mode: 'video', presetId: 'intimate-pressure', aspect: '9:16', duration: '7 seconds',
  } });
  const directed = JSON.parse(firstText(directResult as { content?: unknown[] })) as { result?: { prompt?: string; decisions?: unknown[] }; audit?: { score?: number } };
  const prompt = directed.result?.prompt || '';
  if (!prompt.includes('SOURCE TRUTH') || !prompt.includes('CAMERA / OPTICS / EXPOSURE') || !prompt.includes('85mm') || !prompt.includes('24 fps')) throw new Error('Director MCP prompt is missing V2.5 production direction.');
  if ((directed.audit?.score ?? 0) < 90) throw new Error(`Director MCP audit too low: ${directed.audit?.score}`);

  const optionsResult = await client.callTool({ name: 'vision.director.list_options', arguments: { category: 'lighting' } });
  const lighting = JSON.parse(firstText(optionsResult as { content?: unknown[] })) as Array<{ id: string; prompt?: string }>;
  if (lighting.length < 8 || !lighting.some((item) => item.id === 'soft-side')) throw new Error('Director MCP lighting library is incomplete.');

  const improveResult = await client.callTool({ name: 'vision.director.improve_selection', arguments: { selectedText: 'cinematic lighting', category: 'lighting', limit: 5 } });
  const improvement = JSON.parse(firstText(improveResult as { content?: unknown[] })) as { choices?: unknown[]; instruction?: string };
  if ((improvement.choices?.length ?? 0) !== 5 || !improvement.instruction?.includes('selected fragment')) throw new Error('Director MCP selected-text workflow is incomplete.');

  process.stdout.write(`${JSON.stringify({ ok: true, version: status.version, tools: names, categories: status.categories, visualOptions: status.visualOptions, presets: status.presets, promptScore: directed.audit?.score }, null, 2)}\n`);
} finally {
  await client.close().catch(() => undefined);
}
