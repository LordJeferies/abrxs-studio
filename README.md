# Abrxs Studio

Abrxs Studio is the modular, AI-native production system for the ABRXS ecosystem.

The repository is developed as a **modular monorepo**: every production tool must be useful and testable independently before the final Studio shell assembles the modules.

## Abrxs Vision Art Creator V2

Vision is the first production module promoted to the V2 architecture.

- **Public PWA:** https://lordjeferies.github.io/abrxs-studio/vision/
- **How to use Vision:** https://lordjeferies.github.io/abrxs-studio/vision/guide.html
- **Vision source/docs:** `apps/vision/README.md`
- **Vision V2 architecture:** `apps/vision/docs/VISION_V2_ARCHITECTURE.md`

Vision V2 is **PWA-first**: Prompt Studio, Ficha Intake, XRoll planning, Director, Carousel, Storyboard, local analysis and project/prompt work are intended to be fast, installable and useful from browser/iPhone/iPad/desktop. The existing Tauri build remains an optional wrapper for native capabilities such as Keychain, filesystem workflows, FFmpeg, large-video processing and local provider/model bridges.

## Vision V2 core flow

```text
CONTENT CREATOR / FICHA / IDEA
            ↓
   visual intent + source truth
            ↓
        VISION V2
            ↓
 direction · prompt QA · target compiler
 ficha prompt patches · XRoll · storyboard
            ↓
 PROVIDER / DRESSER / HUMAN REVIEW
```

V2 can start from nothing, an existing prompt, or existing production fichas in HTML/JSON/TXT.

The Ficha Intake parser recognizes the prompt structures used by JOC Story Editor canvases, stages non-destructive prompt patches and exports a new copy instead of silently rewriting the imported original.

The shared Content Bridge supports a future/connected Content Creator selector:

```text
Prompt engine
○ Basic
● Abrxs Vision
```

so Content Creator and Vision do not maintain competing prompt engines.

## Core rule

A piece of content has one canonical identity. Workspaces do not create parallel copies; they inspect, enrich or execute different parts of the same project.

## Platform strategy

Abrxs Studio can package production-critical tools as desktop apps, but web/PWA and desktop must share contracts, domain logic and design system.

For **Vision specifically**, the PWA is the canonical UI. Tauri wraps the same Vision implementation when native capabilities materially improve the workflow.

No product should depend on GitHub Pages to perform a desktop-only native operation, and no native wrapper should fork the core business logic.

## Planned / active modules

- **Vision V2** — Prompt Studio, professional compiler, Ficha Intake, XRoll Studio, Carousel, Storyboard, Analyze, references/continuity, provider registry, PWA + optional Tauri.
- **Dresser** — next standalone production tool: Auto Dress, captions, B-roll, XRoll compositing, layers, motion, reframe, audio, timeline and export.
- **Brand** — Brand Adapter + Vision DNA / BrandVisionProfile.
- **Content** — content routing, Beta/Alfa/Omega, Visual Intent and Vision Content Bridge.
- **Fichas** — canonical ficha editing, provenance, validation and visual production.
- **Editorial** — Grid, Board, Timeline, Agenda, Calendar and content library.
- **Geómetra** — library, validator, compiler and Lienzos.
- **Canter** — source truth, word-level transcript, alignment, source ranges, cutting and exports.
- **Review** — corrections, approvals and audit trail.
- **Publisher** — distribution handoff, scheduling and publication.

## Vision is transversal

Vision is not only a late-stage generator.

- Brand defines the visual DNA.
- Content defines thesis, format and `VisualIntent`.
- Fichas carry the production structure and prompt slots.
- Vision improves/compiles the visual production package.
- Geómetra/Lienzos expose production structure and asset slots.
- Dresser composes the resulting visual/audio assets into the edit.

## Vision development / validation

```bash
npm install
npm run vision:typecheck
npm run vision:smoke
npm run vision:v2:smoke
npm run vision:mcp:smoke
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

See `docs/architecture/FOUNDATION.md`, `docs/architecture/PLATFORM_TARGETS.md`, `docs/architecture/FRONTEND_SYSTEM_V1.md`, `docs/roadmap/PHASES.md` and `apps/vision/docs/VISION_V2_ARCHITECTURE.md`.
