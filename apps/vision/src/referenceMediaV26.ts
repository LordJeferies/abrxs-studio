import type { DirectorOption } from './directorFinal';

export type ReferenceScene = {
  id: string;
  label: string;
  url: string;
  credit: string;
  objectPosition?: string;
  fidelity: 'photographic-example' | 'curated-effect-reference';
};

const OGA = 'https://raw.githubusercontent.com/Anil-matcha/Open-Generative-AI/main/public/assets/cinema';

function photo(id: string, url: string, label: string, objectPosition = '50% 42%'): ReferenceScene {
  return { id, url, label, objectPosition, credit: 'Photographic example · Unsplash', fidelity: 'photographic-example' };
}

function cinema(id: string, file: string, label: string): ReferenceScene {
  return {
    id,
    label,
    url: `${OGA}/${file}`,
    credit: 'Cinema reference asset · Open Generative AI · MIT',
    objectPosition: '50% 50%',
    fidelity: 'curated-effect-reference',
  };
}

const CLOSE = photo('close', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=90', 'Close human portrait');
const NATURAL = photo('natural', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1600&q=90', 'Natural portrait', '50% 38%');
const EDITORIAL = photo('editorial', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=90', 'Editorial portrait', '50% 40%');
const BUSINESS = photo('business', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1600&q=90', 'Professional environmental portrait', '50% 36%');
const STREET = photo('street', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1600&q=90', 'Environmental portrait', '50% 40%');
const WIDE = photo('wide', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=90', 'Wide spatial reference', '50% 50%');
const LOW = photo('low', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1600&q=90', 'Low perspective portrait', '50% 45%');
const DRAMA = photo('drama', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1600&q=90', 'Dramatic portrait', '50% 42%');

const APERTURE: Record<string, ReferenceScene> = {
  f14: cinema('ap-f14', 'f_1_4.webp', 'f/1.4 shallow depth reference'),
  f20: cinema('ap-f20', 'f_1_4.webp', 'f/2 shallow depth reference'),
  f28: cinema('ap-f28', 'f_4.webp', 'Moderate cinematic depth reference'),
  f40: cinema('ap-f40', 'f_4.webp', 'f/4 balanced depth reference'),
  f56: cinema('ap-f56', 'f_11.webp', 'Deeper focus reference'),
  f8: cinema('ap-f8', 'f_11.webp', 'Deep focus reference'),
};

const CAMERA: Record<string, ReferenceScene> = {
  'large-format': cinema('cam-large', 'premium_large_format_digital.webp', 'Large-format digital response'),
  super35: cinema('cam-s35', 'studio_digital_s35.webp', 'Super 35 studio response'),
  'full-frame': cinema('cam-ff', 'full_frame_cine_digital.webp', 'Full-frame cinema response'),
  'documentary-sensor': cinema('cam-doc', 'classic_16mm_film.webp', 'Documentary cinema response'),
};

const SPECIAL_LENS: Record<string, ReferenceScene> = {
  anamorphic: cinema('lens-anamorphic', 'classic_anamorphic.webp', 'Classic anamorphic reference'),
  vintage: cinema('lens-vintage', '70s_cinema_prime.webp', 'Vintage cinema prime reference'),
  macro100: cinema('lens-macro', 'extreme_macro.webp', 'Extreme macro reference'),
};

function focalExample(option: DirectorOption) {
  const focal = Number(option.id.match(/\d+/)?.[0] ?? 50);
  if (focal <= 24) return WIDE;
  if (focal <= 35) return STREET;
  if (focal <= 50) return BUSINESS;
  if (focal <= 85) return NATURAL;
  return CLOSE;
}

export function sceneForOption(option: DirectorOption): ReferenceScene {
  if (option.category === 'camera') return CAMERA[option.id] ?? BUSINESS;
  if (option.category === 'aperture') return APERTURE[option.id] ?? NATURAL;
  if (option.category === 'lens') return SPECIAL_LENS[option.id] ?? focalExample(option);

  if (option.category === 'shot') {
    if (option.id === 'ecu' || option.id === 'cu') return CLOSE;
    if (option.id === 'mcu') return NATURAL;
    if (option.id === 'medium') return BUSINESS;
    return WIDE;
  }

  if (option.category === 'angle') {
    if (['ground', 'low', 'waist'].includes(option.id)) return LOW;
    if (['high', 'overhead'].includes(option.id)) return WIDE;
    if (option.id === 'dutch') return DRAMA;
    return BUSINESS;
  }

  if (option.category === 'focus') {
    if (option.id === 'deep') return APERTURE.f8;
    if (option.id === 'foreground') return APERTURE.f14;
    return NATURAL;
  }

  if (option.category === 'lighting') {
    if (['beauty', 'overcast'].includes(option.id)) return NATURAL;
    if (['hard-side', 'noir', 'top'].includes(option.id)) return DRAMA;
    if (['backlight', 'practical'].includes(option.id)) return STREET;
    return EDITORIAL;
  }

  if (option.category === 'look') {
    if (option.id === '16mm') return cinema('look16', 'classic_16mm_film.webp', '16mm film reference');
    if (option.id === 'soft-diffusion') return cinema('lookdiff', 'halation_diffusion.webp', 'Diffusion reference');
    return EDITORIAL;
  }

  if (option.category === 'composition') return ['symmetry', 'leading'].includes(option.id) ? WIDE : BUSINESS;
  if (['movement', 'subjectMotion', 'shutter', 'frameRate'].includes(option.category)) return STREET;
  if (['environmentMotion', 'atmosphere'].includes(option.category)) return WIDE;
  if (option.category === 'material') return option.id === 'natural-skin' ? NATURAL : EDITORIAL;
  if (option.category === 'fx') return DRAMA;
  return BUSINESS;
}

export function isDepthCategory(category: string) {
  return category === 'aperture' || category === 'focus';
}

export function isMotionCategory(category: string) {
  return ['movement', 'subjectMotion', 'environmentMotion', 'shutter', 'frameRate'].includes(category);
}
