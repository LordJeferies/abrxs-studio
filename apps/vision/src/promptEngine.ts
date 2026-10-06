export type OutputLanguage = 'auto' | 'en' | 'es';

export type DirectorState = {
  idea: string;
  subject: string;
  environment: string;
  action: string;
  camera: string;
  lens: string;
  focal: string;
  aperture: string;
  framing: string;
  angle: string;
  movement: string;
  lighting: string;
  palette: string;
  atmosphere: string;
  style: string;
  aspect: string;
  brandPreset: string;
  preserve: Record<string, boolean>;
  outputLanguage?: OutputLanguage;
  visualFunction?: string;
  materialTexture?: string;
  brandElements?: string;
  textZones?: string;
  continuity?: string;
  evidenceConstraints?: string;
};

export type PromptQualityCheck = {
  id: string;
  label: string;
  passed: boolean;
  weight: number;
};

export type PromptQualityAudit = {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  checks: PromptQualityCheck[];
  warnings: string[];
};

export type PromptPair = {
  imagePrompt: string;
  motionPrompt: string;
  negativePrompt: string;
  productionSpec: string;
  quality: PromptQualityAudit;
};

export type BrandVisionPreset = {
  id: string;
  name: string;
  description: string;
  cameraLanguage: string;
  lightingLanguage: string;
  compositionLanguage: string;
  paletteLanguage: string;
  graphicLanguage: string;
  materialLanguage: string;
  typographyLanguage: string;
  continuityLanguage: string;
  textZoneLanguage: string;
  avoid: string;
};

export const brandPresets: BrandVisionPreset[] = [
  {
    id: 'clean-editorial',
    name: 'Clean Editorial',
    description: 'Neutral premium editorial photography with disciplined composition.',
    cameraLanguage: 'modern digital cinema, natural perspective, restrained depth of field, no arbitrary extreme lens distortion',
    lightingLanguage: 'soft motivated light with a clear source direction, realistic skin rendering, practical highlights kept below clipping',
    compositionLanguage: 'editorial negative space, one dominant focal hierarchy, calm asymmetry, readable foreground-to-background separation',
    paletteLanguage: 'neutral black, white and graphite with one restrained accent and natural skin tones',
    graphicLanguage: 'precise typography, minimal graphic overlays, generous spacing, no decorative UI that does not explain the idea',
    materialLanguage: 'realistic paper, glass, wood, metal and textile response; visible micro-texture without plastic AI sheen',
    typographyLanguage: 'clean sans hierarchy, restrained display type, high contrast and enough safe space for readable copy',
    continuityLanguage: 'keep treatment, texture, palette and photographic contrast stable across the set while varying scene and composition',
    textZoneLanguage: 'protect deliberate negative space away from faces, hands and the primary narrative object',
    avoid: 'generic AI gloss, excessive neon, random props, distorted anatomy, cluttered layouts, meaningless holograms, fake dashboards, decorative arrows',
  },
  {
    id: 'cinematic-education',
    name: 'Cinematic Educational',
    description: 'Professional explanatory visuals that remain cinematic and readable.',
    cameraLanguage: '35–85mm cinematic lens language, realistic perspective, deliberate focus planes selected to explain the mechanism',
    lightingLanguage: 'motivated key light with soft contrast and dimensional separation; highlights and practicals must support hierarchy',
    compositionLanguage: 'subject-led framing with intentional space for the explanatory object, evidence or supporting information',
    paletteLanguage: 'controlled cinematic neutrals with selective brand accents; avoid color used only as decoration',
    graphicLanguage: 'premium diagrams and callouts only when they clarify a relationship, sequence, comparison or decision',
    materialLanguage: 'physically credible objects, screens, paper and surfaces; diagrams should feel integrated into the world rather than floating randomly',
    typographyLanguage: 'legible editorial hierarchy with one dominant statement and support that remains secondary',
    continuityLanguage: 'repeat visual grammar, palette and explanatory logic across a sequence while changing the specific scene or metaphor',
    textZoneLanguage: 'reserve text-safe zones with enough contrast and breathing room; never place copy over critical evidence',
    avoid: 'template-like stock imagery, overdesigned graphics, tiny text, fake HDR, visual noise, generic business people, unmotivated glowing interfaces',
  },
  {
    id: 'luxury-documentary',
    name: 'Luxury Documentary',
    description: 'Observational realism with elevated cinematic craft.',
    cameraLanguage: 'documentary cinema camera, 50mm and 85mm emphasis, subtle handheld realism, human eye-level perspective unless story requires otherwise',
    lightingLanguage: 'available-light realism refined with motivated practicals, controlled falloff and gentle contrast',
    compositionLanguage: 'observational framing, imperfect human geometry, intentional foreground depth and environmental context',
    paletteLanguage: 'warm neutrals, deep blacks, restrained saturation and natural skin tones',
    graphicLanguage: 'minimal titles, tactile texture and elegant editorial spacing; graphics never overpower the photographed evidence',
    materialLanguage: 'tactile real-world surfaces, subtle wear, fabric, skin and practical environments with believable imperfections',
    typographyLanguage: 'minimal title treatment, quiet hierarchy and high legibility without luxury-brand clichés',
    continuityLanguage: 'preserve character identity, wardrobe logic, environmental texture and light direction across adjacent shots',
    textZoneLanguage: 'prefer environmental negative space and darker quiet areas for copy rather than overlaying faces',
    avoid: 'plastic skin, artificial symmetry, glossy stock aesthetic, oversharpening, empty luxury decoration, excessive bloom',
  },
  {
    id: 'joc-editorial',
    name: 'JOC Editorial System',
    description: 'JOC editorial photography: practical symbolism, strong hierarchy and controlled red/wine accents.',
    cameraLanguage: 'real editorial photography, current-camera realism, natural facial proportions, useful 35–85mm perspective, no fashion-ad distortion unless explicitly requested',
    lightingLanguage: 'professional motivated lighting with believable direction; soft lateral key or controlled studio light, dimensional but not glossy',
    compositionLanguage: 'strong negative space, one dominant idea per frame, practical symbolism, clear subject/object hierarchy and simple readable geometry',
    paletteLanguage: 'premium off-white, charcoal black, deep wine and controlled saturated red; accents only where they change meaning',
    graphicLanguage: 'condensed display statement, clean sans support and restrained handwritten red intervention only when it adds meaning',
    materialLanguage: 'real paper, stone, wood, metal, fabric and practical props; subtle film grain and physically coherent surface response',
    typographyLanguage: 'large readable statement, clean supporting copy, no tiny decorative type; preserve exact Spanish text when text is intentionally rendered',
    continuityLanguage: 'keep palette, photographic treatment, grain, typography behavior and identity stable across the set while changing scenes and visual metaphors',
    textZoneLanguage: 'protect strong negative space for text and keep copy away from Joc face, hands and the key explanatory object',
    avoid: 'generic stock business scenes, floating dashboards without explanatory function, excessive neon, empty luxury decoration, random arrows, distorted face, extra fingers, illegible text, AI-looking gloss, guru-poster clichés',
  },
];

