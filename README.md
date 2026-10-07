# Abrxs Studio

Abrxs Studio is the modular, AI-native production system for the ABRXS ecosystem.

The repository is developed as a **modular monorepo**: every production tool must be useful and testable independently before the final Studio shell assembles the modules.

## Abrxs Vision Art Creator V2.5 · Director Studio

Vision is the first production module promoted to the V2.5 architecture. Its primary identity is now **visual prompt improver + cinematic director + production compiler**.

- **Public PWA:** https://lordjeferies.github.io/abrxs-studio/vision/
- **Public product page:** https://lordjeferies.github.io/abrxs-studio/vision/about.html
- **How to use Vision:** https://lordjeferies.github.io/abrxs-studio/vision/guide.html
- **Latest macOS release:** https://github.com/LordJeferies/abrxs-studio/releases/latest
- **Direct V2.5 macOS download:** https://github.com/LordJeferies/abrxs-studio/releases/latest/download/Abrxs-Vision-Art-Creator-macOS-v2.5.zip
- **Vision source/docs:** `apps/vision/README.md`
- **Vision V2 architecture:** `docs/vision/ARCHITECTURE_V2.md`
- **Vision MCP:** `docs/vision/MCP.md`
- **Continuation prompt:** `docs/vision/V2_5_CONTINUATION_PROMPT.md`

### V2.5 primary flow

```text
BASE TEXT / SCRIPT / IDEA / WEAK PROMPT / FICHA
            ↓
        SOURCE TRUTH
            ↓
      VISION DIRECTOR
            ↓
Visual references + suggested/user presets
            ↓
Shot · Camera · Lens · Angle · Aperture · Focus
Shutter · FPS · White Balance · Composition · Lighting
Camera Motion · Subject Motion · Environment Motion
Look · Atmosphere · Material · FX
            ↓
  ABRAXAS PRODUCTION PROMPT
            ↓
Target compiler / Ficha / XRoll / Storyboard / Carousel / Provider
```

The user can paste a normal paragraph or short script, then choose cinematic decisions through visual references and plain-language explanations. Vision preserves the source idea and compiles those choices into a professional prompt rather than forcing the user to edit a large wall of rigid prompt fields.

V2.5 currently contains 18+ Director dimensions, 100+ visual choices and a reusable preset system. Prompt Anatomy remains available as inline semantic guidance.

## PWA-first, native when useful

Vision V2.5 is **PWA-first**: Director, Prompt Anatomy, Ficha Intake, XRoll planning, Storyboard, Carousel, presets and core prompt work are designed to remain useful from browser/iPhone/iPad/desktop.

Tauri wraps the same Vision frontend/core when native capabilities materially improve the workflow:

- macOS Keychain
- filesystem workflows
- FFmpeg / large-media processing
- Gemini CLI
- Higgsfield CLI
- ComfyUI localhost
- local MCP/runtime integrations

The PWA is not a fake demo. Native-only capabilities are simply exposed only when the runtime can support them reliably.

## AI Copilot and providers

Vision Copilot can reason through built-in NVIDIA/Gemini routes or configured custom LLM providers. It sees V2.5 Source Truth and Director selections, but it only **proposes** changes; user approval is required before a patch is applied.

Assistant provider and generation provider are independent. A project may use one model for semantic direction and another for image/video generation.

Custom provider settings support:

- OpenAI-compatible endpoints
- Anthropic-compatible endpoints
- Generic REST provider definitions

Custom browser keys are session-only by default. Persistent public-PWA master secrets belong behind Vision Cloud Gateway / server-side secret storage, never in GitHub Pages code or localStorage.

Generic REST/image/video providers are not treated as executable until a request/response adapter is implemented and validated.

## Ficha Intake

Vision V2.5 can start from nothing, an existing prompt, or existing production fichas in HTML/JSON/TXT.

The Ficha Intake parser recognizes prompt structures used by JOC / Story Editor canvases, stages non-destructive prompt patches and exports a new copy instead of silently rewriting the imported original.

The shared Content Bridge supports a future/connected Content Creator selector:

```text
Prompt engine
○ Basic
● Abrxs Vision
```

so Content Creator and Vision do not maintain competing prompt engines.

## MCP / agents

Vision exposes the same application/core services through stdio MCP servers instead of automating UI clicks.

General Vision MCP:

```bash
npm run vision:mcp
```

V2.5 Director MCP:

```bash
npm run vision:director:mcp
```

Professional compiler MCP:

```bash
npm run vision:pro:mcp
```

The Director MCP can list visual choices, recommend presets from base text, compile a directed prompt, audit it and return selected-text alternatives. It never submits paid generation itself.

## Core rule

A piece of content has one canonical identity. Workspaces do not create parallel copies; they inspect, enrich or execute different parts of the same project.

## Planned / active modules

- **Vision V2.5** — Director Studio, prompt improver, visual references, presets, Copilot, Ficha Intake, XRoll Studio, Carousel, Storyboard, Analyze, provider registry, PWA + optional Tauri.
- **XRollsArchitect** — next visual-creation app after Vision: specialized XRoll layer architecture, depth, parallax, motion, local/cloud generation and Dresser handoff.
- **Dresser** — Auto Dress, captions, B-roll, XRoll compositing, layers, motion, reframe, audio, timeline and export.
- **Brand** — Brand Adapter + Vision DNA / BrandVisionProfile.
- **Content** — content routing, Beta/Alfa/Omega, Visual Intent and Vision Content Bridge.
- **Fichas** — canonical ficha editing, provenance, validation and visual production.
- **Editorial** — Grid, Board, Timeline, Agenda, Calendar and content library.
- **Geómetra** — library, validator, compiler and Lienzos.
- **Canter** — source truth, word-level transcript, alignment, source ranges, cutting and exports.
- **Review** — corrections, approvals and audit trail.
- **Publisher** — distribution handoff, scheduling and publication.

## Vision development / validation

```bash
npm install
npm run vision:typecheck
npm run vision:smoke
npm run vision:v2:smoke
npm run vision:v25:smoke
npm run vision:assistant:smoke
npm run vision:mcp:smoke
npm run vision:director:mcp:smoke
npm run vision:pro:mcp:smoke
npm run vision:build
```

Run PWA locally:

```bash
npm run vision:dev
```

Optional desktop validation:

```bash
npm run vision:desktop:check
npm run vision:desktop:build
```

## Development rules

1. Stabilize each app independently before joining the final Studio shell.
2. Canonical product data is separate from UI state.
3. Contracts are versioned and migrated explicitly.
4. Source truth is never silently rewritten by a visual/prompt tool.
5. Long-running work becomes Jobs.
6. MCP/CLI/UI/integrated apps should call the same application services.
7. Provider availability is capability-driven, not assumed from a provider name.
8. No provider secret is committed to public frontend code.
9. Web/PWA exposes every capability that is reliable and secure in-browser.
10. Tauri/native adapters are used only where native capabilities materially improve the workflow.
11. Legacy compatibility is implemented through parsers/adapters/fixtures, not stacked runtime patches.
12. Changes to imported production documents should be auditable and reversible.
13. AI proposes project changes; user approval applies them.
14. Generation/spend requires an actual provider adapter plus explicit confirmation.

See `docs/architecture/FOUNDATION.md`, `docs/architecture/PLATFORM_TARGETS.md`, `docs/architecture/FRONTEND_SYSTEM_V1.md`, `docs/roadmap/PHASES.md`, `docs/vision/ARCHITECTURE_V2.md`, `docs/vision/MCP.md` and `docs/vision/V2_5_CONTINUATION_PROMPT.md`.
