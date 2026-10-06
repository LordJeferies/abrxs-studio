# Abrxs Studio Foundation

## Product architecture

Abrxs Studio is a modular production platform. Workspaces are professional views over canonical contracts.

```text
Brand ─┐
Content ├── Vision intelligence is available from the beginning
Ficha ─┘
  ↓
Editorial → Geómetra/Lienzos → Canter → Vision → Dresser → Review → Publisher
```

The arrows are handoffs, not file-format guesses.

## Architectural layers

```text
apps/
  web/        responsive application shell
  desktop/    Tauri shell (next phase)

packages/
  contracts/      versioned domain schemas
  domain/         application rules (next phase)
  project-store/  persistence and migrations (next phase)
  jobs/           long-running process state (next phase)
  providers/      AI/media capability adapters (next phase)
  design-system/  common visual system
  mcp/            same application services exposed to agents (next phase)
  doctor/         dependency/capability diagnostics (next phase)
```

## Stability rules

- No workspace stores a parallel canonical copy of a Ficha.
- No generation result silently replaces its source asset; new versions are created.
- UI state is ephemeral unless an explicit repository operation persists it.
- Long-running tasks expose a `Job` contract with progress, cancel/retry/error semantics.
- Provider support is capability-driven, not scattered `if provider === ...` branches.
- Desktop loads packaged assets locally. Remote services are dependencies, not the application shell.
- PWA/web and Desktop share domain/UI code but secret-bearing provider calls must stay outside an unsafe static browser context.

## Vision in Brand, Content and Fichas

### Brand

`BrandVisionProfile` stores the reusable visual language of a client: palette, typography, camera/lighting/composition/motion language, references, prompt presets and forbidden patterns.

### Content

`VisualIntent` is created while the idea is being formed. It defines what the visual should communicate and possible routes before a prompt is written.

### Ficha

The Ficha references `VisualIntent`, `ShotSpec`, asset slots and source truth. A visual is therefore traceable to editorial intent instead of being a detached generated image.

## Editorial integration

The Editorial workspace migrates the useful behavior from Editorial OS and Editorial Emulator: Grid, Board, Timeline, Agenda, Calendar, Content Library, flexible week and A1/A2/A3/A4 classification. It schedules canonical fichas instead of cloning them.

## Dresser boundary

Canter owns source truth and cuts. Vision creates/changes visual assets. Dresser owns composition and finishing: captions, B-roll, XRoll, layers, motion, reframe, audio and final render.