export const defaults: DirectorState = {
  idea: 'A founder reviewing a difficult decision late at night in a quiet studio.',
  subject: 'one focused founder',
  environment: 'quiet contemporary studio at night',
  action: 'reviewing notes and pausing before making a decision',
  camera: 'Digital cinema',
  lens: 'Spherical',
  focal: '50mm',
  aperture: 'f/2.8',
  framing: 'Medium close-up',
  angle: 'Eye level',
  movement: 'Slow dolly in',
  lighting: 'Soft motivated window key + practical lamp',
  palette: 'Neutral graphite, warm skin, restrained amber practicals',
  atmosphere: 'Quiet, focused, realistic',
  style: 'Cinematic editorial realism',
  aspect: '4:5',
  brandPreset: 'clean-editorial',
  outputLanguage: 'auto',
  visualFunction: 'make the decision pressure legible through behavior, spatial hierarchy and one concrete visual cue',
  materialTexture: 'physically plausible materials, realistic micro-texture, subtle optical falloff, no plastic AI surface treatment',
  brandElements: 'use only brand-relevant palette, type zones and graphic behavior; no decorative logo placement unless requested',
  textZones: 'reserve clean negative space for optional typography without covering the face, hands or the key narrative object',
  continuity: 'preserve subject identity, wardrobe, environment geography, light direction, palette and photographic treatment across related outputs',
  evidenceConstraints: 'do not fabricate logos, interfaces, documents, metrics, quotes or factual evidence that were not supplied',
  preserve: {
    subject: true,
    action: true,
    composition: true,
    position: true,
    message: true,
    literalText: true,
    references: true,
  },
};

