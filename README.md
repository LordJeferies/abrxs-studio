# Abrxs Studio

Abrxs Studio is the new modular, AI-native production system for the ABRXS ecosystem.

It unifies the existing Brand Builder, Content Builder, Fichas, Editorial planning, Geómetra/Lienzos, Canter, Vision Art Creator, Dresser, Review and Publisher around one set of versioned contracts.

## Core rule

A piece of content has one canonical identity. Workspaces do not create parallel copies; they inspect, enrich or execute different parts of the same project.

## Workspaces

- **Brand** — brand strategy, Brand Adapter and Vision DNA.
- **Content** — content routing, Beta/Alfa creation and Visual Intent from the start.
- **Fichas** — canonical ficha editing, provenance, validation and visual production fields.
- **Editorial** — Grid, Board, Timeline, Agenda, Calendar and content library based on Editorial OS/Emulator.
- **Geómetra** — library, validator, compiler and Lienzos.
- **Canter** — source truth, word-level transcript, alignment, source ranges, cutting and exports.
- **Vision** — prompt direction, cinematic controls, references, scenes, shots, generation providers and layered assets.
- **Dresser** — Auto Dress, captions, B-roll, XRoll, layers, motion, reframe, audio, timeline and export.
- **Review** — corrections, approvals and audit trail.
- **Publisher** — distribution handoff, scheduling and publication.

## Vision is transversal

Vision is not only a late-stage generator. Brand defines a `BrandVisionProfile`; Content creates `VisualIntent`; Fichas carry `VisualProduction`; Geómetra/Lienzos expose asset slots; Vision produces assets/prompts; Dresser composes them.

## Foundation status

`0.1.0-foundation` establishes:

- monorepo layout;
- shared design tokens;
- initial versioned contracts;
- responsive Studio shell;
- migration map from legacy ABRXS repositories;
- initial workflow documentation;
- local bootstrap/doctor scripts;
- CI skeleton.

This repository intentionally starts clean. Existing engines are migrated behind adapters rather than copied blindly or layered as old runtimes.

## Local start on macOS

```bash
git clone git@github.com:LordJeferies/abrxs-studio.git
cd abrxxs-studio 2>/dev/null || cd abrxs-studio
chmod +x scripts/*.sh
./scripts/bootstrap-mac.sh
npm run dev
```

Open the local URL printed by Vite.

## Development rules

1. One workspace = one bootstrap.
2. UI is never canonical storage.
3. Contracts are versioned and migrated explicitly.
4. Long-running work is represented as Jobs.
5. MCP calls the same application services as the UI.
6. Desktop will package the frontend locally; it must not depend on GitHub Pages to run.
7. No global MutationObserver/polling architecture for application state.
8. Legacy compatibility is implemented through adapters and fixtures.

See `docs/architecture/FOUNDATION.md` and `docs/roadmap/PHASES.md`.
