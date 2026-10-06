# Abrxs Vision Art Creator

Abrxs Vision Art Creator is the standalone visual-direction workspace inside Abrxs Studio. It is Desktop-first, PWA-capable and offline-first for its local core.

## Public links

- Repository: https://github.com/LordJeferies/abrxs-studio
- Vision PWA: https://lordjeferies.github.io/abrxs-studio/vision/
- How to use: https://lordjeferies.github.io/abrxs-studio/vision/guide.html

## What works offline

- Quick Creator
- deterministic Prompt Director
- Director Lock
- Vision DNA presets
- Carousel Studio prompt generation
- Storyboard Studio and cinema grammars
- local image analysis (dimensions, aspect, orientation, luminance, approximate dominant colors)
- local video metadata analysis and suggested sample times
- IndexedDB project persistence
- JSON import/export
- Prompt Pack export

The offline core is intentionally useful without any provider key.

## Current cloud/provider status

- Prompt Only: ready
- NVIDIA NIM: provider target for multimodal analysis and supported generation; integration is the next provider milestone
- Gemini: optional target for semantic reference/story analysis; pricing/capabilities are model-dependent
- Higgsfield: prepared target
- ComfyUI: prepared local-workflow target

Keys must never be committed to this public repository. Desktop provider credentials will live behind native secure storage. Web/PWA BYOK, when enabled, is device-local and should not be treated as a hidden server secret.

## Main workspaces

### Quick
Write one visual idea and get a Hero Frame Prompt plus Motion Prompt. Camera, light, aspect and Vision DNA remain structured decisions rather than prompt fragments.

### Director
Set camera, lens, focal length, aperture, framing, angle, movement, lighting, palette, atmosphere and style. Director Lock marks decisions that future AI enhancement must preserve.

### Carousel
Paste title/body blocks separated by blank lines. Choose:

- Text in image
- Text layer
- Clean image

Each slide receives a dedicated visual prompt. Prompt Pack export keeps all slides together for ChatGPT, Canva or another generator.

### Storyboard
Choose a cinema grammar, number of scenes and shots per scene. The local engine generates narrative role, framing, focal length, angle, movement, duration and transition intent for each shot.

Included grammars:

- Classical Coverage
- Suspense Reveal
- Dialogue Coverage
- Emotional Isolation
- Observational Documentary
- Rhythmic Montage
- Product Hero
- Social Cinematic Hook

### Analyze
Local-first media inspection. Images are analyzed in-browser; video metadata stays local. Semantic analysis is intentionally separate and will use a configured provider when needed.

### Layers
Defines the intended layer package for future XRoll/Dresser workflows: background, midground, subject, foreground, text/graphics and depth/masks.

### Vision Space
Current V0.2 exposes the local Prompt Director flow. It is the foundation for the later node/workflow runtime; it is not yet a full Magnific/ComfyUI-class graph executor.

## Project persistence

Vision mirrors current work into IndexedDB and supports portable JSON export/import using schema:

`abrxs.vision-project.v2`

The portable file is designed for future Brand, Ficha, Geometra and Dresser handoffs.

## Terminal / CLI

From the repository root:

```bash
npm install
npm run vision:cli -- status
npm run vision:cli -- prompt --idea "Joc explaining decision criteria" --focal "50mm"
npm run vision:cli -- storyboard --idea "A client hesitates before signing" --grammar suspense --scenes 2 --shots 4
npm run vision:smoke
```

## MCP

Run the stdio MCP server with:

```bash
npm run vision:mcp
```

Current MCP tools:

- `vision.get_status`
- `vision.compile_prompt_pair`
- `vision.create_storyboard`

The MCP and CLI call the same prompt/storyboard domain functions used by the app instead of automating UI clicks.

## Development

```bash
npm run vision:dev
npm run vision:typecheck
npm run vision:build
npm run vision:desktop:check
npm run vision:desktop:build
```

## macOS validation + install + Pages trigger

```bash
cd "$HOME/Downloads/abrxs-studio"
git pull --ff-only origin main
chmod +x scripts/vision-v02-mac.sh
./scripts/vision-v02-mac.sh
```

The helper validates Vision, builds the macOS app, installs it in `~/Applications` when the bundle exists, and triggers the GitHub Pages workflow if `gh` is installed.

## iPhone / PWA

Open the public Vision URL in Safari, then use Share → Add to Home Screen. The installed web app uses the same local Prompt/Carousel/Storyboard core and IndexedDB project store. Dense desktop panes adapt to mobile; the PWA does not attempt to compress the full desktop layout into phone width.

## Current V0.2 boundary

V0.2 makes the app testable and useful offline. Provider-backed generation, semantic reference analysis, actual layer separation/upscale/relight and a full node graph executor remain subsequent milestones. The UI should not claim those operations are complete until their provider/service implementation passes its own tests.
