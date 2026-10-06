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
  for (const expected of ['vision.pro.targets','vision.pro.outputs','vision.pro.compile','vision.pro.audit']) {
    if (!names.includes(expected)) throw new Error(`Missing professional MCP tool: ${expected}`);
  }

  const outputsResult = await client.callTool({ name: 'vision.pro.outputs', arguments: {} });
  const outputs = JSON.parse(text(outputsResult as { content?: unknown[] })) as Array<{ id: string; textPolicy: string }>;
  if (!outputs.some((item) => item.id === 'transparent-layer')) throw new Error('Professional output registry missing transparent-layer.');
  if (!outputs.some((item) => item.id === 'social-vertical-video')) throw new Error('Professional output registry missing social-vertical-video.');

  const result = await client.callTool({
    name: 'vision.pro.compile',
    arguments: {
      idea: 'A founder checks one final criterion before signing a difficult agreement.',
      target: 'higgsfield-seedance', mode: 'image-to-video', intent: 'cinematic', duration: 8,
      startImageProvided: true,
      objective: 'Make hesitation resolve into a visible, deliberate decision.',
      mustHave: 'one clear hand action; controlled slow push; stable face; readable decision card',
      doNotWant: 'extra people; random text; face drift; warped hands; neon sci-fi styling',
      outputType: 'cinematic-shot',
      outputRequirements: '8-second continuity-safe shot suitable for editorial assembly',
      performance: 'eyes hold on the final criterion, breath pauses, fingers stop fidgeting before the single signing action',
      physicsNotes: 'paper stays flat on the desk; pen contact and hand weight remain physically credible',
    },
  });
  const packet = JSON.parse(text(result as { content?: unknown[] })) as {
    targetPrompt: string;
    negativePrompt: string;
    outputContract: string;
    constraintPack: { strategy: string; positive: string[] };
    parameterPack: { outputType: string };
    quality: { score: number; grade: string };
  };
  if (/^\s*NEGATIVE\s*:/mi.test(packet.targetPrompt)) throw new Error('Seedance target prompt incorrectly uses NEGATIVE syntax.');
  if (!packet.targetPrompt.includes('POSITIVE CONSTRAINTS')) throw new Error('Seedance target prompt missing positive-constraint translation.');
  if (!packet.negativePrompt.includes('face drift')) throw new Error('Canonical No Prompt intent was not preserved.');
  if (!packet.outputContract.includes('Cinematic video shot')) throw new Error('Output contract missing professional output profile.');
  if (packet.parameterPack.outputType !== 'cinematic-shot') throw new Error('Parameter pack lost output type.');
  if (packet.constraintPack.strategy !== 'positive-only') throw new Error('Seedance should use positive-only prevention policy by default.');
  if (packet.quality.score < 80) throw new Error(`Professional packet quality unexpectedly low: ${packet.quality.score}`);

  const comfyResult = await client.callTool({
    name: 'vision.pro.compile',
    arguments: { idea: 'A product rotates slowly on a real stone plinth.', target: 'comfyui', mode: 'text-to-image', intent: 'product', doNotWant: 'floating text; duplicate product; warped logo', outputType: 'product-hero' },
  });
  const comfy = JSON.parse(text(comfyResult as { content?: unknown[] })) as { targetPrompt: string; constraintPack: { strategy: string } };
  if (!comfy.targetPrompt.includes('NEGATIVE CONDITIONING')) throw new Error('ComfyUI target should preserve separate negative conditioning.');
  if (comfy.constraintPack.strategy !== 'separate-negative') throw new Error('ComfyUI constraint strategy mismatch.');

  const cinemaResult = await client.callTool({
    name: 'vision.pro.compile',
    arguments: { idea: 'A founder turns one decision card toward camera.', target: 'higgsfield-cinema', mode: 'text-to-image', intent: 'education', outputType: 'hero-image', mustHave: 'decision card visible', doNotWant: 'random UI; neon' },
  });
  const cinema = JSON.parse(text(cinemaResult as { content?: unknown[] })) as { targetPrompt: string };
  if (cinema.targetPrompt.length > 512) throw new Error(`Cinema professional prompt exceeds 512 characters: ${cinema.targetPrompt.length}`);

  process.stdout.write(`${JSON.stringify({ ok: true, tools: names, score: packet.quality.score, outputCount: outputs.length, cinemaChars: cinema.targetPrompt.length }, null, 2)}\n`);
} finally {
  await client.close().catch(() => undefined);
}