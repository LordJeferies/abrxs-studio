# Abrxs Studio implementation phases

## Phase 0 — Foundation (current)

- monorepo;
- contracts v1 seeds;
- design tokens;
- Studio navigation shell;
- desktop-first platform decision;
- architecture/migration/workflow docs;
- bootstrap and doctor scripts.

## Phase 1 — Desktop shell + contract hardening

- create the canonical Tauri desktop shell early, not at the end;
- package frontend assets locally;
- define runtime capability detection;
- collect real Brand/Ficha/Lienzo/Canter/Editorial fixtures;
- write migrations and contract tests;
- define Project, Lienzo, CutRecipe, AssetSlot, Review and Capability schemas;
- add provenance and revision operations.

## Phase 2 — Brand + Content + Ficha Studio

- migrate Brand Builder and Content Builder engines behind adapters;
- implement Brand Vision DNA and reusable visual presets;
- implement Visual Intent at Beta/Alfa time;
- build Ficha Studio with history, validation and visual production inspector;
- keep these workspaces full-capability on both Desktop and Web/PWA.

## Phase 3 — Editorial

- migrate Editorial OS/Emulator planning behavior;
- Grid/Board/Timeline/Agenda/Calendar use the same Ficha IDs;
- content library filters: type/family/lot/A1–A4/status/platform;
- smart drag day palette and responsive/mobile behavior;
- Desktop and Web/PWA both remain first-class.

## Phase 4 — Geómetra + Lienzos

- extract GeometraCore;
- validators and compiler consume new contracts;
- Lienzo becomes the production digital twin with asset slots, visual intent and dress hints;
- browser mode supports the full workflow when referenced assets are browser-accessible.

## Phase 5 — Canter

- adapter first, then isolate MediaService/TranscriptService/Alignment/CutEngine/ExportEngine/JobManager;
- preserve current stable local processing;
- formal CutRecipe and SourceTruth handoffs;
- Desktop is canonical for heavy local processing; web provides review/light/remote-job control where useful.

## Phase 6 — Abrxs Vision Art Creator

- Quick Creator;
- Prompt Director + Director Lock;
- Brand/content presets;
- Carousel Studio and design-style presets;
- Cinema controls;
- reference analysis;
- Scene/Take Studio;
- provider registry (Prompt Only, NVIDIA first, Higgsfield/ComfyUI optional);
- Layer Package generation;
- full web capability where providers can be called safely, Desktop for local/secret-heavy providers.

## Phase 7 — Dresser

- DressProject runtime;
- Auto Dress planner;
- Caption/B-Roll/XRoll/Layer/Motion/Reframe/Audio studios;
- multitrack editor;
- batch profiles;
- export and editable handoffs;
- Desktop is canonical for full local media/render workflows; web exposes safe/lightweight editing and review capabilities.

## Phase 8 — Review + Publisher

- object-level comments/corrections;
- approval gates;
- PublishPackage handoff;
- integrate existing Publisher behavior;
- full Desktop and Web/PWA experience.

## Phase 9 — MCP + Doctor + production hardening

- Keychain secrets on Desktop;
- trusted server-side secret path for web when needed;
- MCP uses same application services as UI;
- full capability/health diagnostics;
- packaging/signing/notarization;
- end-to-end tests Brand → Published;
- browser compatibility matrix and graceful capability fallbacks.