function compact(parts: Array<string | undefined>) {
  return parts.map((part) => part?.trim()).filter(Boolean).join(', ');
}

function detectLanguage(source: string): 'en' | 'es' {
  const sample = source.toLowerCase();
  const spanishSignals = /[áéíóúñ¿¡]|\b(el|la|los|las|un|una|que|para|con|sin|porque|cliente|decisión|imagen|escena|persona)\b/g;
  const englishSignals = /\b(the|a|an|that|for|with|without|because|client|decision|image|scene|person)\b/g;
  const es = (sample.match(spanishSignals) ?? []).length;
  const en = (sample.match(englishSignals) ?? []).length;
  return es > en ? 'es' : 'en';
}

function resolvedLanguage(state: DirectorState): 'en' | 'es' {
  if (state.outputLanguage === 'es' || state.outputLanguage === 'en') return state.outputLanguage;
  return detectLanguage(state.idea);
}

function line(label: string, value: string) {
  return `${label}: ${value}`;
}

function genericityWarning(idea: string, language: 'en' | 'es') {
  const normalized = idea.trim().toLowerCase();
  const thin = normalized.length < 32;
  const adjectiveOnly = /^(premium|cinematic|professional|modern|beautiful|epic|cinematográfico|premium|profesional|moderno|bonito|épico)([ ,]+(premium|cinematic|professional|modern|beautiful|epic|cinematográfico|profesional|moderno|bonito|épico))*[.!]?$/i.test(normalized);
  if (!thin && !adjectiveOnly) return '';
  return language === 'es'
    ? 'La idea de entrada todavía es poco específica. El compilador puede completar una especificación técnica, pero la calidad conceptual mejora si nombras sujeto, acción, tensión o mecanismo concreto.'
    : 'The input idea is still underspecified. The compiler can complete a technical production spec, but concept quality improves when you name a concrete subject, action, tension or mechanism.';
}

export function auditPrompt(state: DirectorState): PromptQualityAudit {
  const checks: PromptQualityCheck[] = [
    { id: 'idea', label: 'specific idea', passed: state.idea.trim().length >= 24, weight: 12 },
    { id: 'subject', label: 'subject', passed: state.subject.trim().length >= 3, weight: 8 },
    { id: 'scene', label: 'scene/environment', passed: state.environment.trim().length >= 3, weight: 8 },
    { id: 'action', label: 'action', passed: state.action.trim().length >= 3, weight: 8 },
    { id: 'composition', label: 'composition/framing', passed: Boolean(state.framing && state.angle), weight: 9 },
    { id: 'camera', label: 'camera/lens/focal/aperture', passed: Boolean(state.camera && state.lens && state.focal && state.aperture), weight: 9 },
    { id: 'light', label: 'motivated light', passed: state.lighting.trim().length >= 8, weight: 8 },
    { id: 'materials', label: 'material/texture', passed: Boolean(state.materialTexture?.trim()), weight: 6 },
    { id: 'brand', label: 'brand system', passed: Boolean(state.brandPreset && state.palette), weight: 7 },
    { id: 'function', label: 'visual function', passed: Boolean(state.visualFunction?.trim()), weight: 8 },
    { id: 'text', label: 'text zones', passed: Boolean(state.textZones?.trim()), weight: 4 },
    { id: 'continuity', label: 'continuity', passed: Boolean(state.continuity?.trim()), weight: 5 },
    { id: 'evidence', label: 'evidence constraints', passed: Boolean(state.evidenceConstraints?.trim()), weight: 4 },
    { id: 'ratio', label: 'canvas/aspect', passed: Boolean(state.aspect), weight: 4 },
  ];
  const score = checks.reduce((total, check) => total + (check.passed ? check.weight : 0), 0);
  const warnings: string[] = [];
  const language = resolvedLanguage(state);
  const generic = genericityWarning(state.idea, language);
  if (generic) warnings.push(generic);
  if (!state.visualFunction?.trim()) warnings.push(language === 'es' ? 'Falta declarar qué función narrativa cumple la imagen.' : 'The narrative function of the image is not declared.');
  if (!state.evidenceConstraints?.trim()) warnings.push(language === 'es' ? 'No hay restricciones explícitas contra evidencia inventada.' : 'No explicit constraint prevents fabricated evidence.');
  const grade: PromptQualityAudit['grade'] = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 65 ? 'C' : 'D';
  return { score, grade, checks, warnings };
}

