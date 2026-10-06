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
};

export type PromptPair = {
  imagePrompt: string;
  motionPrompt: string;
  negativePrompt: string;
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
  avoid: string;
};

export const brandPresets: BrandVisionPreset[] = [
  {
    id: 'clean-editorial',
    name: 'Clean Editorial',
    description: 'Neutral premium editorial photography with disciplined composition.',
    cameraLanguage: 'modern digital cinema, natural perspective, restrained depth of field',
    lightingLanguage: 'soft motivated light, realistic skin rendering, clean practical highlights',
    compositionLanguage: 'editorial negative space, clear focal hierarchy, calm asymmetry',
    paletteLanguage: 'neutral black, white and graphite with one restrained accent',
    graphicLanguage: 'precise typography, minimal graphic overlays, generous spacing',
    avoid: 'generic AI gloss, excessive neon, random props, distorted anatomy, cluttered layouts',
  },
  {
    id: 'cinematic-education',
    name: 'Cinematic Educational',
    description: 'Professional explanatory visuals that remain cinematic and readable.',
    cameraLanguage: '35–85mm cinematic lens language, realistic perspective, deliberate focus planes',
    lightingLanguage: 'motivated key light with soft contrast and dimensional separation',
    compositionLanguage: 'subject-led framing with deliberate space for supporting information',
    paletteLanguage: 'controlled cinematic neutrals with selective brand accents',
    graphicLanguage: 'premium diagrams, restrained callouts, highly legible text hierarchy',
    avoid: 'template-like stock imagery, overdesigned graphics, tiny text, fake HDR, visual noise',
  },
  {
    id: 'luxury-documentary',
    name: 'Luxury Documentary',
    description: 'Observational realism with elevated cinematic craft.',
    cameraLanguage: 'documentary cinema camera, 50mm and 85mm emphasis, subtle handheld realism',
    lightingLanguage: 'available-light realism refined with motivated practicals and gentle contrast',
    compositionLanguage: 'observational framing, imperfect human geometry, intentional foreground depth',
    paletteLanguage: 'warm neutrals, deep blacks, restrained saturation, natural skin tones',
    graphicLanguage: 'minimal titles, tactile texture, elegant editorial spacing',
    avoid: 'plastic skin, artificial symmetry, glossy stock aesthetic, oversharpening',
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

export function compilePrompt(state: DirectorState): PromptPair {
  const brand = brandPresets.find((preset) => preset.id === state.brandPreset) ?? brandPresets[0];
  const locked = Object.entries(state.preserve)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key)
    .join(', ');

  const imagePrompt = compact([
    state.idea,
    `Subject: ${state.subject}`,
    `Environment: ${state.environment}`,
    `Action: ${state.action}`,
    `${state.framing}, ${state.angle}`,
    `${state.camera}, ${state.lens}, ${state.focal}, ${state.aperture}`,
    state.lighting,
    state.palette,
    state.atmosphere,
    state.style,
    brand.cameraLanguage,
    brand.lightingLanguage,
    brand.compositionLanguage,
    brand.paletteLanguage,
    `aspect ratio ${state.aspect}`,
    `preserve director intent: ${locked}`,
    'photographically coherent materials, physically plausible light, natural anatomy, premium production detail, clean focal hierarchy',
  ]);

  const motionPrompt = compact([
    `Start from the established hero frame and preserve subject identity, environment, wardrobe, spatial relationships and composition.` ,
    `Action: ${state.action}`,
    `Camera movement: ${state.movement}`,
    `${state.framing}, ${state.angle}, ${state.focal}`,
    `Maintain ${state.lighting.toLowerCase()}`,
    `Motion should feel physically plausible, restrained and cinematic, with stable geometry, natural body mechanics, subtle parallax and continuity across the shot.`,
    `Do not reinterpret locked director decisions: ${locked}`,
  ]);

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
  ]);

  return { imagePrompt, motionPrompt, negativePrompt };
}

export function parseCarouselCopy(raw: string) {
  const chunks = raw
    .split(/\n\s*\n/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks.map((chunk, index) => {
    const [first, ...rest] = chunk.split('\n');
    const title = first.replace(/^slide\s*\d+\s*[:.-]?\s*/i, '').trim();
    const body = rest.join(' ').trim();
    return {
      id: `slide-${index + 1}`,
      number: index + 1,
      title: title || `Slide ${index + 1}`,
      body,
    };
  });
}

export function compileCarouselPrompt(
  slide: { number: number; title: string; body: string },
  style: string,
  textMode: 'integrated' | 'separate' | 'clean',
  presetId: string,
  aspect: string,
) {
  const brand = brandPresets.find((preset) => preset.id === presetId) ?? brandPresets[0];
  const textInstruction =
    textMode === 'integrated'
      ? `Integrate the exact headline “${slide.title}”${slide.body ? ` and exact supporting copy “${slide.body}”` : ''} into the composition with flawless readable typography.`
      : textMode === 'separate'
        ? `Do not render text in the base image. Reserve intentional negative space for headline “${slide.title}”${slide.body ? ` and body “${slide.body}”` : ''}; deliver typography as a separate transparent layer.`
        : `Generate a clean image with no visible typography or logos; reserve layout-safe negative space for later design.`;

  return compact([
    `Carousel slide ${slide.number}`,
    `visual concept derived from: ${slide.title}${slide.body ? `. ${slide.body}` : ''}`,
    style,
    brand.cameraLanguage,
    brand.lightingLanguage,
    brand.compositionLanguage,
    brand.paletteLanguage,
    brand.graphicLanguage,
    textInstruction,
    `aspect ratio ${aspect}`,
    'premium editorial design, disciplined hierarchy, production-ready detail, no generic template aesthetic',
  ]);
}
