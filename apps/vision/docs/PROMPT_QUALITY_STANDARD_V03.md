# Abrxs Vision Prompt Quality Standard V0.3

Vision prompts are production specifications, not adjective collections.

This standard operationalizes the ABRAXAS quality system inside the local/offline Vision compiler. The compiler must remain useful without an AI provider and must generate enough explicit production intent that an image/video generator or human producer can act without guessing what the user meant.

## 1. Core rule

A prompt is not high quality because it contains words such as `premium`, `cinematic`, `professional`, `beautiful`, or a famous visual reference.

A production prompt must describe observable decisions and their narrative function.

Every autonomous hero-frame prompt should cover:

- Role
- Visual purpose/function
- Subject
- Action
- Scene/environment
- Composition and framing
- Camera/lens/focal/aperture when useful
- Motivated light
- Material and texture behavior
- Palette and brand behavior
- Typography/text-safe zones when relevant
- Continuity constraints
- Evidence/factual constraints
- Output/canvas/aspect ratio
- Negative constraints

The motion prompt additionally specifies temporal action, camera path, physical continuity, object permanence, light continuity, anatomy/identity stability and motion negatives.

## 2. Production Spec

`compilePrompt()` returns both the executable prompts and a `productionSpec` that makes the decision contract auditable:

- WHAT IT IS
- WHAT IT IS NOT
- OBJECTIVE
- CONTEXT
- CLIENT / BRAND RULES
- FORMAT RULES
- RESTRICTIONS
- NEGATIVES
- OUTPUT CONTRACT
- ACCEPTANCE CRITERIA
- QA
- HANDOFF
- CONTINUITY

This layer exists so later provider adapters can translate the same canonical intent to different model dialects without changing the creative decision.

## 3. Anti-genericity

Vision actively rejects the idea that `cinematic` or `premium` is a sufficient specification.

The prompt audit warns when the source idea is underspecified. It does not invent a stronger thesis to hide a weak input. The local compiler can complete camera/light/material/output details, but the user or an approved AI enhancer must provide the missing conceptual specificity.

Avoid by default:

- generic stock-business staging;
- decorative holograms and dashboards;
- empty luxury decoration;
- visual metaphors unrelated to the actual mechanism;
- arbitrary arrows and infographic clutter;
- overprocessed skin and plastic surfaces;
- random text/pseudo-text;
- evidence, UI, logos, quotes, metrics or documents that were never supplied;
- repeated scenes that make a set look mechanically generated.

## 4. Visual function

Every visual must have a reason to exist. Typical functions include:

- Explain
- Contrast
- Anchor
- Prove
- Orient
- Humanize
- Symbolize
- Create tension
- Show process
- Show result

A useful acceptance test is: **what becomes harder to understand or feel if this visual disappears?** If the answer is `nothing`, the image is probably decorative.

## 5. Continuity

Continuity is not sameness.

Keep stable when required:

- identity;
- wardrobe logic;
- environmental geography;
- light direction;
- palette;
- typography behavior;
- photographic treatment;
- texture/grain;
- brand motifs and graphic density.

Allow variation in:

- scene;
- subject position;
- shot size;
- metaphor;
- composition;
- camera movement;
- narrative role.

## 6. Carousel prompts

Each slide prompt is autonomous and includes:

- narrative role;
- purpose;
- exact content intent;
- visual direction;
- concrete scene/object concept;
- composition;
- camera;
- light;
- material/texture;
- palette/brand;
- typography/text-zone instruction;
- continuity note;
- negative constraints;
- output/aspect ratio.

Roles currently supported:

- HOOK
- CONTEXT
- PROGRESSION
- MECHANISM
- PAYOFF

A carousel is treated as a sequence, not a transcript split into cards. Each slide must add a new visual/conceptual unit while preserving set-level DNA.

## 7. JOC Editorial preset

`joc-editorial` is included as a concrete high-specificity Vision DNA preset.

It encodes:

- off-white, charcoal, deep wine and controlled red;
- real editorial photography;
- current-camera realism and useful 35–85mm perspective;
- professional motivated light;
- strong negative space;
- practical symbolism;
- restrained film grain;
- condensed display statement + clean sans support;
- red handwritten intervention only when it changes meaning;
- explicit avoidance of generic business stock, meaningless dashboards, neon, empty luxury decoration, distorted anatomy, illegible text and AI gloss.

It is a brand preset, not a universal style. Other brands should supply their own Vision DNA.

## 8. Quality audit

`auditPrompt()` produces a 0–100 score and grade A–D based on the presence of production decisions such as:

- specific idea;
- subject;
- scene;
- action;
- composition;
- camera setup;
- light;
- material/texture;
- brand system;
- visual function;
- text zone;
- continuity;
- evidence constraints;
- canvas/aspect.

This score is a completeness gate, not an aesthetic oracle. A 100/100 prompt can still contain a weak idea; it simply means the production specification is explicit.

## 9. Language

The prompt compiler supports:

- `auto` — infer Spanish/English from the idea;
- `es` — force Spanish production labels;
- `en` — force English production labels.

The platform interface language and output prompt language are separate concerns. UI localization must never silently translate or rewrite the user's creative source text.

## 10. Provider adapters

Providers must not own the creative specification.

The canonical flow is:

`DirectorState → Production Spec → provider adapter → provider-specific request`

This makes NVIDIA, Gemini, Higgsfield, ComfyUI or future providers interchangeable without losing Director Lock, continuity, evidence rules or brand DNA.

## 11. Regression requirements

Before release, smoke/MCP tests must verify at minimum:

- idea/subject preservation;
- visual function exists;
- material/texture exists;
- continuity exists;
- output contract exists;
- a complete default prompt scores >= 90;
- JOC DNA propagates into its prompt;
- carousel prompt has negative constraints and continuity;
- storyboard count is deterministic;
- MCP exposes compile, audit, carousel and storyboard tools.
