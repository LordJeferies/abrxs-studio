# Abrxs Vision · Skill Provenance V0.6

This document records what external repositories informed Abrxs Vision's generation logic and what was actually adopted. The goal is to preserve provenance, avoid cargo-cult copying, and keep licensing boundaries explicit.

## Policy

Abrxs Vision does **not** vendor entire third-party runtimes or copy non-commercial source code into its core. External repositories are treated as one of:

1. **Execution surface** — an official CLI/SDK/API that Vision can call through an adapter.
2. **Prompt/production methodology** — concepts are re-expressed as Abrxs contracts, tests and deterministic compilers.
3. **UX/architecture reference** — interaction patterns inform Vision Space, project history, node execution and review UX.
4. **Concept-only reference** — no source reuse when license or product fit makes direct reuse inappropriate.

## Source map

| Source | License/status | Adopted into Vision | Not copied / boundary |
|---|---|---|---|
| `OSideMedia/higgsfield-ai-prompt-skill` | MIT | MCSLA routing; I2V motion-delta rule; one-primary-action discipline; generic-emotion decomposition; Identity Block vs Motion Block; anti-slop language; short-form vs block-scaffold regimes; camera feasibility; provider/workspace-first routing; continuity discipline; one-variable iteration | Vision does not vendor the skill text; rules are re-authored as typed compiler/policies/gates |
| `OSideMedia/higgsfield-ai-prompt-skill/skills/higgsfield-seedance` | MIT | Seedance target grammar; first-frame semantics; short-form action/camera discipline; reference-role awareness; explicit temporal structure only when it improves control | Vision does not assume every historical Seedance control remains available; live model schema wins |
| `OSideMedia/higgsfield-ai-prompt-skill/skills/higgsfield-pipeline` | MIT | continuity modules; one job per scene/shot; storyboard/keyframe before expensive video; diagnose the failed variable instead of rewriting the whole prompt | No pipeline runtime is embedded directly |
| `OSideMedia/higgsfield-ai-prompt-skill/skills/higgsfield-soul` | MIT | identity-vs-motion separation; visible performance cues instead of generic emotion labels; identity locks for recurring characters | Soul-specific provider execution remains an adapter capability |
| `higgsfield-ai/skills` | MIT, official | Official execution direction: use Higgsfield CLI/skills for live generation; model catalog is dynamic; Soul/brand/product workflows are provider capabilities | No hard-coded claim that all models/capabilities are always available |
| `higgsfield-ai/cli` | MIT, official | `higgsfield model list --json`, live model schema inspection, `higgsfield generate create … --wait --json`; capability discovery and spend confirmation before execution | UI does not browser-automate Higgsfield when official CLI/SDK is available |
| `higgsfield-ai/higgsfield-client` | Apache-2.0, official | Native adapter contract, sync/async job shape, secret separation and queue/progress concepts | Python SDK is not bundled into the Web/PWA build |
| `cclank/lanshu-awesome-ai-video-kit` | MIT | target-model prompt grammars; cross-model translation as semantics-preserving restructuring; model-selector thinking; Kling/Seedance/Veo differences; reference-role and edit-route concepts | Vision does not copy its prompt corpus or assume community-observed behavior is permanent provider contract |
| `rediumvex/ai-video-generator-claude` | MIT | temporal beats; camera/light/sound synchronization; short-form hook/context/payoff; podcast visuals as storytelling rather than waveform; explicit material/reference use | Retention percentages and style-specific claims are treated as heuristics, not universal guarantees |
| `SamurAIGPT/Vibe-Workflow` | MIT | modular node/workflow architecture; swappable provider nodes; reusable workflows; no vendor lock-in | Vision Space remains Abrxs-native rather than embedding the app wholesale |
| Magnific Spaces | proprietary product/docs | infinite-canvas mental model; visible generation history; reusable grouped workflows; simple surface over deep graph capability | No proprietary code/assets copied |
| `FineComputer14451/Grok-Imagine-Cinematic-Studio` | MIT community project | Production Bible, identity lock, readiness gates, handoff discipline, multi-clip continuity, QA before spend | Grok-specific agent implementation is not embedded |
| `Matticusnicholas/KupkaProd-Cinema-Pipeline` | non-commercial source license | **concepts only**: storyboard before expensive render, multiple takes, approve/reject, resume state, one scene/job | No source code, workflows or implementation copied into commercial Abrxs core |
| `AKCodez/higgsfield-claude-skills` | community automation | browser automation recognized only as fallback when no official execution surface exists | Playwright automation is not the primary provider backend because it is brittle |
| Open-Higgsfield-AI variants | mixed forks; inspect per repo | UI/model catalog reference: one prompt composer, model-specific settings, generation gallery, multi-reference patterns | Official Higgsfield catalog wins for live capability truth |
| `beshuaxian/higgsfield-seedance2-jineng` | community skills; license must be checked per revision | additional scenario taxonomy and multi-reference workflow ideas | No source reuse unless license is verified at the exact revision |

