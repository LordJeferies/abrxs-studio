# Abrxs Vision V2.5 · MCP

Abrxs Vision exposes its production core through local stdio MCP servers so Claude Code, Codex and other MCP clients can use the same prompt, Director, XRoll, storyboard, ficha and provider-compilation services as the UI.

The MCP layer calls application/core services. It does **not** automate UI clicks.

## Servers

From the repository root:

```bash
npm install
npm run vision:mcp
```

General Vision MCP: prompt compiler, provider compiler, Fichas, XRoll, Content Bridge, storyboard and carousel.

```bash
npm run vision:director:mcp
```

V2.5 Director MCP: base text → cinematic decisions → ABRAXAS directed prompt.

```bash
npm run vision:pro:mcp
```

Professional production compiler MCP retained from V2.

All three are local stdio servers. They do not open a public network port and do not submit generation jobs by themselves.

## General Vision tools

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

## V2.5 Director tools

- `vision.director.get_status`
- `vision.director.list_categories`
- `vision.director.list_options`
- `vision.director.list_presets`
- `vision.director.recommend_presets`
- `vision.director.direct_from_text`
- `vision.director.audit_prompt`
- `vision.director.improve_selection`
- `vision.director.resolve_recipe`

### Example intent

A compatible agent can perform a flow like:

```text
Use Vision Director on this base text:
“A founder compares three proposals but cannot decide because there is no clear criterion.”

1. Preserve that source truth.
2. Recommend three cinematic recipes.
3. Use the most restrained one.
4. Show me alternative lighting options before changing lighting.
5. Compile the final ABRAXAS prompt for a 9:16, 8-second video.
```

The agent should use `vision.director.recommend_presets`, `vision.director.list_options` and `vision.director.direct_from_text` instead of inventing unsupported option IDs.

## Codex

Register the broad server:

```bash
codex mcp add abrxs-vision -- npm run vision:mcp
```

Register V2.5 Director as a second specialist server:

```bash
codex mcp add abrxs-vision-director -- npm run vision:director:mcp
```

Then:

```bash
codex mcp list
```

Recommended project instruction:

```text
Use abrxs-vision-director for base-text → cinematic-direction work and abrxs-vision for Ficha, XRoll, storyboard, carousel and provider-compilation tasks. Preserve source truth. Do not execute generation or spend without explicit user confirmation.
```

## Claude Code

```bash
claude mcp add --transport stdio --scope user abrxs-vision -- npm run vision:mcp
claude mcp add --transport stdio --scope user abrxs-vision-director -- npm run vision:director:mcp
claude mcp list
```

Inside Claude Code, use `/mcp` to verify both servers.

## Safety boundary

The Director MCP is intentionally non-generative: it compiles, audits, recommends and returns candidate changes. General provider generation remains separate and must pass capability/preflight checks plus explicit confirmation.

This means an assistant can safely help with:

- prompt improvement
- cinematic decision selection
- selected-text alternatives
- presets
- Ficha patches
- XRoll planning
- storyboard/carousel planning
- target prompt compilation

without silently spending credits.

## Smoke tests

```bash
npm run vision:mcp:smoke
npm run vision:director:mcp:smoke
npm run vision:pro:mcp:smoke
```

CI and the V2.5 release gate run these tests before shipping Vision.
