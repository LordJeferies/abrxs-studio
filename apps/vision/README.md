# Abrxs Vision Art Creator

Abrxs Vision Art Creator is the standalone visual-direction workspace inside Abrxs Studio. It is Desktop-first, PWA-capable and offline-first for its local core.

## Public links

- Repository: https://github.com/LordJeferies/abrxs-studio
- Vision PWA: https://lordjeferies.github.io/abrxs-studio/vision/
- How to use: https://lordjeferies.github.io/abrxs-studio/vision/guide.html
- Prompt quality standard: `apps/vision/docs/PROMPT_QUALITY_STANDARD_V03.md`

## V0.3 prompt compiler

Vision no longer treats a high-quality prompt as a long adjective list. The local compiler now produces an autonomous production specification.

A hero-frame prompt explicitly carries:

- role and visual function
- subject + action
- scene/environment
- composition/framing
- camera/lens/focal/aperture
- motivated light
- materials and texture behavior
- palette and brand DNA
- typography/text-safe zones
- continuity constraints
- evidence constraints
- output/canvas
- negative constraints

Motion prompts additionally constrain camera path, temporal action, identity, geometry, material physics, light direction and object continuity.

`compilePrompt()` now returns:

- `imagePrompt`
- `motionPrompt`
- `negativePrompt`
- `productionSpec`
- `quality` audit with score/grade/checks/warnings

The local `auditPrompt()` completeness gate helps detect underspecified ideas before generation. A high score means the production decisions are explicit; it does not replace human judgment about whether the idea itself is strong.

## Vision DNA presets

Current offline presets include:

- `clean-editorial`
- `cinematic-education`
- `luxury-documentary`
- `joc-editorial`

`joc-editorial` carries JOC-specific palette, editorial photography, typography behavior, continuity and anti-genericity rules. It is intentionally a brand preset rather than a universal default.

## What works offline

- Quick Creator
- deterministic production-spec Prompt Director
- Prompt Quality Audit
- Director Lock
- Vision DNA presets
- Carousel Studio prompt generation
- Storyboard Studio and cinema grammars
- local image analysis (dimensions, aspect, orientation, luminance, approximate dominant colors)
- local video metadata analysis and suggested sample times
- IndexedDB project persistence
- JSON import/export
- Prompt Pack export
- English/Spanish UI preference

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
Write one visual idea and get a production-spec Hero Frame Prompt plus Motion Prompt. Camera, light, aspect and Vision DNA remain structured decisions rather than prompt fragments.

### Director
Set camera, lens, focal length, aperture, framing, angle, movement, lighting, palette, atmosphere and style. Director Lock marks decisions that future AI enhancement must preserve. Beginner visual references explain focal length, shot size and movement without requiring cinema knowledge.

### Carousel
Paste title/body blocks separated by blank lines. Choose:

- Text in image
- Text layer
- Clean image

Every slide is assigned a narrative role and receives an autonomous visual specification with direction, continuity and negative constraints. Vision treats the carousel as a sequence, not a transcript split into cards.

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
V0.3 still exposes a limited local Prompt Director flow. It is the foundation for the later node/workflow runtime; it is not yet a full Magnific/ComfyUI-class graph executor.

### Settings
The platform UI can be switched between English and Spanish. The preference persists locally and works offline. Prompt output language is supported by the core/CLI as `auto`, `en` or `es`; the dedicated UI control is being separated from platform language so changing menus never silently rewrites creative source text.

## Project persistence

Vision mirrors current work into IndexedDB and supports portable JSON export/import using schema:

`abrxs.vision-project.v2`

The portable file is designed for future Brand, Ficha, Geometra and Dresser handoffs.

## Terminal / CLI

From the repository root:

```bash
npm install
npm run vision:cli -- status
npm run vision:cli -- prompt --idea "Joc makes a decision criterion visible" --subject "Joc at a real worktable" --function "show criterion over task listing" --preset joc-editorial --lang en
npm run vision:cli -- audit --idea "premium cinematic professional"
npm run vision:cli -- carousel --title "The client does not buy tasks" --body "They need a criterion to decide" --role HOOK --preset joc-editorial
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
- `vision.audit_prompt`
- `vision.compile_carousel_prompt`
- `vision.create_storyboard`

The MCP and CLI call the same prompt/storyboard domain functions used by the app instead of automating UI clicks.

## Development

```bash
npm run vision:dev
npm run vision:typecheck
npm run vision:smoke
npm run vision:mcp:smoke
npm run vision:build
npm run vision:desktop:check
npm run vision:desktop:build
```

## macOS validation + install + Pages trigger

```bash
cd "$HOME/Downloads/abrxs-studio"
git config core.fileMode false
git pull --ff-only origin main
bash scripts/vision-v02-mac.sh
```

Do not `chmod` the helper manually. The helper validates Vision, builds the macOS app, installs it in `~/Applications` when the bundle exists, creates a local ZIP and triggers the GitHub Pages workflow if `gh` is installed.

## iPhone / PWA

Open the public Vision URL in Safari, then use Share → Add to Home Screen. The installed web app uses the same local Prompt/Carousel/Storyboard core and IndexedDB project store. Dense desktop panes adapt to mobile; the PWA does not attempt to compress the full desktop layout into phone width.

## Current V0.3 boundary

V0.3 substantially raises the offline prompt/QA layer and exposes it through CLI/MCP. Provider-backed generation, semantic reference analysis, actual layer separation/upscale/relight and a full node graph executor remain subsequent milestones. The UI must not claim those operations are complete until their provider/service implementation passes its own tests.
