import type { DirectorState } from './promptEngine';

export type ConstraintStrategy = 'positive-only' | 'positive-first' | 'separate-negative';

export type ConstraintBrief = {
  mustAvoid?: string;
  literalText?: string;
};

export type ConstraintPack = {
  strategy: ConstraintStrategy;
  positive: string[];
  negative: string[];
  userAvoid: string[];
  unresolved: string[];
  notes: string[];
};

const splitItems = (value: string | undefined) => (value ?? '')
  .split(/\n|;|,(?=\s*[A-Za-zÁÉÍÓÚáéíóúÑñ])/)
  .map((item) => item.trim())
  .filter(Boolean);

function strategyForTarget(target: string): ConstraintStrategy {
  if (target === 'comfyui') return 'separate-negative';
  if (target === 'generic-production') return 'positive-first';
  return 'positive-only';
}

function commonPositive(state: DirectorState, video: boolean, literalText?: string) {
  const items = [
    'anatomically coherent people with stable body proportions and naturally resolved hands',
    'subject identity and facial proportions remain stable across the output',
    'materials preserve physically believable texture, reflections and contact shadows',
    `lighting direction remains motivated and internally consistent: ${state.lighting}`,
    'camera perspective remains physically coherent with the selected focal length and shot size',
    'background geometry and object positions remain stable unless the shot explicitly changes them',
    'image quality remains crisp on the intended focal plane; any softness belongs to a named depth plane or optical event',
  ];
  if (video) {
    items.push(
      'one primary action drives the clip; secondary motion stays subordinate and physically motivated',
      'camera movement follows one readable path without contradictory simultaneous moves',
      'motion remains smooth and temporally continuous without sudden geometry resets',
    );
  }
  if (literalText?.trim()) items.push('literal typography must remain readable and exact; if the selected model cannot guarantee text fidelity, deliver the image clean and place type as a separate layer');
  return items;
}

const avoidMappings: Array<{ pattern: RegExp; positive: (state: DirectorState) => string }> = [
  { pattern: /extra\s*(limb|finger|arm|leg)|dedos? extra|extremidades? extra|anatom/i, positive: () => 'all visible limbs and hands are anatomically coherent, naturally positioned and clearly separated' },
  { pattern: /plastic|waxy|piel pl[aá]stica|muñec/i, positive: () => 'skin retains natural micro-texture, pores and subtle tonal variation without cosmetic smoothing' },
  { pattern: /blur|borroso|soft focus|desenfo/i, positive: () => 'the intended focal subject remains sharply resolved; depth-of-field falloff is confined to the specifically chosen background plane' },
  { pattern: /jitter|shake|shaky|tembl|vibr/i, positive: () => 'camera and subject motion remain smooth, continuous and mechanically plausible' },
  { pattern: /neon|ne[oó]n/i, positive: (state) => `color stays inside the declared palette (${state.palette}); practical accents remain restrained and motivated by real light sources` },
  { pattern: /yellow|amarill|warm wash|c[aá]lido exces/i, positive: (state) => `the dominant palette remains ${state.palette}; warm color appears only where explicitly motivated by a named practical source` },
  { pattern: /logo|marca invent|fake brand|branding falso/i, positive: () => 'only supplied/approved brand marks may appear; otherwise surfaces remain unbranded and clean' },
  { pattern: /dashboard|hologram|holograma|floating ui|interfaz flotante/i, positive: () => 'graphics remain physically grounded and appear only when they explain a requested mechanism; otherwise the photographed world stays free of interface overlays' },
  { pattern: /stock|business stock|oficina gen[eé]rica|corporate stock/i, positive: () => 'blocking, props and environment are specific to the described situation and feel observed rather than staged as generic business stock' },
  { pattern: /text|texto|pseudo.?text|gibberish|letras? ilegibles/i, positive: () => 'base imagery remains free of accidental pseudo-text; exact copy is reserved for the dedicated typography layer unless explicitly supported' },
  { pattern: /overexpos|blown highlight|altas luces/i, positive: () => 'highlight detail remains retained with controlled roll-off and readable surface texture' },
  { pattern: /fisheye|distortion|distorsi[oó]n|warped lens/i, positive: () => 'perspective follows the selected lens with natural facial/object proportions and no unintended wide-angle warping' },
  { pattern: /ai gloss|glossy ai|aspecto ia|look de ia/i, positive: () => 'surface response stays materially specific, optically grounded and free of uniform synthetic sheen' },
  { pattern: /duplicate|duplicad/i, positive: () => 'each intended subject appears exactly once unless the brief explicitly calls for repetition or reflection' },
  { pattern: /morph|mutaci|derret/i, positive: () => 'object topology and subject identity remain stable from frame to frame unless a transformation is the explicit primary action' },
];

function translateAvoidance(item: string, state: DirectorState) {
  const match = avoidMappings.find((entry) => entry.pattern.test(item));
  return match?.positive(state) ?? '';
}

export function compileConstraintPack(state: DirectorState, target: string, mode: string, brief: ConstraintBrief = {}): ConstraintPack {
  const strategy = strategyForTarget(target);
  const video = mode.includes('video');
  const userAvoid = splitItems(brief.mustAvoid);
  const positive = commonPositive(state, video, brief.literalText);
  const unresolved: string[] = [];

  for (const item of userAvoid) {
    const translated = translateAvoidance(item, state);
    if (translated) positive.push(translated);
    else if (strategy === 'positive-only') unresolved.push(item);
  }

  const negative = [
    'identity drift',
    'duplicate subjects',
    'anatomy errors',
    'extra or merged limbs',
    'object morphing',
    'unstable geometry',
    'random pseudo-text',
    'unmotivated camera jumps',
    'inconsistent lighting direction',
    'generic AI surface gloss',
    ...userAvoid,
  ].filter(Boolean);

  const dedupe = (items: string[]) => Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
  const notes: string[] = [];
  if (strategy === 'positive-only') notes.push('This target defaults to positive prevention language. Free-form avoid terms are not blindly appended as negative syntax.');
  if (strategy === 'separate-negative') notes.push('This target can carry a dedicated negative-conditioning block when the selected workflow/model exposes it.');
  if (unresolved.length) notes.push('Some free-form exclusions could not be safely translated into a positive desired state. Keep them visible for human QA or rewrite them as what should be true instead.');

  return {
    strategy,
    positive: dedupe(positive),
    negative: dedupe(negative),
    userAvoid,
    unresolved: dedupe(unresolved),
    notes,
  };
}

export function renderConstraintBlock(pack: ConstraintPack) {
  if (pack.strategy === 'separate-negative') {
    return [
      'POSITIVE PREVENTION / STABILITY',
      ...pack.positive.map((item) => `- ${item}`),
      '',
      'NEGATIVE CONDITIONING',
      ...pack.negative.map((item) => `- ${item}`),
    ].join('\n');
  }
  return [
    'POSITIVE CONSTRAINTS',
    ...pack.positive.map((item) => `- ${item}`),
    ...(pack.unresolved.length ? ['', 'HUMAN QA · UNRESOLVED EXCLUSIONS', ...pack.unresolved.map((item) => `- ${item}`)] : []),
  ].join('\n');
}
