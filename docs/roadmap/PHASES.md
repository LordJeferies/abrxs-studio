# Abrxs Studio implementation phases

## Phase 0 — Foundation (current)

- monorepo;
- contracts v1 seeds;
- design tokens;
- Studio navigation shell;
- architecture/migration/workflow docs;
- bootstrap and doctor scripts.

## Phase 1 — Contract hardening + legacy fixtures

- collect real Brand/Ficha/Lienzo/Canter/Editorial fixtures;
- write migrations and contract tests;
- define Project, Lienzo, CutRecipe, AssetSlot, Review and Capability schemas;
- add provenance and revision operations.

## Phase 2 — Brand + Content + Ficha Studio

- migrate Brand Builder and Content Builder engines behind adapters;
- implement Brand Vision DNA and reusable visual presets;
- implement Visual Intent at Beta/Alfa time;
- build Ficha Studio with history, validation and visual production inspector.

## Phase 3 — Editorial

- migrate Editorial OS/Emulator planning behavior;
- Grid/Board/Timeline/Agenda/Calendar use the same Ficha IDs;
- content library filters: type/family/lot/A1–A4/status/platform;
- smart drag day palette and responsive/mobile behavior.

## Phase 4 — Geómetra + Lienzos

- extract GeometraCore;
- validators and compiler consume new contracts;
- Lienzo becomes the production digital twin with asset slots, visual intent and dress hints.

## Phase 5 — Canter

- adapter first, then isolate MediaService/TranscriptService/Alignment/CutEngine/ExportEngine/JobManager;
- preserve current stable local processing;
- formal CutRecipe and SourceTruth handoffs.

## Phase 6 — Abrxs Vision Art Creator

- Quick Creator;
- Prompt Director + Director Lock;
- Brand/content presets;
- Cinema controls;
- reference analysis;
- Scene/Take Studio;
- provider registry (Prompt Only, NVIDIA first, Higgsfield/ComfyUI optional);
- Layer Package generation.

## Phase 7 — Dresser

- DressProject runtime;
- Auto Dress planner;
- Caption/B-Roll/XRoll/Layer/Motion/Reframe/Audio studios;
- multitrack editor;
- batch profiles;
- export and editable handoffs.

## Phase 8 — Review + Publisher

- object-level comments/corrections;
- approval gates;
- PublishPackage handoff;
- integrate existing Publisher behavior.

## Phase 9 — Desktop + MCP + Doctor

- Tauri desktop package with local frontend;
- Keychain secrets;
- MCP over the same application services;
- capability/health diagnostics;
- end-to-end tests Brand → Published.
