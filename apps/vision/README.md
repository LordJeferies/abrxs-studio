# Abrxs Vision Art Creator V2

Abrxs Vision is the visual-direction, prompt-engineering and production-preparation workspace inside Abrxs Studio.

V2 is **PWA-first** and keeps Tauri as an optional native wrapper. The web/PWA and desktop builds use the same React/core implementation.

## Public links

- Repository: https://github.com/LordJeferies/abrxs-studio
- Vision PWA: https://lordjeferies.github.io/abrxs-studio/vision/
- How to use: https://lordjeferies.github.io/abrxs-studio/vision/guide.html
- V2 architecture: `apps/vision/docs/VISION_V2_ARCHITECTURE.md`
- Prompt quality standard: `apps/vision/docs/PROMPT_QUALITY_STANDARD_V03.md`
- Skill/provenance map: `apps/vision/docs/SKILL_PROVENANCE_V04.md`

## What Vision V2 is

Vision is not a generic prompt textarea. It converts editorial intent into a structured visual-production package.

```text
CONTENT / FICHA
      ↓
visual intent + source truth + prompt draft
      ↓
VISION V2
      ↓
direction + prompt QA + target compiler + XR/storyboard/assets
      ↓
PROVIDER / DRESSER / HUMAN EDITOR
```

The canonical direction should make explicit, when relevant:

- visual function / purpose;
- subject or hero object;
- observable action/state;
- scene/environment;
- composition;
- camera/lens/framing/movement;
- lighting;
- material/texture;
- palette and Brand Vision;
- typography/text-safe zones;
- continuity;
- evidence restrictions;
- output contract;
- QA and downstream handoff.

Target-specific compilers then translate that canonical direction for Higgsfield/Seedance/Kling/Veo/NVIDIA/Gemini/ComfyUI or generic production without pretending every model supports the same prompt grammar.

## V2 home and workspaces

Vision now opens with a welcome screen instead of dropping directly into a technical director form.

Primary routes:

1. **Prompt Studio** — create/improve production prompts.
2. **Generate / Director Studio** — image/video/storyboard direction and provider-aware prompt compilation.
3. **Ficha Intake** — import and improve existing HTML/JSON/TXT fichas.
4. **XRoll Studio** — construct XR/XRoll packages as layered visual systems.
5. Existing **Storyboard, Carousel, Analyze, References, Providers and Settings** remain available inside Studio.

The workspace can be changed without creating a new project.

## Ficha Intake

Vision can ingest existing production canvases instead of forcing the user to rebuild them.

Supported inputs:

- `.html`
- `.json`
- `.txt`

HTML is **never executed**. Vision searches for compatible `<script type="application/json">` data blocks and reads the embedded source-of-truth structure.

The current parser supports the Story Editor patterns used in JOC production examples, including:

- R5-style `id="seed"` JSON;
- R10.1-style `id="app-data"` JSON;
- `parts[].prompt_override`;
- `parts[].assets[].prompt_override`;
- `promptNoText`;
- `promptWithText`;
- `cover.prompt` / `cover.prompt_override`;
- `compositionPrompt`;
- static/carousel visual `prompt` fields.

Workflow:

```text
Import ficha
   ↓
Detect pieces / assets / prompt fields
   ↓
Show current prompt + ficha context
   ↓
Manual edit or Vision Auto Improve
   ↓
Stage patch
   ↓
Review before/after
   ↓
Export updated copy
```

The loaded original is never destructively mutated. HTML export replaces only the embedded JSON payload; the surrounding canvas/editor HTML is preserved.

A patch manifest can also be exported for audit/versioning.

## Content Creator bridge

`src/contentBridge.ts` provides the shared contract for Content Creator.

Recommended Content Creator control:

```text
Prompt engine
○ Basic
● Abrxs Vision
```

`Basic` preserves the current Content Creator prompt behavior.

`Abrxs Vision` sends editorial/visual intent to the shared Vision core and receives a `VisionContentPackage` containing production prompt/QA and, when requested, an XRoll package.

Content Creator remains responsible for:

- thesis;
- source truth;
- editorial structure;
- content format;
- script/copy;
- initial visual intent / prompt draft.

Vision remains responsible for:

- production direction;
- prompt improvement;
- target-specific translation;
- references/continuity;
- output contracts;
- XRoll construction.

The original `promptDraft` should be kept for history/audit even after Vision generates an approved version.

## XRoll Studio

V2 treats an XR/XRoll as a timed compositing system rather than one flattened still.

Inputs include:

