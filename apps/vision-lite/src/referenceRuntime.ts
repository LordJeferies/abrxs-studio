import { GROUPS, type Category } from './engine';
import { VISUAL_META, type VisualMeta } from './visualCatalog';

export type ReferenceValidationIssue = {
  category: Category;
  optionId: string;
  problem: string;
};

export type ReferenceValidationReport = {
  totalOptions: number;
  uniqueImages: number;
  issues: ReferenceValidationIssue[];
};

const FALLBACK_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop stop-color="#191d24"/>
      <stop offset="1" stop-color="#080a0e"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#g)"/>
  <circle cx="600" cy="310" r="92" fill="#313845"/>
  <path d="M390 700c18-190 104-286 210-286s192 96 210 286" fill="#252b35"/>
  <path d="M110 660h980" stroke="#50596a" stroke-width="3" stroke-dasharray="12 16"/>
  <text x="600" y="752" fill="#8e98aa" font-size="34" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" text-anchor="middle">Referencia visual no disponible</text>
</svg>`);

export const REFERENCE_FALLBACK = `data:image/svg+xml;charset=utf-8,${FALLBACK_SVG}`;

export function validateReferenceCatalog(): ReferenceValidationReport {
  const issues: ReferenceValidationIssue[] = [];
  const images = new Set<string>();
  let totalOptions = 0;

  for (const group of GROUPS) {
    for (const option of group.options) {
      totalOptions += 1;
      const meta = VISUAL_META[group.id]?.[option.id];
      if (!meta) {
        issues.push({ category: group.id, optionId: option.id, problem: 'Falta metadata visual.' });
        continue;
      }
      if (!meta.image) issues.push({ category: group.id, optionId: option.id, problem: 'Falta imagen.' });
      if (!meta.notice) issues.push({ category: group.id, optionId: option.id, problem: 'Falta “Qué debes notar”.' });
      if (!meta.explanation) issues.push({ category: group.id, optionId: option.id, problem: 'Falta explicación.' });
      if (!meta.infographic?.kind) issues.push({ category: group.id, optionId: option.id, problem: 'Falta especificación de infografía.' });
      if (meta.image) {
        if (images.has(meta.image)) issues.push({ category: group.id, optionId: option.id, problem: 'La imagen se repite en otra opción.' });
        images.add(meta.image);
      }
    }
  }

  return { totalOptions, uniqueImages: images.size, issues };
}

export function referenceFor(category: Category, optionId: string): VisualMeta {
  const meta = VISUAL_META[category]?.[optionId];
  if (!meta) {
    return {
      image: REFERENCE_FALLBACK,
      notice: 'La referencia de esta opción todavía no está disponible.',
      cue: 'Referencia pendiente',
      explanation: 'Vision conserva la selección y muestra un fallback estable en lugar de romper el selector.',
      infographic: { kind: category === 'lens' ? 'fov' : category === 'aperture' ? 'depth' : category === 'angle' ? 'angle' : category === 'light' ? 'light' : category === 'movement' ? 'motion' : category === 'look' ? 'grade' : 'framing', label: 'Referencia pendiente' }
    };
  }
  return meta;
}

export function warmReferenceCache(category: Category, optionId: string) {
  if (typeof window === 'undefined') return;
  const group = GROUPS.find(item => item.id === category);
  if (!group) return;
  const index = group.options.findIndex(option => option.id === optionId);
  const candidates = [index, index + 1, index - 1]
    .filter(i => i >= 0 && i < group.options.length)
    .map(i => referenceFor(category, group.options[i].id).image)
    .filter(Boolean);

  for (const src of candidates) {
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
  }
}
