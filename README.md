# Abrxs Studio

Abrxs Studio is the modular, AI-native production system for the ABRXS ecosystem.

The repository is now developed as a **modular monorepo**: each production tool must be useful and testable as a standalone app before the final Studio shell assembles the modules.

## First standalone app — Abrxs Vision Art Creator V0.2

Vision is the first module being stabilized independently.

- **PWA:** https://lordjeferies.github.io/abrxs-studio/vision/
- **How to use Vision:** https://lordjeferies.github.io/abrxs-studio/vision/guide.html
- **Vision source/docs:** `apps/vision/README.md`

Vision V0.2 is Desktop-first but its local core is also installable as a responsive PWA. Prompt direction, carousel prompts, storyboards, project storage and basic image/video analysis are designed to work offline. Cloud AI providers are optional capability extensions rather than a prerequisite for opening or using the app.

## Core rule

A piece of content has one canonical identity. Workspaces do not create parallel copies; they inspect, enrich or execute different parts of the same project.

## Platform strategy

Abrxs Studio is **Desktop-first** for production-critical work. Desktop apps package their frontend locally and must not depend on GitHub Pages to run.

Web/PWA versions are adapted companions that share contracts, domain logic and the design system. Anything reliable and secure in-browser should remain functional there.

## Planned modules

- **Vision** — standalone V0.2 now: Prompt Director, Cinema controls, Carousel, Storyboard, local Analyze, Layers plan, Vision Space foundation, provider registry.
- **Dresser** — next new standalone tool: Auto Dress, captions, B-roll, XRoll, layers, motion, reframe, audio, timeline and export.
- **Brand** — regenerated later around Brand Adapter + Vision DNA.
- **Content** — regenerated later around content routing, Beta/Alfa and Visual Intent.
- **Fichas** — canonical ficha editing, provenance, validation and visual production.
- **Editorial** — regenerated from Editorial OS/Emulator: Grid, Board, Timeline, Agenda, Calendar and content library.
- **Geómetra** — regenerated library, validator, compiler and Lienzos.
- **Canter** — regenerated source truth, word-level transcript, alignment, source ranges, cutting and exports.
- **Review** — corrections, approvals and audit trail.
- **Publisher** — distribution handoff, scheduling and publication.

## Vision is transversal

Vision is not only a late-stage generator. Brand will define `BrandVisionProfile`; Content creates `VisualIntent`; Fichas carry `VisualProduction`; Geómetra/Lienzos expose asset slots; Vision produces prompts/assets; Dresser composes them.

## Vision development / tests

```bash
npm install
npm run vision:typecheck
npm run vision:smoke
npm run vision:build
npm run vision:desktop:check
```

CLI examples:

```bash
npm run vision:cli -- status
npm run vision:cli -- prompt --idea "Joc explaining decision criteria" --focal "50mm"
npm run vision:cli -- storyboard --idea "A client hesitates before signing" --grammar suspense --scenes 2 --shots 4
```

MCP server:

```bash
npm run vision:mcp
```

macOS validation/build/install + GitHub Pages trigger:

```bash
cd "$HOME/Downloads/abrxs-studio"
git pull --ff-only origin main
chmod +x scripts/vision-v02-mac.sh
./scripts/vision-v02-mac.sh
```

## Development rules

1. Each app is stabilized independently before it joins the final Studio shell.
2. Desktop is the reference environment for production-critical media work.
3. UI is never canonical storage.
4. Contracts are versioned and migrated explicitly.
5. Long-running work is represented as Jobs.
6. MCP calls the same domain/application services as the UI.
7. Desktop packages frontend assets locally.
8. Web/PWA exposes every capability that is reliable and secure in-browser.
9. No global MutationObserver/polling architecture for application state.
10. Legacy compatibility is implemented through adapters and fixtures, not layered legacy runtimes.

See `docs/architecture/FOUNDATION.md`, `docs/architecture/PLATFORM_TARGETS.md`, `docs/architecture/FRONTEND_SYSTEM_V1.md` and `docs/roadmap/PHASES.md`.
