# Abrxs Vision · Skill Provenance V0.4

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
| `OSideMedia/higgsfield-ai-prompt-skill` | MIT | MCSLA routing; I2V motion-delta rule; camera vocabulary; model/workspace-first routing; character/continuity discipline; scene readiness concepts; short-prompt vs scaffold distinction | Vision does not vendor the skill text; rules are re-authored as typed compiler/gates |
| `higgsfield-ai/skills` | MIT, official | Official execution direction: use Higgsfield CLI/skills for live generation; model catalog is dynamic; Soul/brand/product workflows are provider capabilities | No hard-coded claim that all models/capabilities are always available |
| `higgsfield-ai/cli` | MIT, official | `higgsfield model list --json`, `higgsfield generate create … --wait --json` execution path; live model discovery before spend | UI does not browser-automate Higgsfield when CLI/SDK is available |
| `higgsfield-ai/higgsfield-client` / official SDKs | Apache-2.0 (Python client), official | Future native adapter contract and queue/progress model; secrets remain outside project files | Python SDK is not bundled into the web/PWA build |
| `cclank/lanshu-awesome-ai-video-kit` | MIT | model-selector pattern; target-model prompt grammars; prompt translation as semantics-preserving restructuring; version-monitoring mindset | Vision does not copy the 543-prompt corpus into source |
| `rediumvex/ai-video-generator-claude` | MIT | explicit temporal beats; short-form hook/context/payoff; camera + light + sound synchronization; podcast visual as storytelling rather than waveform | Retention claims are not treated as universal guarantees |
| `SamurAIGPT/Vibe-Workflow` | MIT | modular node/workflow architecture; swappable provider nodes; reusable workflows; no vendor lock-in | Vision Space remains Abrxs-native rather than embedding the app wholesale |
| Magnific Spaces | proprietary product/docs | infinite-canvas mental model; node history; visible creative process; reusable grouped workflows; simple beginner surface over deep graph capability | No proprietary code/assets copied |
| `FineComputer14451/Grok-Imagine-Cinematic-Studio` | MIT community project | Production Bible, identity lock, readiness gates, handoff discipline, multi-clip continuity, QA before spend | Grok-specific agent implementation is not embedded |
| `Matticusnicholas/KupkaProd-Cinema-Pipeline` | non-commercial source license | **concepts only**: storyboard before expensive render, multiple takes, approve/reject, resume state, one scene/job | No source code, workflows or implementation copied into commercial Abrxs core |
| `AKCodez/higgsfield-claude-skills` | community automation | browser automation recognized only as fallback when no official execution surface exists | Playwright automation is not the primary provider backend because it is brittle |
| Open-Higgsfield-AI variants | mixed forks; inspect per repo | UI/model catalog reference: one prompt composer, model-specific settings, generation gallery, multi-reference patterns | Do not assume provider claims are authoritative; official Higgsfield catalog wins |
| `beshuaxian/higgsfield-seedance2-jineng` | community skills; license must be checked per revision | additional Seedance scenario taxonomy and multi-reference workflow ideas | No source reuse unless license is verified at the exact revision |

## V0.4 rules encoded in code

The following rules now exist in `src/skillEngine.ts`, not merely in documentation:

- canonical ABRAXAS production specification is provider-neutral;
- every reference has a semantic role (`identity`, `look`, `composition`, `wardrobe`, `location`, `motion`, `product`, `logo`, `palette`, `text-layout`, `first-frame`, `last-frame`);
- identity/location/light/palette/geometry form a reusable continuity pack;
- image-to-video prompts describe **motion/change** rather than re-describing the whole image;
- short-form video receives explicit temporal beats and synchronized audio intent;
- one shot should not carry more than two competing camera moves;
- provider/model limits are quality gates, not afterthoughts;
- live capability discovery is required before a provider-backed generation action is enabled;
- exact text inside an AI-generated image is treated as a risk; separate text layers are preferred when wording must be exact;
- expensive video generation should follow storyboard/keyframe review when identity/composition is critical;
- failed iterations should change the diagnosed failure, not randomly rewrite every successful decision.

## Execution priority

1. Official provider CLI/SDK/API.
2. Local adapter such as ComfyUI.
3. Browser automation only when no stable official execution surface exists and the user explicitly chooses it.

## Updating this file

When a skill/repo changes materially, update:

- source revision/date in the implementation issue or changelog;
- affected target profile in `skillEngine.ts`;
- smoke tests / quality gates;
- this provenance map if a license or ownership boundary changes.
