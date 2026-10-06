import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({ command: process.execPath, args: ['--import', 'tsx', 'mcp/professional-server.ts'], cwd: process.cwd(), stderr: 'pipe' });
const client = new Client({ name: 'abrxs-vision-professional-smoke', version: '0.6.0' });

function text(result: { content?: unknown[] }) {
  const item = result.content?.[0] as { type?: string; text?: string } | undefined;
  if (!item?.text) throw new Error('Professional MCP returned no text.');
  return item.text;
}

try {
  await client.connect(transport);
  const tools = await client.listTools();
  const names = tools.tools.map((tool) => tool.name);
  for (const expected of ['vision.pro.targets','vision.pro.compile','vision.pro.audit']) {
    if (!names.includes(expected)) throw new Error(`Missing professional MCP tool: ${expected}`);
  }

  const result = await client.callTool({
    name: 'vision.pro.compile',
    arguments: {
      idea: 'A founder checks one final criterion before signing a difficult agreement.',
      target: 'higgsfield-seedance', mode: 'image-to-video', intent: 'cinematic', duration: 8,
      startImageProvided: true,
      objective: 'Make hesitation resolve into a visible, deliberate decision.',
      mustHave: 'one clear hand action; controlled slow push; stable face; readable decision card',
      doNotWant: 'extra people; random text; face drift; warped hands; neon sci-fi styling',
      outputType: 'cinematic-video',
      outputRequirements: '8-second continuity-safe shot suitable for editorial assembly',
    },
  });
  const packet = JSON.parse(text(result as { content?: unknown[] })) as { targetPrompt: string; negativePrompt: string; outputContract: string; quality: { score: number } };
  if (/^\s*NEGATIVE\s*:/mi.test(packet.targetPrompt)) throw new Error('Seedance target prompt incorrectly uses NEGATIVE syntax.');
  if (!packet.targetPrompt.includes('STABILITY / EXCLUSION CONSTRAINTS')) throw new Error('Seedance target prompt missing positive-constraint translation.');
  if (!packet.negativePrompt.includes('face drift')) throw new Error('Canonical do-not list was not preserved.');
  if (!packet.outputContract.includes('cinematic-video')) throw new Error('Output contract missing output type.');
  if (packet.quality.score < 80) throw new Error(`Professional packet quality unexpectedly low: ${packet.quality.score}`);

  const comfyResult = await client.callTool({
    name: 'vision.pro.compile',
    arguments: { idea: 'A product rotates slowly on a real stone plinth.', target: 'comfyui', mode: 'text-to-image', intent: 'product', doNotWant: 'floating text; duplicate product; warped logo', outputType: 'product-shot' },
  });
  const comfy = JSON.parse(text(comfyResult as { content?: unknown[] })) as { targetPrompt: string };
  if (!comfy.targetPrompt.includes('USER NEGATIVE / DO NOT WANT')) throw new Error('ComfyUI target should preserve a separate negative block.');

  process.stdout.write(`${JSON.stringify({ ok: true, tools: names, score: packet.quality.score }, null, 2)}\n`);
} finally {
  await client.close().catch(() => undefined);
}
