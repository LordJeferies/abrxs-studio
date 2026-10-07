# Abrxs Vision Art Creator V2

## Product definition

Abrxs Vision V2 is the visual-direction and production-compiler layer of Abrxs Studio. It converts an idea, visual intent or existing ficha into a canonical production specification and then compiles that intent into prompts, storyboards, XRolls, carousels and provider-specific packages.

The prompt is an output, not the source of truth.

```text
Idea / Ficha / Content Creator
          ↓
Visual Intent + Source Truth
          ↓
GenerationSpec / Director State
          ↓
Continuity + References + Output Contract + Constraints
          ↓
Target Compiler
          ↓
Prompt Only / Higgsfield / Seedance / Kling / Veo / NVIDIA / Gemini / ComfyUI
          ↓
Generate / Review / New Take / Dresser
```

## Modules

### Home
Entry point for Prompt Studio, Copilot, Creator/Studio, Fichas, XRoll and Cinema Playground.

### Prompt Studio
Creates prompts from scratch or improves existing direction. Prompt Anatomy separates the production prompt into purpose, subject, scene, camera, light, motion, brand, continuity, constraints and output.

### Vision Copilot
AI assistant that sees the current Vision project context. It can critique prompts, propose references and return structured actions. Actions require explicit user approval. It never spends generation credits by itself.

### Ficha Intake
Accepts HTML, JSON or TXT. It detects prompt fields in embedded Geómetra/Content Creator data, shows the surrounding context, stages non-destructive prompt patches and exports a new copy.

Recognized prompt locations include `prompt`, `prompt_override`, `promptNoText`, `promptWithText`, `compositionPrompt`, cover prompts, asset prompts and carousel/static-production prompts.

### Content Bridge
The Content Creator can use engine `basic` or `vision`. Vision receives thesis, objective, format, brand, visual intent, prompt draft and references. It returns a versioned Vision package while preserving the original prompt draft for audit/history.

### XRoll Studio
Creates layered XRoll specifications with 2–8 layers, master prompt, per-layer prompts, alpha/parallax rules, motion spec, composite spec and Dresser handoff.

### Storyboard
Uses film-grammar presets and explicit scene-readiness fields. Shots preserve scene structure, continuity and target-specific compilation.

### Carousel
Compiles slide-level visual direction and narrative roles with continuity and safe-text policies.

### Analyze / Cinema Playground
Teaches and inspects focal length, framing, movement, lighting, palette and local media metadata. The educational preview layer is deliberately separated from physically exact simulation.

## Preset inheritance

```text
Global ABRAXAS
  → Brand
    → Content Family
      → Format
        → Preset
          → Content
            → Shot / Slide / Layer
```

Presets store structured decisions, not a pasted prompt string. This lets Vision recompile the same intent for different providers.

## Assistant vs Creator

Assistant and generation provider are independent selections.

Examples:

```text
Assistant: NVIDIA GLM
Generator: Higgsfield Seedance
```

or

```text
Assistant: Gemini
Generator: ComfyUI Local
```

Copilot reasons, critiques and proposes. Creator performs provider selection, capability discovery, preflight, job submission and result tracking.

## PWA vs Desktop

The PWA and Tauri app share the same React/Core implementation.

PWA strengths:
- prompts, QA, presets and project editing;
- fichas, storyboards, carousels and XRoll planning;
- Vision Copilot through a secure cloud gateway;
- cloud provider generation once an adapter is enabled;
- offline core through service worker + IndexedDB;
- iPhone/browser access.

Desktop-only/native advantages:
- macOS Keychain for local BYOK secrets;
- Gemini CLI and Higgsfield CLI execution;
- controlled localhost integration for ComfyUI;
- FFmpeg/Whisper/local executables;
- unrestricted project-folder workflows after user permission;
- large local media processing and native background work;
- local stdio MCP server for Claude Code/Codex.

## Provider rule

No provider is marked executable merely because its name appears in the UI. Vision must validate credentials, concrete model/workflow and capability before enabling Generate. Paid generation also requires explicit user action.

## Firebase / Vision Cloud Gateway

The public PWA must not contain NVIDIA/Gemini master keys. A Firebase Functions/Cloud Run gateway can hold server secrets and expose controlled assistant/generation routes. The PWA stores only the gateway URL. App Check/Auth should be enforced in production.

## Quality gates

A stable release must pass:
- TypeScript typecheck;
- local core smoke;
- V2 smoke;
- assistant contracts smoke;
- MCP smoke;
- professional MCP smoke;
- production web/PWA build;
- Tauri cargo check;
- Tauri build on macOS;
- public Pages deployment;
- downloadable macOS artifact/release workflow.