export function compilePrompt(state: DirectorState): PromptPair {
  const language = resolvedLanguage(state);
  const brand = brandPresets.find((preset) => preset.id === state.brandPreset) ?? brandPresets[0];
  const locked = Object.entries(state.preserve)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key)
    .join(', ');
  const visualFunction = state.visualFunction ?? defaults.visualFunction!;
  const materialTexture = state.materialTexture ?? defaults.materialTexture!;
  const brandElements = state.brandElements ?? defaults.brandElements!;
  const textZones = state.textZones ?? brand.textZoneLanguage;
  const continuity = state.continuity ?? brand.continuityLanguage;
  const evidenceConstraints = state.evidenceConstraints ?? defaults.evidenceConstraints!;
  const quality = auditPrompt({ ...defaults, ...state });

  const l = language === 'es'
    ? {
        role: 'ROL', purpose: 'FUNCIÓN VISUAL', subject: 'SUJETO Y ACCIÓN', scene: 'ESCENA', composition: 'COMPOSICIÓN', camera: 'CÁMARA', light: 'ILUMINACIÓN', material: 'MATERIAL Y TEXTURA', palette: 'PALETA Y MARCA', typography: 'TIPOGRAFÍA / ZONA DE TEXTO', continuity: 'CONTINUIDAD', evidence: 'EVIDENCIA', output: 'SALIDA', negative: 'NEGATIVOS',
        imageRole: 'fotograma editorial/cinematográfico listo para producción',
        motionRole: 'continuación de movimiento cinematográfico del fotograma establecido',
        outputText: 'imagen físicamente coherente, anatomía natural, materiales creíbles, detalle de producción alto, jerarquía focal limpia y sin apariencia genérica de IA',
        motionOutput: 'movimiento estable y físicamente plausible, geometría consistente, continuidad facial y corporal, parallax sutil, sin teletransportes de cámara ni mutaciones de objetos',
        whatIs: 'una especificación de producción visual ejecutable que traduce la intención en decisiones observables',
        whatNot: 'no es una lista de adjetivos, un póster motivacional genérico, una escena de stock ni una reinterpretación libre de decisiones bloqueadas',
        acceptance: 'el visual debe añadir significado; si se elimina, debe perderse explicación, tensión, contraste, orientación, evidencia o emoción',
        handoff: 'apto para generador de imagen/video, revisión humana y posterior uso en Vision/Dresser sin necesitar el historial de este chat',
      }
    : {
        role: 'ROLE', purpose: 'VISUAL FUNCTION', subject: 'SUBJECT & ACTION', scene: 'SCENE', composition: 'COMPOSITION', camera: 'CAMERA', light: 'LIGHT', material: 'MATERIAL & TEXTURE', palette: 'PALETTE & BRAND', typography: 'TYPOGRAPHY / TEXT ZONE', continuity: 'CONTINUITY', evidence: 'EVIDENCE', output: 'OUTPUT', negative: 'NEGATIVES',
        imageRole: 'production-ready editorial/cinematic hero frame',
        motionRole: 'cinematic motion continuation of the established hero frame',
        outputText: 'physically coherent image, natural anatomy, credible materials, high production detail, clean focal hierarchy and no generic AI look',
        motionOutput: 'stable physically plausible movement, consistent geometry, facial and body continuity, subtle parallax, no camera teleportation or object mutation',
        whatIs: 'an executable visual production specification that translates intent into observable decisions',
        whatNot: 'not an adjective list, generic motivational poster, stock scene or free reinterpretation of locked decisions',
        acceptance: 'the visual must add meaning; removing it should lose explanation, tension, contrast, orientation, evidence or emotion',
        handoff: 'ready for an image/video generator, human review and later Vision/Dresser use without requiring this conversation history',
      };

  const imagePrompt = [
    line(l.role, l.imageRole),
    line(l.purpose, visualFunction),
    line(l.subject, `${state.subject}; ${state.action}. Core idea: ${state.idea}`),
    line(l.scene, `${state.environment}; atmosphere: ${state.atmosphere}`),
    line(l.composition, `${state.framing}, ${state.angle}; ${brand.compositionLanguage}`),
    line(l.camera, `${state.camera}; ${state.lens}; ${state.focal}; ${state.aperture}; ${brand.cameraLanguage}`),
    line(l.light, `${state.lighting}; ${brand.lightingLanguage}`),
    line(l.material, `${materialTexture}; ${brand.materialLanguage}`),
    line(l.palette, `${state.palette}; ${brand.paletteLanguage}; ${brandElements}`),
    line(l.typography, `${textZones}; ${brand.typographyLanguage}; ${brand.graphicLanguage}`),
    line(l.continuity, `${continuity}; preserve locked decisions: ${locked}`),
    line(l.evidence, evidenceConstraints),
    line(l.output, `${l.outputText}; canvas ${state.aspect}`),
    line(l.negative, `${brand.avoid}, warped hands, duplicate subjects, unstable face identity, random text, broken typography, inconsistent light direction, floating objects, overprocessed skin`),
  ].join('\n');

  const motionPrompt = [
    line(l.role, l.motionRole),
    line(l.purpose, visualFunction),
    line(l.subject, `${state.subject}; action over time: ${state.action}`),
    line(l.scene, `start from the exact established environment and spatial relationships: ${state.environment}`),
    line(l.camera, `${state.movement}; maintain ${state.framing}, ${state.angle}, ${state.focal}, ${state.lens}`),
    line(l.light, `maintain source direction and exposure logic from ${state.lighting}`),
    line(l.material, 'preserve object mass, surface response, cloth behavior, hair behavior and practical environmental physics'),
    line(l.continuity, `${continuity}; preserve subject identity, wardrobe, body proportions, object placement, palette and all locked director decisions: ${locked}`),
    line(l.evidence, evidenceConstraints),
    line(l.output, `${l.motionOutput}; no unnecessary action beyond the stated beat`),
    line(l.negative, `${brand.avoid}, face drift, hand mutation, geometry breathing, sliding textures, flickering text, sudden lens changes, camera teleportation, random new objects, unmotivated speed ramps`),
  ].join('\n');

  const negativePrompt = compact([
    brand.avoid,
    'warped hands',
    'duplicate subjects',
    'unstable face identity',
    'random text',
    'broken typography',
    'overprocessed skin',
    'floating objects',
    'inconsistent lighting direction',
    'camera teleportation',
    'generic stock-business staging',
    'AI-looking gloss',
  ]);

  const productionSpec = [
    '# ABRXS VISION PRODUCTION SPEC',
    '',
    `WHAT IT IS: ${l.whatIs}`,
    `WHAT IT IS NOT: ${l.whatNot}`,
    `OBJECTIVE: ${visualFunction}`,
    `CONTEXT: ${state.idea}`,
    `CLIENT / BRAND RULES: ${brand.description}; ${brand.paletteLanguage}; ${brand.graphicLanguage}`,
    `FORMAT RULES: canvas ${state.aspect}; ${state.framing}; ${state.angle}; text-safe zones must remain usable`,
    `RESTRICTIONS: ${evidenceConstraints}; preserve ${locked}`,
    `NEGATIVES: ${negativePrompt}`,
    `OUTPUT CONTRACT: one autonomous hero-frame prompt + one autonomous motion prompt + explicit negatives + continuity constraints`,
    `ACCEPTANCE CRITERIA: ${l.acceptance}`,
    `QA: prompt quality ${quality.score}/100 (${quality.grade}); no decorative image, no adjective-only direction, no fabricated evidence, no unexplained camera/light choices`,
    `HANDOFF: ${l.handoff}`,
    `CONTINUITY: ${continuity}`,
  ].join('\n');

  return { imagePrompt, motionPrompt, negativePrompt, productionSpec, quality };
}

