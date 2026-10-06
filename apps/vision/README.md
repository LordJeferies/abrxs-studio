# Abrxs Vision Art Creator

Abrxs Vision Art Creator is the visual-direction and model-aware generation workspace inside Abrxs Studio. It is Desktop-first, PWA-capable and offline-first for its canonical planning/prompt core.

## Public links

- Repository: https://github.com/LordJeferies/abrxs-studio
- Vision PWA: https://lordjeferies.github.io/abrxs-studio/vision/
- How to use: https://lordjeferies.github.io/abrxs-studio/vision/guide.html
- Prompt quality standard: `apps/vision/docs/PROMPT_QUALITY_STANDARD_V03.md`
- Skill/provenance map: `apps/vision/docs/SKILL_PROVENANCE_V04.md`

## V0.4: Visual Generation Skill Engine

V0.4 separates three concerns that must not be confused:

1. **Canonical production truth** — ABRAXAS visual specification: function, subject/action, scene, camera, composition, light, materials, brand, continuity, evidence, output and negatives.
2. **Target grammar** — a deterministic translator reshapes the canonical spec for a specific image/video lane instead of sending the same universal paragraph to every model.
3. **Provider execution** — credentials, live model discovery, capability validation, jobs and spend happen only in provider adapters. A prompt compiler never silently spends credits.

Current target profiles:

- `generic-production`
- `higgsfield-cinema`
- `higgsfield-seedance`
- `higgsfield-kling`
- `veo`
- `comfyui`
- `nvidia`
- `gemini`

The provider catalog is deliberately dynamic. Higgsfield/NVIDIA/Gemini capabilities must be resolved live before enabling cloud generation. Model names, pricing, duration and supported inputs are not treated as permanent hard-coded facts.

## Rules derived from the external skill/repository audit

The implementation in `src/skillEngine.ts` now encodes the useful parts of the repositories supplied during design:

- MCSLA-style model/workspace + camera + subject + look + action structure for Higgsfield-oriented prompts.
- Image-to-video describes **motion/change from the supplied first frame**, not a decorative re-description of the image.
- Camera movement is constrained; competing moves should be sequenced or split rather than stacked blindly.
- Every reference has a semantic role: `identity`, `look`, `composition`, `wardrobe`, `location`, `motion`, `product`, `logo`, `palette`, `text-layout`, `first-frame`, `last-frame`.
- Storyboards carry identity/location/light/palette/geometry continuity into every shot package.
- Short-form video uses explicit temporal beats and audio intent instead of one undifferentiated paragraph.
- Exact text inside generated imagery is treated as risky; use a separate text layer when wording must be exact.
- Video/keyframe review should happen before expensive generation when identity or composition is critical.
- Keep a successful take and change the diagnosed failure rather than randomly rewriting all successful decisions.
- Browser automation is fallback-only when an official CLI/SDK/API exists.

See `docs/SKILL_PROVENANCE_V04.md` for source/license boundaries. Non-commercial reference projects are concept-only; their source is not copied into Abrxs.

## Quality gates

The provider-aware compiler audits:

- canonical production completeness
- camera feasibility
- temporal coverage/coherence
- identity/location/light/palette continuity
- reference-role semantics
- image-to-video first-frame contract
- target prompt budget / overprompting
- physical plausibility and anti-mutation constraints
- evidence integrity
- explicit visual purpose

A high score means the **production specification is explicit and compatible**, not that an aesthetic result is guaranteed.

## Reference + continuity system

Uploaded references are no longer anonymous files. In the UI each reference can be assigned a role. The generated continuity pack carries stable identity, wardrobe, location, light direction, palette and geometry across a storyboard or take family.

This is the base for future `New Take` and `New Scene` operations:

- **New Take**: preserve identity/location/wardrobe/time, change camera/framing/action within the same beat.
- **New Scene**: preserve character/brand DNA while explicitly changing location/action/light and creating a new continuity key.

## Storyboard V0.4

Storyboard no longer emits a generic comma-separated shot prompt. Every shot is compiled through the same provider-aware skill engine used by Quick.

