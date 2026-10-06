import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: process.execPath,
  args: ['--import', 'tsx', 'mcp/server.ts'],
  cwd: process.cwd(),
  stderr: 'pipe',
});

const client = new Client({ name: 'abrxs-vision-smoke', version: '0.3.0' });

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
    'vision.compile_carousel_prompt',
    'vision.compile_prompt_pair',
    'vision.create_storyboard',
    'vision.get_status',
  ];
  for (const name of expected) {
    if (!names.includes(name)) throw new Error(`Missing MCP tool: ${name}`);
  }

  const promptResult = await client.callTool({
    name: 'vision.compile_prompt_pair',
    arguments: {
      idea: 'Joc makes a client decision criterion visible instead of listing tasks.',
      subject: 'Joc at a real worktable with three decision cards',
      action: 'placing one criterion card above two task cards',
      preset: 'joc-editorial',
      focal: '50mm',
      language: 'en',
    },
  });
  const prompt = JSON.parse(firstText(promptResult as { content?: unknown[] })) as {
    imagePrompt: string;
    productionSpec: string;
    quality: { score: number };
  };
  if (!prompt.imagePrompt.includes('VISUAL FUNCTION:')) throw new Error('MCP prompt missing visual function.');
  if (!prompt.productionSpec.includes('OUTPUT CONTRACT:')) throw new Error('MCP prompt missing production output contract.');
  if (prompt.quality.score < 90) throw new Error(`MCP prompt quality unexpectedly low: ${prompt.quality.score}`);

  const auditResult = await client.callTool({
    name: 'vision.audit_prompt',
    arguments: { idea: 'premium cinematic professional', language: 'en' },
  });
  const audit = JSON.parse(firstText(auditResult as { content?: unknown[] })) as { warnings: string[] };
  if (!audit.warnings.length) throw new Error('MCP audit did not flag an underspecified generic idea.');

  const carouselResult = await client.callTool({
    name: 'vision.compile_carousel_prompt',
    arguments: {
      title: 'The client does not buy tasks',
      body: 'They need a criterion to decide.',
      role: 'HOOK',
      preset: 'joc-editorial',
      textMode: 'separate',
      aspect: '4:5',
    },
  });
  const carousel = JSON.parse(firstText(carouselResult as { content?: unknown[] })) as { imagePrompt: string; continuityNote: string };
  if (!carousel.imagePrompt.includes('NEGATIVE CONSTRAINTS:')) throw new Error('MCP carousel prompt missing negative constraints.');
  if (!carousel.continuityNote) throw new Error('MCP carousel prompt missing continuity note.');

  const storyboardResult = await client.callTool({
    name: 'vision.create_storyboard',
    arguments: { idea: 'A founder hesitates before signing a decisive agreement.', grammar: 'suspense', scenes: 2, shotsPerScene: 4 },
  });
  const storyboard = JSON.parse(firstText(storyboardResult as { content?: unknown[] })) as { shots?: unknown[] };
  if (storyboard.shots?.length !== 8) throw new Error('Storyboard MCP tool returned unexpected shot count.');

  process.stdout.write(`${JSON.stringify({ ok: true, tools: names, promptQuality: prompt.quality.score }, null, 2)}\n`);
} finally {
  await client.close().catch(() => undefined);
}
