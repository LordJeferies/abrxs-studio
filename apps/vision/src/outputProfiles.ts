export type PromptOutputProfileId =
  | 'hero-image'
  | 'storyboard-frame'
  | 'carousel-slide'
  | 'xroll-still'
  | 'cinematic-shot'
  | 'xroll-video'
  | 'product-hero'
  | 'clean-plate'
  | 'transparent-layer'
  | 'social-vertical-video';

export type PromptOutputProfile = {
  id: PromptOutputProfileId;
  label: { en: string; es: string };
  description: { en: string; es: string };
  kind: 'image' | 'video' | 'layer';
  defaultMode: 'text-to-image' | 'image-to-image' | 'text-to-video' | 'image-to-video';
  recommendedAspect?: string;
  deliverables: string[];
  promptInstruction: string;
  acceptance: string[];
  textPolicy: 'none' | 'optional' | 'separate-preferred' | 'exact-if-supported';
  alpha: boolean;
};

export const outputProfiles: PromptOutputProfile[] = [
  {
    id: 'hero-image',
    label: { en: 'Hero image', es: 'Imagen hero' },
    description: { en: 'One finished key visual with a strong focal hierarchy.', es: 'Una imagen clave terminada con jerarquía focal fuerte.' },
    kind: 'image',
    defaultMode: 'text-to-image',
    deliverables: ['final image', 'clean composition', 'production prompt', 'constraint pack'],
    promptInstruction: 'Deliver one autonomous hero frame with a single dominant visual idea, usable as the approved key image for downstream variants.',
    acceptance: ['one dominant focal idea', 'clean subject/background separation', 'usable crop/safe space', 'no unexplained decorative elements'],
    textPolicy: 'separate-preferred',
    alpha: false,
  },
  {
    id: 'storyboard-frame',
    label: { en: 'Storyboard frame', es: 'Fotograma de storyboard' },
    description: { en: 'A production-planning frame that prioritizes blocking, geography and continuity.', es: 'Fotograma de planificación que prioriza bloqueo, geografía y continuidad.' },
    kind: 'image',
    defaultMode: 'text-to-image',
    recommendedAspect: '16:9',
    deliverables: ['storyboard frame', 'shot metadata', 'continuity notes', 'camera intent'],
    promptInstruction: 'Deliver a storyboard/keyframe that makes blocking, eyelines, spatial geography, shot size and narrative evidence unambiguous before expensive video generation.',
    acceptance: ['clear blocking', 'readable geography', 'camera intent visible', 'continuity anchors preserved'],
    textPolicy: 'none',
    alpha: false,
  },
  {
    id: 'carousel-slide',
    label: { en: 'Carousel slide visual', es: 'Visual de carrusel' },
    description: { en: 'A 4:5 editorial visual designed around copy hierarchy and sequence continuity.', es: 'Visual editorial 4:5 diseñado alrededor de jerarquía de copy y continuidad.' },
    kind: 'image',
    defaultMode: 'text-to-image',
    recommendedAspect: '4:5',
    deliverables: ['clean image', 'text-safe layout', 'slide prompt', 'continuity note'],
    promptInstruction: 'Deliver one carousel frame that advances the argument, reserves intentional copy space and remains visually coherent with adjacent slides without repeating their scene.',
    acceptance: ['narrative progress', 'text-safe hierarchy', 'brand continuity', 'distinct scene/metaphor'],
    textPolicy: 'separate-preferred',
    alpha: false,
  },
  {
    id: 'xroll-still',
    label: { en: 'XRoll still', es: 'XRoll estático' },
    description: { en: 'A layered visual meant to be animated or composited later.', es: 'Visual por capas pensado para animarse o componerse después.' },
    kind: 'image',
    defaultMode: 'text-to-image',
    deliverables: ['clean still', 'layer plan', 'depth cues', 'motion-ready composition'],
    promptInstruction: 'Deliver a motion-ready still with separable depth planes, clean occlusion edges and composition that can support parallax, camera push or graphic layering in post.',
    acceptance: ['separable depth planes', 'clean silhouette/occlusion', 'room for parallax', 'no baked-in UI unless requested'],
    textPolicy: 'separate-preferred',
    alpha: false,
  },
  {
    id: 'cinematic-shot',
    label: { en: 'Cinematic video shot', es: 'Plano cinematográfico' },
    description: { en: 'One production-ready video shot with controlled action and camera.', es: 'Un plano de video listo para producción con acción y cámara controladas.' },
    kind: 'video',
    defaultMode: 'text-to-video',
    recommendedAspect: '16:9',
    deliverables: ['video shot', 'motion prompt', 'continuity pack', 'timing plan'],
    promptInstruction: 'Deliver one coherent shot with one primary action, a feasible camera path, visible performance beats and stable identity/geometry across the full duration.',
    acceptance: ['one primary action', 'feasible camera path', 'stable identity', 'temporal payoff'],
    textPolicy: 'none',
    alpha: false,
  },
  {
    id: 'xroll-video',
    label: { en: 'XRoll video', es: 'XRoll de video' },
    description: { en: 'A short explanatory or atmospheric insert designed for editing.', es: 'Inserto explicativo o atmosférico corto diseñado para edición.' },
    kind: 'video',
    defaultMode: 'text-to-video',
    deliverables: ['short clip', 'clear in/out action', 'edit-safe handles', 'motion prompt'],
    promptInstruction: 'Deliver a concise insert with a readable beginning state, one meaningful change and a clean end state that can be cut into a larger edit.',
    acceptance: ['reads without narration', 'clear action arc', 'clean edit points', 'no unnecessary story reset'],
    textPolicy: 'none',
    alpha: false,
  },
  {
    id: 'product-hero',
    label: { en: 'Product hero', es: 'Hero de producto' },
    description: { en: 'A product-focused frame with material accuracy and controlled reflections.', es: 'Fotograma de producto con materiales precisos y reflejos controlados.' },
    kind: 'image',
    defaultMode: 'text-to-image',
    deliverables: ['hero product image', 'material/light spec', 'background treatment', 'constraint pack'],
    promptInstruction: 'Deliver a product-led frame where material, scale, silhouette, edge light and contact with the surface remain physically credible and brand-controlled.',
    acceptance: ['material fidelity', 'correct scale', 'controlled reflections', 'clean silhouette'],
    textPolicy: 'optional',
    alpha: false,
  },
  {
    id: 'clean-plate',
    label: { en: 'Clean plate', es: 'Clean plate' },
    description: { en: 'Background/environment plate with no foreground subject for later compositing.', es: 'Fondo o entorno sin sujeto principal para composición posterior.' },
    kind: 'image',
    defaultMode: 'text-to-image',
    deliverables: ['clean environment', 'consistent lighting', 'empty subject zone', 'composite-ready plate'],
    promptInstruction: 'Deliver the environment as a clean plate with coherent perspective and lighting, preserving the intended subject zone without inserting a person, product or graphic into it.',
    acceptance: ['empty subject zone', 'coherent perspective', 'matching light direction', 'no accidental foreground subject'],
    textPolicy: 'none',
    alpha: false,
  },
  {
    id: 'transparent-layer',
    label: { en: 'Transparent layer', es: 'Capa transparente' },
    description: { en: 'A foreground/graphic asset intended for compositing with alpha.', es: 'Asset de primer plano o gráfico pensado para composición con alfa.' },
    kind: 'layer',
    defaultMode: 'text-to-image',
    deliverables: ['isolated asset', 'transparent background', 'clean edges', 'layer metadata'],
    promptInstruction: 'Deliver one isolated visual element with clean silhouette and edge treatment for compositing; transparency/alpha is a delivery requirement, not a decorative background effect.',
    acceptance: ['isolated element', 'clean edges', 'no baked background', 'composition-safe scale'],
    textPolicy: 'optional',
    alpha: true,
  },
  {
    id: 'social-vertical-video',
    label: { en: 'Social vertical video', es: 'Video vertical social' },
    description: { en: 'A 9:16 short-form clip with hook, context, proof and payoff.', es: 'Clip corto 9:16 con hook, contexto, prueba y payoff.' },
    kind: 'video',
    defaultMode: 'text-to-video',
    recommendedAspect: '9:16',
    deliverables: ['vertical clip', 'hook frame', 'timing beats', 'safe caption zones'],
    promptInstruction: 'Deliver a vertical short-form shot or micro-sequence that reads immediately on mobile, keeps faces/action clear of caption zones and progresses from hook to useful payoff.',
    acceptance: ['mobile readability', 'early visual hook', 'caption-safe framing', 'clear payoff'],
    textPolicy: 'separate-preferred',
    alpha: false,
  },
];

export function getOutputProfile(id: PromptOutputProfileId | string | undefined) {
  return outputProfiles.find((profile) => profile.id === id) ?? outputProfiles[0];
}

export function outputProfileLabel(id: PromptOutputProfileId | string | undefined, language: 'en' | 'es') {
  const profile = getOutputProfile(id);
  return profile.label[language];
}
