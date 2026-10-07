# Abrxs Vision V2.5 Director Studio — continuation prompt

Copy the block below into any future ChatGPT / Claude / Codex-style chat that can inspect GitHub. The receiving agent MUST inspect the current repository before changing anything; this document is a handoff, not a substitute for source-of-truth code.

---

## MASTER CONTINUATION PROMPT

You are continuing development of **Abrxs Vision Art Creator V2.5 Director Studio** inside:

- Repository: `https://github.com/LordJeferies/abrxs-studio`
- Vision source: `apps/vision`
- Public PWA: `https://lordjeferies.github.io/abrxs-studio/vision/`
- Product page: `https://lordjeferies.github.io/abrxs-studio/vision/about.html`
- Guide: `https://lordjeferies.github.io/abrxs-studio/vision/guide.html`

### 0. First action

Before proposing or writing code, inspect the current `main` branch and the latest CI/Pages/release state. Do not trust stale chat summaries over the repository. Do not delete functioning older modules simply because V2.5 introduces a newer route.

### 1. Product definition

Vision is primarily a **visual prompt improver + cinematic director + production compiler**.

The central user flow is:

```text
BASE TEXT / SCRIPT / IDEA / WEAK PROMPT / FICHA
        ↓
UNDERSTAND SOURCE TRUTH
        ↓
VISION DIRECTOR
        ↓
VISUAL REFERENCES + SUGGESTED / USER PRESETS
        ↓
CAMERA · LENS · EXPOSURE · FOCUS · COMPOSITION
LIGHT · COLOR · CAMERA/SUBJECT/ENVIRONMENT MOTION
LOOK · ATMOSPHERE · MATERIAL · FX
        ↓
ABRAXAS PRODUCTION PROMPT
        ↓
TARGET COMPILER
        ↓
IMAGE / VIDEO / XROLL / STORYBOARD / CAROUSEL / PROVIDER
```

The user must be able to paste a normal paragraph or transcript fragment, then improve it by selecting visual/cinematic decisions. The app should never force the user to manage twenty rigid prompt boxes just to edit a sentence.

### 2. UX principles

- The **base text remains editable normal text**.
- Prompt Anatomy appears primarily as **inline semantic underlines / subtle color**, not a wall of independent bands.
- Visual selectors are first-class: preview + name + effect + feeling + good use + avoid-when + exact prompt wording.
- `?` help should exist for cinematic controls so a non-filmmaker can use the app.
- Use the **same reference scene** when comparing focal length, light, depth, movement, look, etc. so users can understand the difference.
- The visual bar is closer to Higgsfield Cinema Studio / Magnific / Freepik creative tools than to an admin dashboard.
- Desktop: large source/prompt editor + visual selector + contextual inspector.
- Mobile/PWA: real responsive composition, not desktop squeezed into an iPhone.
- Keep dark grayscale/black/white foundation with restrained semantic accents.
- Liquid Glass only for small chrome/popovers/sheets/toolbars, not huge media surfaces.
- Use Three.js/WebGL only where it improves understanding (depth/parallax/camera paths/XRoll), not as decorative weight. A 2D focal simulation must be labeled as educational approximation, not physically exact optics.

### 3. V2.5 Director source of truth

Current final V2.5 Director engine lives in:

- `apps/vision/src/directorFinal.ts`

It defines the cinematic catalog, presets, prompt compiler, anatomy and audit. It currently includes 18+ dimensions and 100+ choices across:

- shot
- camera
- lens
- angle
- aperture
- focus
- shutter
- frameRate
- whiteBalance
- composition
- lighting
- movement
- subjectMotion
- environmentMotion
- look
- atmosphere
- material
- fx

Important functions include:

- `optionsFor`
- `optionById`
- `selectionsFromPreset`
- `recommendPresets`
- `compileDirectorPrompt`
- `anatomizePrompt`
- `auditDirectorPrompt`
- `recommendImprovement`

Presets are **decision combinations**, not frozen strings. Keep them editable and composable.

### 4. Final Director UI

Primary V2.5 Director UI:

- `apps/vision/src/DirectorStudioFinal.tsx`
- `apps/vision/src/v25final.css`

Expected behavior:

1. User chooses Image / Video / XRoll.
2. User pastes base text/script/idea.
3. Vision suggests presets from the text.
4. User selects camera/lens/exposure/light/motion/look/etc. visually.
5. Prompt recompiles from the same source truth.
6. Prompt Anatomy remains readable inline.
7. User can save personal presets.
8. User can open Copilot or Production Studio without losing the intent.

