export type XRollLayerRole = 'background' | 'atmosphere' | 'midground' | 'subject' | 'prop' | 'foreground' | 'graphics' | 'text';

export type XRollLayer = {
  id: string;
  role: XRollLayerRole;
  label: string;
  purpose: string;
  prompt: string;
  alpha: boolean;
  parallax: number;
};

export type XRollPreset = {
  id: string;
  name: string;
  family: string;
  duration: number;
  aspect: string;
  layerCount: number;
  camera: string;
  motion: string;
  textMode: 'separate' | 'integrated' | 'none';
  style: string;
};

export type XRollSpec = {
  schema: 'abrxs.vision.xroll.v2';
  id: string;
  idea: string;
  visualFunction: string;
  metaphor: string;
  duration: number;
  aspect: string;
  brand: string;
  style: string;
  camera: string;
  motion: string;
  layers: XRollLayer[];
  masterPrompt: string;
  motionPrompt: string;
  compositeSpec: string;
  qa: string[];
};

export const xrollPresets: XRollPreset[] = [
  { id: 'concept-reveal', name: 'Concept Reveal', family: 'Conceptual editorial', duration: 6, aspect: '9:16', layerCount: 4, camera: '50mm neutral perspective', motion: 'slow push-in with restrained differential parallax', textMode: 'separate', style: 'editorial documentary realism' },
  { id: 'problem-solution', name: 'Problem → Solution', family: 'Two-state transformation', duration: 7, aspect: '9:16', layerCount: 5, camera: '35–50mm natural perspective', motion: 'state A holds, transition at 55%, state B resolves hierarchy', textMode: 'separate', style: 'clean conceptual editorial' },
  { id: 'decision', name: 'Decision / Criterion', family: 'Decision mechanism', duration: 6, aspect: '9:16', layerCount: 5, camera: '50mm medium compression', motion: 'slow push; one object becomes dominant', textMode: 'separate', style: 'physical cards, matte materials, restrained brand accent' },
  { id: 'depth-parallax', name: 'Depth Parallax', family: 'Layered spatial reveal', duration: 6, aspect: '9:16', layerCount: 5, camera: '50mm', motion: '3D multiplane parallax, no orbit beyond plausible source geometry', textMode: 'separate', style: 'photographic layers with real depth cues' },
  { id: 'data-focus', name: 'Data Focus', family: 'Abstract data mechanism', duration: 6, aspect: '9:16', layerCount: 5, camera: 'editorial top/three-quarter view', motion: 'progressive emphasis, no fake proprietary UI', textMode: 'separate', style: 'abstract operational data, physical-card language' },
  { id: 'quote-concept', name: 'Quote Concept', family: 'Claim visualization', duration: 5, aspect: '9:16', layerCount: 3, camera: '50mm or still-life editorial', motion: 'subtle push or locked frame', textMode: 'separate', style: 'single visual metaphor, generous text-safe space' },
];

const rolesByCount: Record<number, XRollLayerRole[]> = {
  2: ['background', 'subject'],
  3: ['background', 'subject', 'foreground'],
  4: ['background', 'midground', 'subject', 'foreground'],
  5: ['background', 'midground', 'subject', 'foreground', 'graphics'],
  6: ['background', 'atmosphere', 'midground', 'subject', 'foreground', 'graphics'],
  7: ['background', 'atmosphere', 'midground', 'subject', 'prop', 'foreground', 'graphics'],
  8: ['background', 'atmosphere', 'midground', 'subject', 'prop', 'foreground', 'graphics', 'text'],
};

function normalizeLayerCount(value: number) {
  return Math.max(2, Math.min(8, Math.round(value || 4)));
}

function roleLabel(role: XRollLayerRole) {
  return role.replace(/(^|\s|-)([a-z])/g, (_m, lead, char) => `${lead}${char.toUpperCase()}`);
}

