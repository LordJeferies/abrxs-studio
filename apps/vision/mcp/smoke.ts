import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: process.execPath,
  args: ['--import', 'tsx', 'mcp/server.ts'],
  cwd: process.cwd(),
  stderr: 'pipe',
});

const client = new Client({ name: 'abrxs-vision-smoke', version: '0.2.0' });

try {
  await client.connect(transport);
  const tools = await client.listTools();
  const names = tools.tools.map((tool) => tool.name).sort();
  const expected = ['vision.compile_prompt_pair', 'vision.create_storyboard', 'vision.get_status'];
  for (const name of expected) {
    if (!names.includes(name)) throw new Error(`Missing MCP tool: ${name}`);
  }

  const prompt = await client.callTool({
    name: 'vision.compile_prompt_pair',
    arguments: { idea: 'A founder hesitates before signing a decisive agreement.', focal: '50mm' },
  });
  if (!Array.isArray(prompt.content) || !prompt.content.length) throw new Error('Prompt MCP tool returned no content.');

  const storyboard = await client.callTool({
    name: 'vision.create_storyboard',
    arguments: { idea: 'A founder hesitates before signing a decisive agreement.', grammar: 'suspense', scenes: 2, shotsPerScene: 4 },
  });
  if (!Array.isArray(storyboard.content) || !storyboard.content.length) throw new Error('Storyboard MCP tool returned no content.');

  process.stdout.write(`${JSON.stringify({ ok: true, tools: names }, null, 2)}\n`);
} finally {
  await client.close().catch(() => undefined);
}
