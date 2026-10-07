import { DIRECTOR_OPTIONS, DIRECTOR_PRESETS, optionById, type DirectorCategory, type DirectorPreset } from './directorCatalog';

export type DirectorOutputMode = 'image' | 'video' | 'xroll';
export type DirectorSelections = Partial<Record<DirectorCategory, string>>;

export type DirectedPrompt = {
  sourceText: string;
  mode: DirectorOutputMode;
  prompt: string;
  decisions: Array<{ category: DirectorCategory; label: string; prompt: string }>;
  missing: DirectorCategory[];
};

const ESSENTIAL_BY_MODE: Record<DirectorOutputMode, DirectorCategory[]> = {
  image: ['shot', 'lens', 'composition', 'lighting', 'focus', 'look'],
  video: ['shot', 'lens', 'composition', 'lighting', 'focus', 'movement', 'look'],
  xroll: ['shot', 'lens', 'composition', 'lighting', 'focus', 'movement', 'atmosphere'],
};

const DEFAULTS_BY_MODE: Record<DirectorOutputMode, DirectorSelections> = {
  image: { shot: 'mcu', lens: '50mm', focus: 'moderate', composition: 'thirds', lighting: 'soft-side', movement: 'static', look: 'clean', atmosphere: 'clean-air', fx: 'none' },
  video: { shot: 'mcu', lens: '50mm', focus: 'moderate', composition: 'thirds', lighting: 'soft-side', movement: 'push', look: '35mm-film', atmosphere: 'clean-air', fx: 'none' },
  xroll: { shot: 'medium', lens: '35mm', focus: 'deep', composition: 'layered', lighting: 'soft-side', movement: 'push', look: 'clean', atmosphere: 'clean-air', fx: 'none' },
};