function inferFunction(idea: string) {
  const lower = idea.toLowerCase();
  if (/vs\.?|versus|diferencia|compar|contraste|antes|después|before|after/.test(lower)) return 'CONTRAST';
  if (/proceso|paso|cómo|how|flujo|workflow|mecanismo|mechanism/.test(lower)) return 'SHOW PROCESS';
  if (/decid|criterio|choice|option|opci/.test(lower)) return 'EXPLAIN + CONTRAST';
  if (/dato|crm|pipeline|métrica|metric|registro/.test(lower)) return 'EXPLAIN';
  return 'SYMBOLIZE + EXPLAIN';
}

function inferMetaphor(idea: string) {
  const lower = idea.toLowerCase();
  if (/criterio|decid|opci/.test(lower)) return 'Several visually equivalent options reorganized by one explicit criterion.';
  if (/crm|pipeline|seguimiento|next action/.test(lower)) return 'A visually full system that remains motionless until a next-action signal becomes visible.';
  if (/presión|foco|focus|pressure/.test(lower)) return 'Competing signals collapse into one dominant focal path.';
  if (/proceso|workflow|paso/.test(lower)) return 'A sequence of physical stages that becomes clearer as each dependency is isolated.';
  return 'Translate the abstract claim into one observable physical relationship; avoid literal decoration.';
}

function layerPurpose(role: XRollLayerRole) {
  const purposes: Record<XRollLayerRole, string> = {
    background: 'Establish location/world and keep it stable as the clean plate.',
    atmosphere: 'Add depth/air only when it supports scale or mood; never hide information.',
    midground: 'Carry secondary structure and depth relationships.',
    subject: 'Carry the dominant mechanism, person or hero object.',
    prop: 'Carry the key evidence/decision object that changes the meaning of the shot.',
    foreground: 'Create depth, framing and controlled parallax without stealing focus.',
    graphics: 'Carry editable annotations, indicators or controlled brand geometry.',
    text: 'Carry exact typography as an editable layer instead of model-rendered body copy.',
  };
  return purposes[role];
}

function layerPrompt(role: XRollLayerRole, idea: string, style: string, brand: string, aspect: string, metaphor: string) {
  const common = `XRoll production asset. Concept: ${idea}. Visual mechanism: ${metaphor}. Style: ${style}. Brand/DNA: ${brand}. Canvas ${aspect}. Maintain the same perspective, material language, palette and light direction as the related layers. No invented logos, claims, statistics, testimonials or proprietary UI.`;
  const specifics: Record<XRollLayerRole, string> = {
    background: 'BACKGROUND CLEAN PLATE: environment only, no hero subject, no foreground props, no text. Leave composition room for downstream layers.',
    atmosphere: 'ATMOSPHERE: transparent/isolatable haze, practical glow or particulate depth only if physically motivated. No fog wall, no decorative neon.',
    midground: 'MIDGROUND: supporting structures/objects that explain spatial context. Preserve clean edges and depth separation.',
    subject: 'SUBJECT/HERO: isolate the primary person/object/mechanism. Preserve anatomy/geometry and identity. Transparent background preferred when supported.',
    prop: 'KEY PROP: isolate the evidence/decision object that changes the scene meaning. Accurate material scale and contact behavior.',
    foreground: 'FOREGROUND: isolatable framing/depth elements with clean edges. Keep the dominant subject readable.',
    graphics: 'GRAPHICS: editable, non-proprietary diagram/indicator geometry. Prefer transparent background; no unreadable generated paragraphs.',
    text: 'TEXT LAYER: exact approved copy only. Keep typography separate/editable whenever exact spelling matters.',
  };
  return `${common}\n${specifics[role]}\nDELIVERY: one independent asset for this layer only; no collage/contact sheet.`;
}