export type CarouselSlide = {
  id: string;
  number: number;
  title: string;
  body: string;
  narrativeRole: 'HOOK' | 'CONTEXT' | 'PROGRESSION' | 'MECHANISM' | 'PAYOFF';
};

export function parseCarouselCopy(raw: string): CarouselSlide[] {
  const chunks = raw
    .split(/\n\s*\n/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks.map((chunk, index) => {
    const [first, ...rest] = chunk.split('\n');
    const title = first.replace(/^slide\s*\d+\s*[:.-]?\s*/i, '').trim();
    const body = rest.join(' ').trim();
    const narrativeRole: CarouselSlide['narrativeRole'] = index === 0
      ? 'HOOK'
      : index === chunks.length - 1
        ? 'PAYOFF'
        : index === 1
          ? 'CONTEXT'
          : index % 2 === 0
            ? 'PROGRESSION'
            : 'MECHANISM';
    return { id: `slide-${index + 1}`, number: index + 1, title: title || `Slide ${index + 1}`, body, narrativeRole };
  });
}

export type CarouselPromptSpec = {
  imagePrompt: string;
  visualDirection: string;
  continuityNote: string;
  negativeConstraints: string;
};

export function compileCarouselPromptSpec(
  slide: Pick<CarouselSlide, 'number' | 'title' | 'body'> & { narrativeRole?: CarouselSlide['narrativeRole'] },
  style: string,
  textMode: 'integrated' | 'separate' | 'clean',
  presetId: string,
  aspect: string,
): CarouselPromptSpec {
  const brand = brandPresets.find((preset) => preset.id === presetId) ?? brandPresets[0];
  const role = slide.narrativeRole ?? (slide.number === 1 ? 'HOOK' : 'PROGRESSION');
  const textInstruction = textMode === 'integrated'
    ? `Render the exact headline “${slide.title}”${slide.body ? ` and exact supporting copy “${slide.body}”` : ''} with flawless legibility and intentional hierarchy; text is part of the composition, not an afterthought.`
    : textMode === 'separate'
      ? `Do not render text in the base image. Reserve a deliberate text-safe zone for headline “${slide.title}”${slide.body ? ` and body “${slide.body}”` : ''}; typography will be delivered as a separate transparent layer.`
      : 'Generate a clean image with no visible typography, logos or pseudo-text; preserve layout-safe negative space for later design.';
  const visualFunction = role === 'HOOK'
    ? 'create a clear unresolved visual tension that earns the next slide without giving away the full conclusion'
    : role === 'CONTEXT'
      ? 'make the problem concrete and immediately understandable without repeating the headline literally'
      : role === 'MECHANISM'
        ? 'visualize the causal mechanism or relationship so the viewer understands how the idea works'
        : role === 'PAYOFF'
          ? 'resolve the visual argument and leave one memorable, useful synthesis rather than a generic motivational ending'
          : 'advance the argument with one new visual unit; do not restate the previous slide';
  const visualDirection = `${role}: ${visualFunction}. Build one dominant visual idea derived from “${slide.title}”${slide.body ? ` and “${slide.body}”` : ''}. Use ${brand.compositionLanguage}. The image must explain, contrast, orient, humanize, symbolize or create useful tension; it must not exist only as decoration.`;
  const continuityNote = `${brand.continuityLanguage}. Keep palette, typography behavior, texture and photographic treatment coherent with adjacent slides while changing the scene/metaphor enough to avoid repetition.`;
  const negativeConstraints = `${brand.avoid}; no fabricated logos, real-looking evidence, fake screenshots, fake metrics or documentary claims unless supplied; no generic stock-business scene; no decorative holograms; no illegible pseudo-text.`;
  const imagePrompt = [
    `ROLE: production-ready carousel frame · narrative role ${role}`,
    `PURPOSE: ${visualFunction}`,
    `CONTENT: headline “${slide.title}”${slide.body ? `; supporting idea “${slide.body}”` : ''}`,
    `VISUAL DIRECTION: ${visualDirection}`,
    `SCENE / SUBJECT: create a concrete, physically plausible scene or conceptual object arrangement that visualizes the meaning rather than merely illustrating the topic`,
    `COMPOSITION: ${brand.compositionLanguage}; clear focal hierarchy; one dominant idea; intentional negative space`,
    `CAMERA: ${brand.cameraLanguage}`,
    `LIGHT: ${brand.lightingLanguage}`,
    `MATERIAL / TEXTURE: ${brand.materialLanguage}`,
    `PALETTE / BRAND: ${brand.paletteLanguage}; ${style}`,
    `TYPOGRAPHY / TEXT ZONE: ${textInstruction} ${brand.typographyLanguage}`,
    `CONTINUITY: ${continuityNote}`,
    `NEGATIVE CONSTRAINTS: ${negativeConstraints}`,
    `OUTPUT: finished editorial social image, ${aspect}, production-ready detail, readable hierarchy, no generic template aesthetic`,
  ].join('\n');
  return { imagePrompt, visualDirection, continuityNote, negativeConstraints };
}

export function compileCarouselPrompt(
  slide: Pick<CarouselSlide, 'number' | 'title' | 'body'> & { narrativeRole?: CarouselSlide['narrativeRole'] },
  style: string,
  textMode: 'integrated' | 'separate' | 'clean',
  presetId: string,
  aspect: string,
) {
  return compileCarouselPromptSpec(slide, style, textMode, presetId, aspect).imagePrompt;
}
