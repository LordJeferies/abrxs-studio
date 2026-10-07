# Abrxs Vision V2 · MCP

Abrxs Vision exposes its production core through a local stdio MCP server so Claude Code, Codex and other MCP clients can use the same prompt, XRoll, storyboard, ficha and provider-compilation services as the UI.

## Server

From the repository root:

```bash
npm install
npm run vision:mcp
```

The server is local-only and communicates over stdio. It does not open a network port and it does not submit paid generation jobs by itself.

## Main tools

- `vision.get_status`
- `vision.get_provider_registry`
- `vision.compile_prompt_pair`
- `vision.audit_prompt`
- `vision.compile_provider_prompt`
- `vision.recommend_generation_route`
- `vision.compile_xroll`
- `vision.list_xroll_presets`
- `vision.inspect_ficha`
- `vision.improve_ficha_prompt`
- `vision.patch_ficha`
- `vision.compile_content_visual`
- `vision.audit_scene_structure`
- `vision.compile_carousel_prompt`
- `vision.create_storyboard`
- `vision.compile_storyboard_shot`

The MCP server uses Vision Core directly. It does not simulate clicks in the UI.

## Codex

OpenAI Codex can register stdio MCP servers with `codex mcp add`. From the repository root, use:

```bash
codex mcp add abrxs-vision -- npm run vision:mcp
codex mcp list
```

If you prefer direct configuration, point a stdio MCP server at `npm run vision:mcp` with the working directory set to the repository root.

Recommended project instruction:

```text
Use the abrxs-vision MCP server for visual-direction, prompt, storyboard, XRoll, carousel and ficha tasks. Preserve source truth and ask for explicit approval before applying destructive patches or generation spend.
```

## Claude Code

Claude Code supports stdio MCP servers. From the repository root:

```bash
claude mcp add --transport stdio --scope user abrxs-vision -- npm run vision:mcp
claude mcp list
```

Inside Claude Code, use `/mcp` to confirm the connection.

## Safety boundary

The MCP core can compile and patch data, but provider execution stays separate. A provider generation action must pass capability/preflight checks and explicit user confirmation. This avoids accidental spending and prevents an assistant from silently changing the project.

## Smoke test

```bash
npm run vision:mcp:smoke
```

The CI workflow runs this test before shipping Vision.