The UI can choose a prompt target for storyboard shots and displays the resulting QA score. The board also publishes a continuity contract so adjacent shots preserve screen direction, identity, wardrobe, hero props and environmental logic.

## Providers and execution

### Prompt Only
Ready and fully local.

### Higgsfield
The adapter is built around the **official Higgsfield CLI/SDK execution surface**. The local CLI can:

```bash
npm run vision:cli -- models
```

which invokes live model discovery through:

```bash
higgsfield model list --json
```

Generation is intentionally blocked unless you select a live model and explicitly accept provider spend:

```bash
npm run vision:cli -- run \
  --target higgsfield-seedance \
  --mode text-to-video \
  --intent cinematic \
  --idea "A founder commits to the decision" \
  --model <LIVE_MODEL_ID> \
  --confirm-spend
```

No provider credential is committed to the repository.

### NVIDIA / Gemini
Capability adapters are prepared, but generation remains disabled until credentials, exact model capability and request schema are validated against the connected account. The UI must not advertise unsupported/free/unlimited generation.

### ComfyUI
Prepared as a local workflow target. Actual execution requires inspection of the selected workflow JSON and installed node/model inventory.

## UI

V0.4 adds a visible **Visual Generation Skill Engine** to Quick:

- target
- mode
- intent
- duration
- route recommendation
- translated target prompt
- QA score/gates
- warnings
- provenance indicators

Settings now separates:

- platform language: English / Español
- prompt output language: AUTO / EN / ES

Reference rows expose their semantic role. Provider rows show execution/discovery policy instead of pretending prepared integrations are already operational.

## What works offline

- Quick Creator
- canonical production-spec Prompt Director
- provider/model-target prompt compilation
- Prompt Quality Audit and provider compatibility gates
- route recommendation
- Director Lock
- Vision DNA presets including JOC
- Carousel prompt generation
- Storyboard + per-shot target compilation
- local image/video metadata analysis
- IndexedDB project persistence
- JSON import/export
- Prompt Pack export
- English/Spanish UI

Cloud generation itself is not offline.

## CLI

```bash
npm install
npm run vision:cli -- status
npm run vision:cli -- prompt --idea "Joc makes a decision criterion visible" --preset joc-editorial --lang en
npm run vision:cli -- audit --idea "premium cinematic professional"
npm run vision:cli -- skill --idea "A client hesitates before signing" --target higgsfield-seedance --mode text-to-video --intent cinematic --duration 8
npm run vision:cli -- skill --idea "Animate this approved shot" --target higgsfield-seedance --mode image-to-video --ref first-frame:shot.png --start-image
npm run vision:cli -- route --mode text-to-video --intent social-hook --multi-shot
npm run vision:cli -- storyboard --idea "A client hesitates before signing" --grammar suspense --target higgsfield-seedance
npm run vision:cli -- providers
npm run vision:smoke
```

## MCP

Run:

```bash
npm run vision:mcp
```

Current MCP tools:

- `vision.get_status`
- `vision.get_provider_registry`
- `vision.compile_prompt_pair`
- `vision.audit_prompt`
- `vision.compile_provider_prompt`
- `vision.recommend_generation_route`
- `vision.compile_carousel_prompt`
- `vision.create_storyboard`
- `vision.compile_storyboard_shot`

MCP compiles/plans but does **not** execute paid cloud generation in V0.4.

## Validation

```bash
npm run vision:typecheck
npm run vision:smoke
npm run vision:mcp:smoke
npm run vision:build
npm run vision:desktop:check
npm run vision:desktop:build
```

macOS helper:

```bash
cd "$HOME/Downloads/abrxs-studio"
git config core.fileMode false
git pull --ff-only origin main
bash scripts/vision-v02-mac.sh
```

## Current boundary

V0.4 is a real provider-aware **planning and prompt-translation layer** plus an official Higgsfield CLI execution adapter. It does not claim that NVIDIA, Gemini, ComfyUI layer separation, relight/upscale, or every Higgsfield workspace is already wired end-to-end. Those actions stay disabled until their provider adapter, job lifecycle, credential handling and tests are complete.