- idea/text;
- preset;
- duration;
- aspect ratio;
- Brand Vision;
- style;
- camera;
- motion;
- layer strategy.

Layer selection can be:

- Auto;
- 2–8 manual layers.

Supported layer roles include:

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

The compiler produces:

- master XRoll prompt;
- independent prompt per layer;
- motion/timing spec;
- parallax guidance;
- composite order;
- QA;
- Dresser handoff.

Current presets:

- Concept Reveal
- Problem → Solution
- Decision / Criterion
- Depth Parallax
- Data Focus
- Quote Concept

Custom combinations can be saved locally as presets. Presets store structured settings, not a copied prose prompt, so the same direction can be recompiled for another target/model.

## Prompt Studio and professional compiler

The professional prompt layer separates:

1. canonical production truth;
2. output contract;
3. target/model grammar;
4. provider execution.

Current targets:

- `generic-production`
- `higgsfield-cinema`
- `higgsfield-seedance`
- `higgsfield-kling`
- `veo`
- `comfyui`
- `nvidia`
- `gemini`

Important rules:

- I2V describes **what changes from an approved first frame** rather than re-describing the entire image.
- Exact text should be isolated as an editable typography layer when spelling fidelity is critical.
- References use semantic roles such as identity/look/composition/wardrobe/location/motion/product/logo/palette/text-layout/first-frame/last-frame.
- Prompt quality is scored from production completeness and compatibility, not from decorative adjectives.
- Provider execution stays disabled until a real live capability/credential path is verified.

## ABRAXAS quality rule

Do not accept this as a production direction:

```text
premium modern cinematic professional image
```

The useful question is what the visual *does* and how another system/person can reproduce it without guessing.

A production prompt should express concrete observable decisions: visual function, scene, action/state, composition, camera, light, material, brand, continuity, constraints and output.

## PWA vs Tauri

### PWA — canonical product

Use the PWA for:

- Prompt Studio;
- Ficha Intake;
- XRoll Studio;
- Director;
- Carousel;
- Storyboard;
- local analysis;
- offline project/prompt work;
- iPhone/iPad/Desktop review.

It deploys from GitHub Pages.

### Tauri — optional native adapter

Keep the desktop wrapper for capabilities that should not live in a public browser runtime:

- macOS Keychain / secure provider credentials;
- local filesystem workflows;
- FFmpeg / large-video processing;
- native local model processes;
- provider/native bridges.

Do **not** fork the product. Tauri wraps the same Vision frontend/core.

## Language

Settings separates:

- platform UI language: English / Español;
- prompt output language: AUTO / EN / ES.

That allows an Spanish UI with English provider prompts, or vice versa.

## Offline boundary

Available offline after the PWA shell is cached:

- Prompt Studio/core;
- Prompt Doctor/professional QA;
- Ficha parsing/patching;
- XRoll compiler/presets;
- Director controls;
- Carousel prompt generation;
- Storyboard planning;
- project persistence/import/export;
- local metadata analysis.

Cloud provider execution is not offline.

## Development

From repository root:

```bash
npm install
npm run vision:typecheck
npm run vision:smoke
npm run vision:v2:smoke
npm run vision:mcp:smoke
npm run vision:pro:mcp:smoke
npm run vision:build
```

Run locally:

```bash
npm run vision:dev
```

Then open:

```text
http://127.0.0.1:4174
```

Desktop checks/build:

```bash
npm run vision:desktop:check
npm run vision:desktop:build
```

## CLI / MCP

Existing Vision CLI/MCP commands remain available. V2 core modules should continue moving toward the same shared application-service layer so UI, CLI, MCP and Content Creator do not implement competing prompt logic.

```bash
npm run vision:cli -- status
npm run vision:smoke
npm run vision:v2:smoke
npm run vision:mcp:smoke
npm run vision:pro:mcp:smoke
```

## Security and source truth

- Never execute imported HTML.
- Never silently overwrite the imported original.
- Never treat a visual interpretation as factual evidence.
- Never commit provider secrets.
- Never advertise a cloud generation capability until its live provider path is verified.
- Preserve source truth, exact approved text, IDs and continuity constraints from imported fichas.

## Stable V2 release gates

A V2 release is not considered stable until these pass:

```text
TypeScript
legacy Vision smoke
V2 Ficha/XRoll smoke
MCP smoke
professional MCP smoke
PWA production build
GitHub Pages build/deploy
Tauri cargo check/build
HTML/JSON prompt-only round-trip
390px / 430px mobile responsive pass
```

See `docs/VISION_V2_ARCHITECTURE.md` for module reasoning, ownership boundaries and implementation rules.