The shell route is:

- `apps/vision/src/VisionV2Shell.tsx`

Do not regress it to an older V2 prompt form as the default.

### 5. Cinema Playground / visual education

Current comparative playground:

- `apps/vision/src/CinemaPlaygroundFinal.tsx`
- `apps/vision/src/v25playground.css`

It compares A/B using one programmatic scene and lets users apply choices to Director.

Future improvements may replace or augment synthetic previews with curated reference images or depth-aware WebGL, but must preserve:

- comparability
- speed
- offline fallback
- honest simulation labels
- `Apply to Director`

### 6. ABRAXAS prompt doctrine

Do not substitute vague adjectives for production decisions. “premium”, “cinematic”, “professional”, “epic” are not specifications by themselves.

Quality means:

`truth + idea + structure + identity + specificity + utility + production + traceability`

An image production prompt should normally make explicit:

- role / visual function
- subject / identity
- observable action
- scene / environment
- composition / blocking / depth
- camera / sensor character
- lens / focal
- aperture / focus when useful
- light source / direction / quality / ratio / color
- material / texture
- palette / brand
- typography / text-safe policy
- continuity
- must-have / must-not-change / avoid / hard negatives
- output contract

Video adds:

- temporal action
- camera trajectory
- subject motion
- environment motion
- duration / beats
- shutter / cadence when relevant
- physical continuity
- anatomy stability
- parallax
- end-state
- audio direction only when the target supports it

For I2V, emphasize **motion delta from the supplied first frame** rather than redundantly describing the entire static image.

Provider prompts are target-specific. Do not build a onePromptFitsAll system.

### 7. Existing V2 modules that MUST remain available

Do not delete or silently break:

- `VisionApp`
- `ProfessionalPromptLab`
- `PromptAnatomy`
- `FichaIntakePanel`
- `XRollStudio`
- `VisionCopilot`
- `VisionAISettings`
- `VisionFirebaseSettings`
- Storyboard engine/UI
- Carousel engine/UI
- Content Bridge
- provider registry / skill engine / target compilers
- legacy Director/catalog files used by existing tests or paths
- CLI / MCP
- PWA service worker/offline core
- Tauri desktop backend

V2.5 reorganizes the primary experience; it does not erase working V2 capabilities.

### 8. Ficha Intake

Vision accepts Geómetra / Content Creator style `HTML`, `JSON`, and `TXT` fichas.

Rules:

- inspect HTML; do not execute imported scripts
- detect embedded JSON/schema and prompt slots
- preserve original source
- show current prompt + context
- stage diff/patch
- apply only approved prompt patches
- round-trip should not destroy canvas/layout/other data

Known prompt locations may include:

- `parts[].prompt_override`
- asset prompt overrides
- `promptNoText`
- `promptWithText`
- visual prompt fields
- cover prompts
- XR asset prompts
- static-production prompts

Do not assume one schema forever; inspect current `fichaIntake` implementation/tests.

### 9. XRoll

Vision currently plans XRolls; the later dedicated application will be **Abrxs XRollsArchitect**.

Vision XRoll output should support:

- 2–8 layers / Auto
- master prompt
- independent layer prompts
- background/midground/subject/foreground/graphics roles
- motion spec
- differential parallax
- composite spec
- text kept editable where spelling matters
- handoff to Dresser / later XRollsArchitect

Do not turn Vision itself into a full After Effects replacement.

### 10. AI Copilot

Key files:

- `apps/vision/src/assistantCore.ts`
- `apps/vision/src/assistantBridge.ts`
- `apps/vision/src/VisionCopilot.tsx`

Rules:

- AI proposes; user approves.
- Never silently mutate the project.
- Never execute provider generation or spend from Copilot.
- V2.5 actions use validated catalog IDs.
- Current guarded action types include:
  - legacy `set-director`
  - `set-brief`
  - `set-v25-option`
  - `replace-v25-source`
- selected Director text may be passed as intervention target; avoid rewriting unrelated prompt content.

Built-in AI routes:

- NVIDIA NIM
- Gemini CLI on desktop
- Gemini/NVIDIA through Firebase Cloud Gateway for PWA when configured

### 11. Provider / API architecture

Assistant provider != generation provider.

A project may use, for example:

- NVIDIA/GLM for semantic prompt improvement
- Gemini for multimodal analysis
- Higgsfield/Seedance for video generation
- ComfyUI for local image/video workflows

Built-in/provider work lives around:

