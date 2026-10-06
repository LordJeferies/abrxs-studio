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

## Platform strategy

Abrxs Studio is **Desktop-first**. The desktop build is the canonical production environment because Canter, Vision and Dresser need reliable access to local media, FFmpeg, Whisper, native file dialogs, secure credentials, long-running jobs and hardware-aware rendering.

Web/PWA remains a first-class companion and should be fully functional wherever browser constraints do not reduce stability. Brand, Content, Fichas, Editorial, Review and Publisher are expected to be full web experiences; Geómetra/Lienzos and Vision can be full or near-full depending on asset/provider access; Canter and the heaviest Dresser operations remain Desktop-primary.

Desktop packages its frontend locally and must not depend on GitHub Pages or a remote shell to launch. Web/PWA shares contracts, domain logic and reusable UI, but capabilities are resolved explicitly instead of pretending every runtime can do the same work.

See `docs/architecture/PLATFORM_TARGETS.md`.

## Architectural layers

```text
apps/
  desktop/    canonical Tauri production application
  web/        adapted responsive Web/PWA companion

packages/
  contracts/      versioned domain schemas
  domain/         shared application rules
  project-store/  persistence and migrations
  jobs/           long-running process state
  providers/      AI/media capability adapters
  design-system/  common visual system
  mcp/            same application services exposed to agents
  doctor/         dependency/capability diagnostics
```

## Stability rules

- No workspace stores a parallel canonical copy of a Ficha.
- No generation result silently replaces its source asset; new versions are created.
- UI state is ephemeral unless an explicit repository operation persists it.
- Long-running tasks expose a `Job` contract with progress, cancel/retry/error semantics.
- Provider support is capability-driven, not scattered `if provider === ...` branches.
- Desktop loads packaged assets locally. Remote services are dependencies, not the application shell.
- Web/PWA and Desktop share domain/contracts/UI where practical, not runtime assumptions.
- Secret-bearing provider calls stay in native secure services or trusted server-side infrastructure.
- Heavy local media operations do not depend on Service Workers.

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