export function compileXRoll(input: {
  idea: string;
  duration?: number;
  aspect?: string;
  brand?: string;
  style?: string;
  layerCount?: number;
  camera?: string;
  motion?: string;
  preset?: XRollPreset;
}): XRollSpec {
  const preset = input.preset ?? xrollPresets[0];
  const idea = input.idea.trim() || 'Make one abstract idea observable through a clear visual mechanism.';
  const duration = Math.max(2, Math.min(20, Number(input.duration ?? preset.duration)));
  const aspect = input.aspect || preset.aspect;
  const brand = input.brand || 'inherit current Brand Vision profile';
  const style = input.style || preset.style;
  const layerCount = normalizeLayerCount(input.layerCount ?? preset.layerCount);
  const camera = input.camera || preset.camera;
  const motion = input.motion || preset.motion;
  const visualFunction = inferFunction(idea);
  const metaphor = inferMetaphor(idea);
  const roles = rolesByCount[layerCount] ?? rolesByCount[4];
  const layers = roles.map((role, index) => ({
    id: `L${String(index + 1).padStart(2, '0')}_${role.toUpperCase()}`,
    role,
    label: roleLabel(role),
    purpose: layerPurpose(role),
    prompt: layerPrompt(role, idea, style, brand, aspect, metaphor),
    alpha: !['background', 'midground'].includes(role),
    parallax: role === 'foreground' ? 1.8 : role === 'subject' || role === 'prop' ? 1 : role === 'midground' ? 0.65 : role === 'background' ? 0.25 : 1.1,
  }));

  const masterPrompt = [
    'ABRXS VISION V2 · XROLL MASTER',
    `PURPOSE: ${visualFunction}.`,
    `IDEA: ${idea}`,
    `VISUAL MECHANISM: ${metaphor}`,
    `FORMAT: ${aspect}, ${duration.toFixed(1)} seconds.`,
    `STYLE / BRAND: ${style}; ${brand}.`,
    `CAMERA: ${camera}.`,
    `MOTION: ${motion}. One primary visual change; secondary movement only when it clarifies depth or causality.`,
    `LAYER PLAN: ${layers.map((layer) => `${layer.id} ${layer.role}`).join(' · ')}.`,
    'MATERIAL / PHYSICS: believable contact, weight, occlusion, reflections and parallax. Avoid topology drift and synthetic AI gloss.',
    'TEXT: keep body copy and exact typography as separate editable graphics unless the delivery contract explicitly requests integrated text.',
    'CONTINUITY: lock perspective, spatial geography, object identity, palette, material response and light direction across every layer/state.',
    'RESTRICTIONS: no invented evidence, proprietary UI, random holograms, arbitrary neon, decorative clutter, duplicate subjects, watermarks or collage.',
    'OUTPUT: Dresser-ready independent layers plus one composite reference; stable IDs and no hidden flattening of editable text.',
  ].join('\n');

  const motionPrompt = [
    'ABRXS XROLL MOTION SPEC',
    `DURATION: ${duration.toFixed(1)}s`,
    `PRIMARY CHANGE: ${metaphor}`,
    `CAMERA: ${camera}; ${motion}.`,
    'TIMING: establish state A, make one legible transition, hold the resolved state long enough to read the relationship.',
    `PARALLAX: ${layers.map((layer) => `${layer.id}=${layer.parallax}x`).join(' · ')}`,
    'PHYSICS: layers preserve contact/occlusion; no independent floating unless intentionally defined.',
    'END STATE: the visual relationship must be understandable before the cut.',
  ].join('\n');

  const compositeSpec = [
    'COMPOSITE ORDER (back → front)',
    ...layers.map((layer, index) => `${index + 1}. ${layer.id} · ${layer.role} · ${layer.alpha ? 'alpha/isolatable' : 'opaque/base'} · parallax ${layer.parallax}x`),
    'TEXT/GRAPHICS remain editable whenever possible.',
    'DRESSER HANDOFF: preserve layer IDs, aspect, timing and the master motion spec.',
  ].join('\n');

  return {
    schema: 'abrxs.vision.xroll.v2',
    id: `XR_${Date.now()}`,
    idea,
    visualFunction,
    metaphor,
    duration,
    aspect,
    brand,
    style,
    camera,
    motion,
    layers,
    masterPrompt,
    motionPrompt,
    compositeSpec,
    qa: [
      'One dominant visual function is identifiable.',
      'Every layer has a reason to exist; decorative layers can be removed.',
      'Perspective/light/material continuity is stable.',
      'The main change is legible without explanatory narration.',
      'Text remains editable when exact spelling matters.',
      'No fabricated evidence, logos, metrics or UI.',
    ],
  };
}
