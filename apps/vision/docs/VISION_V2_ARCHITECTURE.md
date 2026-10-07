# Abrxs Vision V2 · Stable Architecture

## Product definition

Abrxs Vision V2 is the visual-direction layer between editorial intent and audiovisual production.

It is deliberately not only a prompt generator. Its job is to keep one canonical production intention, make it understandable to a human, compile it to target-specific prompt dialects, preserve continuity, and hand structured visual work to downstream tools such as Dresser.

Core rule:

```text
CONTENT CREATOR / FICHA
        ↓
visual intent + source truth + prompt draft
        ↓
VISION V2
        ↓
canonical direction / QA / prompts / XR / storyboard
        ↓
DRESSER / PROVIDER / HUMAN EDITOR
```

## Why PWA-first

The canonical Vision application is the PWA/web frontend.

Reasons:

- immediate GitHub Pages delivery;
- iPhone/iPad/desktop access from one codebase;
- offline prompt/ficha/XRoll work after the shell is cached;
- no installation required for reviewing or improving prompts;
- the same React/core code can be packaged by Tauri without forking product logic.

Tauri remains an optional desktop wrapper. It is valuable only for capabilities that the browser should not own: secure local secrets, native filesystem workflows, FFmpeg, local model processes, Keychain integration, large video operations and native provider bridges.

Therefore:

```text
PWA = canonical product surface
Tauri = optional native capability adapter
```

Do not build a separate desktop product.

## V2 workspaces

### Welcome

The app starts by asking what the user wants to do:

- create/improve prompts;
- generate/direct image or video work;
- import a ficha;
- build an XRoll;
- open the existing Director/Storyboard/Carousel studio.

The choice never creates a separate project. It only selects a workspace over the same Vision project.

### Prompt Studio

Uses the ABRAXAS professional prompt engine.

The canonical prompt describes production decisions, not quality adjectives. It must make the following concepts explicit when relevant:

- purpose / visual function;
- subject/object;
- action/state;
- scene;
- composition;
- camera/lens/framing;
- lighting;
- material/texture;
- palette / Brand Vision;
- text-safe zones;
- continuity;
- constraints / exclusion intent;
- output contract;
- QA and handoff.

Target compilers translate that canonical intent into Higgsfield/Seedance/Kling/Veo/NVIDIA/Gemini/ComfyUI-compatible prompt regimes without pretending every live model has the same schema.

### Ficha Intake

`src/fichaIntake.ts` is the non-destructive bridge for existing production canvases.

Supported inputs:

- HTML with an embedded `<script type="application/json">` source of truth;
- JSON;
- TXT with explicit `PROMPT:` blocks.

V2 explicitly recognizes the two HTML families supplied as design references:

1. Story Editor R5-style seed JSON (`id="seed"`, schema such as `joc-story-editor-r5`).
2. Story Editor R10.1-style app data (`id="app-data"`, schema such as `abrxos.alpha.story-editor.r10.1`).

The parser recursively identifies prompt-bearing fields such as:

- `parts[].prompt_override`;
- `parts[].assets[].prompt_override`;
- `cover.prompt` / `cover.prompt_override`;
- `promptNoText`;
- `promptWithText`;
- `compositionPrompt`;
- static/carousel visual prompts;
- other explicit `prompt` fields inside production objects.

The original file remains immutable in memory. A user stages `FichaPromptPatch` objects, reviews before/after, then exports a new HTML/JSON/TXT copy. HTML patching replaces only the embedded JSON payload and leaves the surrounding canvas code intact.

### Content Bridge

`src/contentBridge.ts` defines the contract expected by Content Creator.

Content Creator owns:

- thesis;
- source truth;
- editorial structure;
- content format;
- copy/script;
- initial visual intent;
- optional prompt draft.

Vision owns:

- production direction;
- prompt QA;
- provider translation;
- references and continuity;
- XRoll construction;
- output contracts.

Content Creator should expose a selectable engine:

```text
Prompt engine
○ Basic
● Abrxs Vision
```

When `Vision` is selected, Content Creator calls the same `compileContentVision()` core used by Vision. It must not duplicate prompt logic.

The returned `VisionContentPackage` is stored beside the content ficha. Never overwrite thesis/source-truth fields just because the visual prompt was improved.

### XRoll Studio

An XRoll is treated as a timed visual system, not a single still.

Inputs:

- idea / text;
- visual function;
- duration;
- format/aspect;
- Brand Vision;
- camera/motion;
- layer strategy;
- preset.

Layer modes:

- Auto;
- 2–8 manual layers.

Typical roles:

```text
BACKGROUND
ATMOSPHERE
MIDGROUND
SUBJECT
PROP
FOREGROUND
GRAPHICS
TEXT
```

The compiler returns:

- master XRoll prompt;
- independent layer prompts;
- motion specification;
- composite order;
- parallax guidance;
- Dresser handoff;
- QA.

Exact typography should remain an editable graphics/text layer whenever spelling fidelity matters.

### Presets

Presets are structured combinations, not saved prose prompts.

A preset stores things such as:

- format;
- visual family;
- layer count;
- camera/focal/framing;
- lighting;
- motion;
- text policy;
- brand;
- output aspect.

Vision recompiles the prompt for the selected target. This avoids maintaining hundreds of nearly duplicated prompt strings.

Current XRoll preset examples:

- Concept Reveal;
- Problem → Solution;
- Decision / Criterion;
- Depth Parallax;
- Data Focus;
- Quote Concept.

## Prompt improvement policy

Imported prompts can be improved in four conceptual modes:

1. prompt only;
2. visual direction + prompt;
3. production upgrade;
4. visual rebuild while preserving editorial truth.

The current V2 Ficha Intake implements safe prompt-only patching first. More invasive modes must remain explicit because changing visual direction can affect other parts of a production ficha.

Automatic improvement must not fabricate facts. When camera/light details are absent, Vision may propose physically plausible visual direction, but it cannot present that choice as source evidence.

## ABRAXAS Prompt Anatomy

UI anatomy should use semantic color + icon + text, never color alone:

- intent/purpose;
- subject/identity;
- scene/world;
- composition;
- camera;
- light;
- material;
- brand;
- text/layout;
- motion/audio;
- constraints;
- output.

Every advanced cinema control should have a contextual `?` explanation. Learning mode may show what a lens/light/move does, when to use it, and a visual preview. Advanced mode can hide those explanations.

## Browser performance rules

- no WebGL across the full UI;
- mount expensive visual playgrounds only while active;
- use CSS/2D previews for simple guides;
- reserve Three.js/WebGL for depth/parallax/relight demonstrations;
- avoid re-rendering inactive workspaces;
- store large imported source files only for the active session unless the user explicitly saves them;
- keep provider generation outside the render path;
- all long-running operations become jobs before being added to production execution.

## Source-truth and security rules

- never execute imported HTML;
- parse embedded JSON only;
- never mutate an imported original without explicit export/apply;
- never commit provider API secrets;
- public PWA credentials are user-supplied client-side values or routed through a secure backend;
- Tauri/native secrets belong in secure local storage / Keychain;
- generation buttons remain disabled when a real provider capability has not been verified.

## Stable-V2 gates

Before calling a release stable:

```text
TypeScript
Vision legacy smoke
Vision V2 ficha/XRoll smoke
MCP smoke
Professional MCP smoke
PWA build
GitHub Pages build/deploy
Tauri cargo check
Tauri build
HTML/JSON round-trip patch safety
mobile 390/430 responsive pass
```

A provider is not considered implemented because a prompt translator exists. Execution must have credentials, capability discovery, job/error handling and tests.