function normalizeSentence(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

export function resolvedSelections(mode: DirectorOutputMode, selections: DirectorSelections, useSuggestedDefaults = true): DirectorSelections {
  return useSuggestedDefaults ? { ...DEFAULTS_BY_MODE[mode], ...selections } : { ...selections };
}

export function compileDirectedPrompt(
  sourceText: string,
  mode: DirectorOutputMode,
  selections: DirectorSelections,
  options: { useSuggestedDefaults?: boolean; aspect?: string; duration?: string; preserveText?: boolean } = {},
): DirectedPrompt {
  const merged = resolvedSelections(mode, selections, options.useSuggestedDefaults ?? true);
  const decisions = (Object.entries(merged) as Array<[DirectorCategory, string]>).flatMap(([category, id]) => {
    const found = DIRECTOR_OPTIONS.find((item) => item.category === category && item.id === id);
    return found ? [{ category, label: found.label, prompt: found.prompt }] : [];
  });
  const essential = ESSENTIAL_BY_MODE[mode];
  const missing = essential.filter((category) => !selections[category]);
  const source = normalizeSentence(sourceText);
  const visualLanguage = decisions.map((decision) => decision.prompt).join('; ');
  const aspect = options.aspect || (mode === 'image' ? '4:5' : '9:16');
  const duration = options.duration || (mode === 'video' ? '6–8 seconds' : mode === 'xroll' ? '5–7 seconds' : 'single frame');
  const temporal = mode === 'image'
    ? 'Create one decisive still frame. Every visual choice must support the source idea; do not invent extra story beats.'
    : mode === 'video'
      ? `Build one coherent shot lasting ${duration}. Use one primary camera movement, one readable subject action and a clear end state. Preserve identity, geometry and physical continuity from first frame to last frame.`
      : `Build a layered XRoll lasting ${duration}. Separate background, midground, subject/hero object, foreground and graphics only when each layer has a narrative function. Motion must create controlled depth and parallax, not decorative movement.`;
  const constraints = mode === 'xroll'
    ? 'Keep every layer independently generatable and compositable. Avoid fake dashboards, arbitrary holograms, illegible text, impossible reflections, plastic AI surfaces and visual elements without explanatory function.'
    : 'Preserve subject identity, scene logic and evidence. Avoid generic stock-business staging, plastic skin, impossible anatomy, arbitrary holograms, fake interfaces, decorative effects and unmotivated camera movement.';
  const textRule = options.preserveText
    ? 'Preserve supplied literal text exactly. Protect a readable text-safe area and do not fabricate additional copy.'
    : 'Do not render body copy unless explicitly requested. Protect useful text-safe negative space.';

  const prompt = [
    `SOURCE INTENT — ${source}`,
    `VISUAL DIRECTION — ${visualLanguage}.`,
    `TEMPORAL / FRAME LOGIC — ${temporal}`,
    `CONTINUITY — Keep identity, wardrobe, environment geography, light direction, palette and optical treatment stable unless the source text explicitly requires a change.`,
    `TEXT — ${textRule}`,
    `CONSTRAINTS — ${constraints}`,
    `OUTPUT — ${aspect}, ${duration}, production-ready ${mode === 'image' ? 'image' : mode === 'video' ? 'video shot' : 'XRoll package'}, physically plausible, clean focal hierarchy and no generic AI gloss.`,
  ].join('\n\n');

  return { sourceText, mode, prompt, decisions, missing };
}

export function selectionsFromPreset(preset: DirectorPreset): DirectorSelections {
  return { ...preset.values };
}

export function recommendDirectorPresets(sourceText: string, mode: DirectorOutputMode, limit = 5): DirectorPreset[] {
  const text = sourceText.toLowerCase();
  const scores = DIRECTOR_PRESETS.map((preset) => {
    let score = 0;
    const family = preset.family.toLowerCase();
    const label = preset.label.toLowerCase();
    const description = preset.description.toLowerCase();
    const haystack = `${family} ${label} ${description}`;
    const rules: Array<[RegExp, string[], number]> = [
      [/decision|criterion|decisión|criterio|pressure|tension|tensión/, ['decision','pressure','business','cinema'], 6],
      [/portrait|face|rostro|persona|testimonial|testimonio/, ['portrait','beauty','editorial','social'], 5],
      [/product|producto|bottle|watch|shoe|packaging/, ['product','commercial','beauty'], 6],
      [/architecture|building|interior|space|arquitectura|espacio/, ['architecture'], 7],
      [/documentary|interview|documental|entrevista|real/, ['documentary'], 6],
      [/car|automotive|vehicle|auto|coche|vehículo/, ['automotive'], 8],
      [/food|comida|plato|restaurant|restaurante/, ['food'], 8],
      [/night|noche|dark|oscuro|practical/, ['night','cinema'], 5],
      [/social|reel|vertical|creator|podcast/, ['social'], 6],
      [/xroll|xr|layer|layers|parallax|parallax|capa|capas/, ['xroll'], 9],
      [/luxury|premium|lujo/, ['commercial','product','editorial'], 4],
    ];
    for (const [rx, tags, weight] of rules) {
      if (!rx.test(text)) continue;
      if (tags.some((tag) => haystack.includes(tag))) score += weight;
    }
    if (mode === 'xroll' && family.includes('xroll')) score += 12;
    if (mode === 'video' && (family.includes('cinema') || family.includes('documentary') || family.includes('social'))) score += 3;
    if (mode === 'image' && (family.includes('editorial') || family.includes('beauty') || family.includes('commercial'))) score += 2;
    return { preset, score };
  });
  return scores.sort((a, b) => b.score - a.score || a.preset.label.localeCompare(b.preset.label)).slice(0, limit).map((entry) => entry.preset);
}

export function selectedOptionSummary(selections: DirectorSelections) {
  return (Object.entries(selections) as Array<[DirectorCategory, string]>).flatMap(([category, id]) => {
    const selected = optionById(id);
    return selected ? [{ category, id, label: selected.label, effect: selected.effect, prompt: selected.prompt }] : [];
  });
}
