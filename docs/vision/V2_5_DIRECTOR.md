# Abrxs Vision V2.5 · Director Studio

## Product definition

Vision is not primarily a text generator and not primarily a media generator. It is the visual-direction layer between source intent and production.

Canonical flow:

```text
SOURCE TRUTH
idea / base text / video text / prompt / ficha / reference
        ↓
VISION DIRECTOR
        ↓
visual decisions + explanations + presets
        ↓
ABRAXAS GenerationSpec / directed prompt
        ↓
target compiler
        ↓
provider / export / ficha / storyboard / XRoll / Dresser
```

## UX principles

1. **Base text remains visible.** A user can paste the text of a video, a scene, a weak prompt or a short brief without translating it into twenty fields first.
2. **Choose by seeing.** Cinema decisions are represented by visual cards, names and explanations. Users should not have to know what 85mm, negative fill, rack focus or a crane reveal mean before using them.
3. **Progressive disclosure.** The default workspace shows source text, directed output, suggested presets and one cinema category at a time. Advanced ABRAXAS tools remain available below the primary workflow.
4. **No silent AI mutation.** Copilot proposes changes; the user applies them.
5. **Presets are structured decisions, not frozen prompt paragraphs.** They can be combined, inherited and recompiled for different targets.
6. **A provider is not a creative source of truth.** GenerationSpec preserves intent; provider compilers translate it.
7. **Visual function beats decoration.** Every camera, light, motion, look, FX and layer decision must explain, reveal, contrast, orient, prove or intensify something.

## Main Director workflow

### 1. Source Truth

Input can be:
- base video text;
- scene description;
- image brief;
- weak/legacy prompt;
- Content Creator draft;
- imported ficha prompt;
- XRoll concept.

Vision does not require the source text to contain cinematography.

### 2. Cinema Director

Current V2.5 categories:
- framing / shot size;
- lens / focal perspective;
- angle / camera height;
- focus / depth of field;
- composition;
- lighting;
- camera movement;
- photographic look;
- atmosphere;
- FX / VFX.

Each option contains:
- a stable id;
- visible label;
- short description;
- practical effect;
- emotional/visual feel;
- good use cases;
- cases where it should be avoided;
- provider-neutral prompt language;
- an approximate preview configuration.

### 3. Suggested presets

Vision scores the source text and proposes recipes relevant to the task. Examples:
- Intimate Pressure;
- Quiet Authority;
- Human Documentary;
- Luxury Product Reveal;
- Editorial Portrait;
- Architecture Reveal;
- Vertical Authority;
- Decision / Criterion XR;
- Night Practical;
- Beauty Clean;
- Automotive Night;
- Food Macro.

A preset only sets director decisions. The user can replace any decision afterward.

### 4. Directed output

The output compiler combines:
- source intent;
- chosen director decisions;
- temporal/frame logic;
- continuity;
- text policy;
- negative constraints;
- output contract.

For video, output explicitly requires:
- one readable primary camera movement;
- one readable subject action;
- stable geometry and identity;
- coherent first-to-last-frame continuity;
- a clear end state.

For XRoll, output explicitly requires:
- independently generatable/compositable layers;
- useful foreground/midground/background separation;
- controlled depth/parallax;
- no decorative motion without function.

## Relationship to older Vision modules

V2.5 does **not** delete V2 capabilities. The following remain available and share the same intent/production model:
- Professional Prompt Lab;
- Prompt Anatomy;
- Ficha Intake;
- Vision Copilot;
- XRoll Studio;
- Cinema Playground;
- Storyboard;
- Carousel;
- Content Bridge;
- provider registry;
- target compilers;
- CLI;
- MCP;
- PWA;
- Tauri Desktop;
- Firebase cloud gateway.

The advanced V2 compiler remains available as progressive disclosure below Director Studio.

## PWA / Desktop boundary

### PWA

Designed to support:
- Director Studio;
- prompt improvement;
- presets;
- fichas;
- XRoll planning;
- storyboards/carousels;
- offline project work;
- Copilot through a secure cloud gateway;
- cloud generation only when a provider adapter is verified.

### Desktop

Adds native access to:
- macOS Keychain;
- local filesystem;
- local CLIs;
- MCP stdio;
- ComfyUI/localhost bridges;
- FFmpeg and heavy local processing;
- future local model runtimes.

## Quality contract

A V2.5 prompt should not become longer merely to appear sophisticated. It should become more executable.

Minimum useful direction:
- source idea remains intact;
- subject/action are observable;
- framing and lens have a function;
- composition has a hierarchy;
- lighting has source/direction/quality;
- motion is physically plausible when applicable;
- continuity is explicit;
- output/aspect/duration are explicit;
- fabricated evidence and generic AI decoration are constrained.

## Tests

`npm run vision:v25:smoke` verifies:
- broad director catalog;
- multiple preset families;
- recommendation from source text;
- source text → directed video prompt;
- lens/light/motion retention;
- prompt anatomy availability;
- ABRAXAS quality audit;
- XRoll-specific compilation contract.