- `apps/vision/src/providerRegistry.ts`
- `apps/vision/src/skillEngine.ts`
- Tauri provider commands
- Firebase gateway

Custom providers:

- `apps/vision/src/customProviders.ts`
- `apps/vision/src/CustomProviderSettings.tsx`

Supported custom protocol definitions:

- OpenAI-compatible
- Anthropic-compatible
- Generic REST

Custom browser API keys are session-only by default. Do not put master API keys in GitHub Pages, committed JS, or localStorage.

Persistent PWA credentials should live behind the secure cloud gateway / secret manager. Generic REST image/video execution remains disabled until a request/response adapter is explicitly implemented and tested.

### 12. Firebase / PWA

Firebase gateway is under:

- `apps/vision/firebase`

It can proxy assistant requests with server-side secrets. Cloud `/generate` intentionally stays disabled until real generation adapters are validated.

Do not change a truthful `501 adapter required` into simulated success.

### 13. Desktop-only capabilities

Tauri reuses the same frontend/core but can add:

- macOS Keychain
- filesystem access
- process spawning
- Gemini CLI
- Higgsfield CLI
- ComfyUI localhost
- FFmpeg / local media processing
- MCP stdio/local runtime

PWA should not be framed as a crippled demo; it should support all cloud-safe core/director/ficha/XRoll/storyboard/carousel work.

### 14. MCP

Existing broad MCP:

- `apps/vision/mcp/server.ts`

Professional MCP:

- `apps/vision/mcp/professional-server.ts`

V2.5 Director MCP:

- `apps/vision/mcp/director-server.ts`

Director MCP tools include:

- `vision.director.get_status`
- `vision.director.list_categories`
- `vision.director.list_options`
- `vision.director.list_presets`
- `vision.director.recommend_presets`
- `vision.director.direct_from_text`
- `vision.director.audit_prompt`
- `vision.director.improve_selection`
- `vision.director.resolve_recipe`

MCP calls application/core services; do not automate UI clicks.

### 15. Tests / quality gates

At minimum keep these green:

```bash
npm run vision:typecheck
npm run vision:smoke
npm run vision:v2:smoke
npm run vision:v25:smoke
npm run vision:assistant:smoke
npm run vision:mcp:smoke
npm run vision:director:mcp:smoke
npm run vision:pro:mcp:smoke
npm run vision:build
```

Desktop gate when needed:

```bash
npm run vision:desktop:check
npm run vision:desktop:build
```

Pages workflow must gate on the relevant smoke tests before deploying.

### 16. Release discipline

Use small commits/checkpoints. Do not wait to make one giant rewrite.

Before declaring a release stable:

1. typecheck green
2. all smoke tests green
3. PWA build green
4. Pages deploy green
5. Tauri check/build green
6. macOS release artifact produced
7. release download verified
8. documentation updated

Do not claim notarization unless notarization actually occurred.

### 17. Status vocabulary

Use only these labels when reporting capabilities:

- **implemented and validated**
- **prepared but not connected**
- **planned**

Do not describe a provider/model as functioning just because a button or registry entry exists.

### 18. Current product direction

The default experience should feel like:

```text
1. paste base text
2. Vision understands source truth
3. see suggested cinematic recipes
4. select camera/lens/light/motion/look through visual references
5. understand each option through ? explanations
6. receive an ABRAXAS production prompt
7. ask Copilot for controlled improvements
8. compile for a specific provider
9. generate only through a real connected adapter
10. review / new take / export / patch ficha
```

The center of the product is **direction**, not generation.

### 19. Mac development commands

Normal sync/check:

```bash
cd "$HOME/Downloads/abrxs-studio" || exit 1
git config core.fileMode false
git fetch origin --prune
git checkout main
git pull --ff-only origin main
npm install
npm run vision:typecheck
npm run vision:v25:smoke
npm run vision:assistant:smoke
npm run vision:mcp:smoke
npm run vision:director:mcp:smoke
npm run vision:pro:mcp:smoke
npm run vision:build
```

Desktop:

```bash
npm run vision:desktop:check
npm run vision:desktop:build
```

Do not casually `git stash pop`; an old stash named roughly `pre-vision-v02-20261006-062542` may contain obsolete scripts.

### 20. Next family app

After Vision V2.5 is stable, the next separate application is **Abrxs XRollsArchitect**. Reuse Vision’s XRoll engine/contracts, GenerationSpec, references, providers, presets and MCP rather than rebuilding them.

---

## END MASTER CONTINUATION PROMPT
