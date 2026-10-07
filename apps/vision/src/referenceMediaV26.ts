import type { CSSProperties } from 'react';
import type { DirectorCategory, DirectorOption } from './directorFinal';

export type ReferenceScene = {
  id: string;
  label: string;
  url: string;
  credit: string;
  kind: 'portrait' | 'environment' | 'motion';
  objectPosition?: string;
};

const HUMAN_PORTRAIT: ReferenceScene = {
  id: 'human-portrait-a',
  label: 'Human portrait / controlled interior',
  url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=90',
  credit: 'Photographic reference · Unsplash CDN',
  kind: 'portrait',
  objectPosition: '50% 42%',
};

const HUMAN_PORTRAIT_B: ReferenceScene = {
  id: 'human-portrait-b',
  label: 'Human portrait / natural skin',
  url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1600&q=90',
  credit: 'Photographic reference · Unsplash CDN',
  kind: 'portrait',
  objectPosition: '50% 38%',
};

const HUMAN_EDITORIAL: ReferenceScene = {
  id: 'human-editorial',
  label: 'Editorial human reference',
  url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=90',
  credit: 'Photographic reference · Unsplash CDN',
  kind: 'portrait',
  objectPosition: '50% 40%',
};

const HUMAN_BUSINESS: ReferenceScene = {
  id: 'human-business',
  label: 'Human / professional environment',
  url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1600&q=90',
  credit: 'Photographic reference · Unsplash CDN',
  kind: 'portrait',
  objectPosition: '50% 36%',
};

const ENVIRONMENT: ReferenceScene = {
  id: 'environment-office',
  label: 'Interior / spatial reference',
  url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=90',
  credit: 'Photographic reference · Unsplash CDN',
  kind: 'environment',
  objectPosition: '50% 50%',
};

const CATEGORY_SCENES: Partial<Record<DirectorCategory, ReferenceScene>> = {
  shot: HUMAN_BUSINESS,
  camera: HUMAN_BUSINESS,
  lens: HUMAN_PORTRAIT,
  angle: HUMAN_BUSINESS,
  aperture: HUMAN_PORTRAIT_B,
  focus: HUMAN_PORTRAIT_B,
  shutter: HUMAN_EDITORIAL,
  frameRate: HUMAN_EDITORIAL,
  whiteBalance: HUMAN_PORTRAIT_B,
  composition: HUMAN_BUSINESS,
  lighting: HUMAN_PORTRAIT,
  movement: HUMAN_EDITORIAL,
  subjectMotion: HUMAN_EDITORIAL,
  environmentMotion: ENVIRONMENT,
  look: HUMAN_PORTRAIT_B,
  atmosphere: HUMAN_BUSINESS,
  material: HUMAN_PORTRAIT_B,
  fx: HUMAN_PORTRAIT,
};

export function sceneForCategory(category: DirectorCategory): ReferenceScene {
  return CATEGORY_SCENES[category] ?? HUMAN_PORTRAIT;
}

export function photographicStyle(option: DirectorOption): CSSProperties {
  const p = option.preview;
  const warm = p.warmth ?? 0;
  const contrast = p.contrast ?? 1;
  const blur = p.blur ?? 0;
  const grain = p.grain ?? 0;
  const haze = p.haze ?? 0;
  const bloom = p.bloom ?? 0;
  const subjectScale = p.subjectScale ?? 1;
  const backgroundScale = p.backgroundScale ?? 1;

  return {
    '--ref-scale': String(Math.max(.82, Math.min(1.4, subjectScale * backgroundScale))),
    '--ref-x': `${p.subjectX ?? 0}%`,
    '--ref-y': `${p.subjectY ?? 0}%`,
    '--ref-blur': `${Math.round(blur * 18)}px`,
    '--ref-contrast': String(Math.max(.72, Math.min(1.45, contrast))),
    '--ref-saturate': String(warm < -.15 ? .78 : warm > .2 ? 1.08 : .96),
    '--ref-warm': String(Math.max(-1, Math.min(1, warm))),
    '--ref-grain': String(Math.max(0, Math.min(1, grain))),
    '--ref-haze': String(Math.max(0, Math.min(1, haze))),
    '--ref-bloom': String(Math.max(0, Math.min(1, bloom))),
  } as CSSProperties;
}

export function isDepthCategory(category: DirectorCategory) {
  return category === 'aperture' || category === 'focus';
}

export function isMotionCategory(category: DirectorCategory) {
  return category === 'movement' || category === 'subjectMotion' || category === 'environmentMotion' || category === 'shutter' || category === 'frameRate';
}