## V0.6 rules encoded in code

The following rules are now enforced or represented in `src/skillEngine.ts` and `src/professionalPromptEngine.ts` rather than living only in documentation:

- one provider-neutral ABRAXAS production specification is the source of truth;
- **What I Want**, **Must Have**, **What I Do Not Want**, **Output Contract**, **Continuity**, **Reference Policy**, **Motion** and **Audio** are separate first-class brief fields;
- negative intent is **not** blindly pasted into every target: each adapter has a negative policy (`positive-constraints`, `workflow-owned`, `discover-live`, or separate canonical negative block);
- Higgsfield Cinema / Seedance target prompts do not depend on a `NEGATIVE:` field; exclusions are translated into stability/composition constraints while the canonical negative brief remains preserved for audit/handoff;
- image-to-video prompts describe **motion/change** rather than re-describing the first frame;
- every reference has a semantic role (`identity`, `look`, `composition`, `wardrobe`, `location`, `motion`, `product`, `logo`, `palette`, `text-layout`, `first-frame`, `last-frame`);
- identity/location/light/palette/geometry form a reusable continuity pack;
- one shot should carry one primary action with at most two secondary motions; too many action phases become a quality warning;
- generic emotions such as “sad/angry/surprised/tense” are treated as unresolved performance direction until converted into visible behavior (eyes, breath, posture, hands, facial cues);
- vague quality words (`beautiful`, `epic`, `masterpiece`, `premium cinematic`, etc.) trigger anti-slop warnings instead of being mistaken for craft decisions;
- short-form video can receive explicit temporal beats and synchronized audio intent, but timestamps are used only when timing actually improves control;
- provider/model limits are quality gates, not afterthoughts;
- live capability discovery is required before a provider-backed generation action is enabled;
- exact text inside an AI-generated image is treated as a model-sensitive risk; separate text layers are preferred when wording must be exact;
- expensive video generation should follow storyboard/keyframe review when identity/composition is critical;
- failed iterations should change the diagnosed failure, not randomly rewrite every successful decision;
- output requirements are explicit (`hero-image`, `storyboard-frame`, `cinematic-video`, `xroll`, `carousel-frame`, `product-shot`, `reference-analysis`) rather than being inferred from the prose prompt.

## Target negative-policy map

| Target | Negative / exclusion behavior |
|---|---|
| ABRAXAS generic | Keep a separate canonical negative/exclusion block for downstream adapters |
| Higgsfield Cinema | Translate exclusions into positive stability/composition constraints; keep canonical negative intent in the project |
| Higgsfield Seedance | Same positive-constraint policy; I2V additionally uses motion-delta-only grammar |
| Higgsfield Kling | Discover live model/schema before deciding whether a native negative field is available |
| Veo lane | Discover live capability; do not assume a negative field exists |
| ComfyUI | Keep separate positive + negative prompt blocks; workflow owns exact node mapping |
| NVIDIA / Gemini | Map from canonical brief only after live endpoint/model capability discovery |

## Execution priority

1. Official provider CLI/SDK/API.
2. Local adapter such as ComfyUI.
3. Browser automation only when no stable official execution surface exists and the user explicitly chooses it.

## Updating this file

When a skill/repo changes materially, update:

- source revision/date in the implementation issue or changelog;
- affected target policy/compiler;
- smoke tests / quality gates;
- this provenance map if a license or ownership boundary changes.
