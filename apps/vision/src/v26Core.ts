import {
  DIRECTOR_CATEGORIES,
  DIRECTOR_OPTIONS,
  type DirectorCategory,
  type DirectorMode,
  type DirectorOption,
  type DirectorSelections,
} from './directorFinal';

export type SourceAnalysis = {
  intent: string;
  subjects: string[];
  actions: string[];
  scene: string[];
  tone: string[];
  visualPriorities: string[];
  mustShow: string[];
  avoid: string[];
  semanticTags: string[];
};

export type DirectionRecommendation = {
  category: DirectorCategory;
  primary: DirectorOption;
  alternatives: DirectorOption[];
  reason: string;
  tradeoff: string;
  confidence: number;
};

export type DirectionConflict = {
  id: string;
  title: string;
  explanation: string;
  suggested?: Partial<DirectorSelections>;
};

const TAGS: Record<string, string[]> = {
  decision: ['decision','decisión','decidir','indecisión','indeciso','criterio','compare','compara','comparar','propuesta'],
  tension: ['tension','tensión','pressure','presión','doubt','duda','hesitate','vacila','pausa'],
  business: ['business','negocio','empresa','empresario','ejecutivo','ventas','cliente','propuesta'],
  authority: ['authority','autoridad','liderazgo','leadership','experto'],
  portrait: ['portrait','retrato','rostro','cara','face','persona','person'],
  documentary: ['documentary','documental','entrevista','interview','real','auténtico','autentico'],
  product: ['product','producto','botella','packaging','objeto'],
  luxury: ['luxury','lujo','premium','elegante'],
  architecture: ['architecture','arquitectura','interior','edificio','espacio','room'],
  automotive: ['car','auto','coche','automotive','vehículo','vehiculo'],
  food: ['food','comida','restaurante','plato','bebida'],
  fashion: ['fashion','moda','ropa','wardrobe','vestuario'],
  beauty: ['beauty','belleza','skincare','piel','cosmética','cosmetica'],
  night: ['night','noche','nocturno'],
  social: ['reel','tiktok','short','vertical','social'],
  table: ['mesa','table','escritorio','desktop'],
  documents: ['document','documento','proposal','propuesta','papel','paper','tarjeta','card'],
  motion: ['walk','camina','mueve','move','gira','turn','reach','alcanza'],
};

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function detectedTags(sourceText: string) {
  const text = normalize(sourceText);
  return Object.entries(TAGS)
    .filter(([, words]) => words.some((word) => text.includes(normalize(word))))
    .map(([tag]) => tag);
}

export function analyzeDirectorSource(sourceText: string, mode: DirectorMode): SourceAnalysis {
  const tags = detectedTags(sourceText);
  const has = (tag: string) => tags.includes(tag);
  const text = normalize(sourceText);

  const actions: string[] = [];
  if (/compar/.test(text)) actions.push('compare');
  if (/dud|hesitat|vacil|paus/.test(text)) actions.push('hesitate / pause');
  if (/mir|look|gaze/.test(text)) actions.push('redirect attention');
  if (/mano|hand|reach|alcanz/.test(text)) actions.push('hand action');
  if (/camin|walk/.test(text)) actions.push('walk');
  if (/gir|turn/.test(text)) actions.push('turn');

  const subjects = has('product')
    ? ['hero product / object']
    : has('business')
      ? ['decision-maker / business subject']
      : ['primary subject inferred from Source Truth'];

  const scene: string[] = [];
  if (has('table')) scene.push('tabletop / work surface');
  if (has('architecture')) scene.push('interior / architecture');
  if (has('night')) scene.push('night environment');
  if (!scene.length) scene.push('grounded source-led environment');

  const tone: string[] = [];
  if (has('tension') || has('decision')) tone.push('restrained internal tension');
  if (has('authority')) tone.push('quiet authority');
  if (has('documentary')) tone.push('observational realism');
  if (has('luxury')) tone.push('controlled premium finish');
  if (!tone.length) tone.push('neutral / source-led');

  const visualPriorities: string[] = [];
  if (has('portrait') || has('business')) visualPriorities.push('face / expression');
  if (has('documents')) visualPriorities.push('documents / proposals as narrative evidence');
  if (has('table')) visualPriorities.push('hands + table relationship');
  if (has('product')) visualPriorities.push('material / silhouette / surface response');
  if (has('architecture')) visualPriorities.push('space / depth / scale');
  if (!visualPriorities.length) visualPriorities.push('one clear focal hierarchy');

  const intent = has('decision')
    ? 'Make the decision process and its friction visually legible.'
    : has('product')
      ? 'Make product function, material and hierarchy immediately legible.'
      : has('architecture')
        ? 'Make scale, depth and spatial orientation legible.'
        : 'Translate the source idea into observable visual mechanisms without replacing its meaning.';

  return {
    intent,
    subjects,
    actions: actions.length ? actions : ['derive one observable action from Source Truth'],
    scene,
    tone,
    visualPriorities,
    mustShow: [...visualPriorities],
    avoid: ['generic AI spectacle', 'arbitrary holograms or fake interfaces', 'decorative motion without narrative function'],
    semanticTags: [...tags, mode],
  };
}

function scoreOption(option: DirectorOption, analysis: SourceAnalysis, mode: DirectorMode) {
  const tags = new Set(analysis.semanticTags);
  let score = option.tags.reduce((sum, tag) => sum + (tags.has(tag) ? 7 : 0), 0);
  const id = option.id;

  if (tags.has('decision') || tags.has('tension')) {
    if (['mcu','65mm','85mm','negative','soft-side','push','reach','cool-editorial'].includes(id)) score += 14;
  }
  if (tags.has('business') || tags.has('authority')) {
    if (['mcu','50mm','f28','window','soft-side','static','gesture','clean'].includes(id)) score += 10;
  }
  if (tags.has('documentary')) {
    if (['medium','documentary-sensor','35mm','f40','overcast','handheld','warm-doc'].includes(id)) score += 14;
  }
  if (tags.has('product')) {
    if (['cu','macro100','f28','center','product-rim','orbit','brushed-metal','glass','reflections'].includes(id)) score += 14;
  }
  if (tags.has('architecture')) {
    if (['wide','24mm','f56','deep','leading','window','crane','glass'].includes(id)) score += 14;
  }
  if (tags.has('beauty')) {
    if (['cu','85mm','f20','beauty','soft-diffusion','natural-skin','bloom'].includes(id)) score += 14;
  }
  if (tags.has('automotive')) {
    if (['wide','35mm','ground','product-rim','truck','rain','brushed-metal','reflections'].includes(id)) score += 14;
  }
  if (tags.has('food')) {
    if (['ecu','macro100','overhead','f28','soft-side','warm-doc'].includes(id)) score += 14;
  }
  if (mode === 'image' && ['movement','subjectMotion','environmentMotion','shutter','frameRate'].includes(option.category)) score -= 24;
  return score;
}

const REASONS: Partial<Record<DirectorCategory, string>> = {
  shot: 'Protect the information Source Truth needs while choosing how intimate the frame should feel.',
  camera: 'Choose capture character for function, not as a generic premium label.',
  lens: 'Use focal length to control spatial relationship, context and subject isolation.',
  angle: 'Use camera height to support the psychological and spatial relationship.',
  aperture: 'Depth of field must preserve any evidence that still needs to be read.',
  focus: 'Focus should point attention to the narrative evidence that matters most.',
  shutter: 'Motion blur should remain physically coherent with the intended action.',
  frameRate: 'Cadence should follow the movement and delivery requirement.',
  whiteBalance: 'Base temperature should keep motivated light sources coherent.',
  composition: 'Composition should make the intended hierarchy readable immediately.',
  lighting: 'Lighting needs a visible source, direction, quality and narrative function.',
  movement: 'Camera movement should intensify the idea without competing with it.',
  subjectMotion: 'Turn abstract intent into one observable physical action.',
  environmentMotion: 'Environmental motion should add physics, depth or context only.',
  look: 'The look should finish the image instead of replacing scene/camera/light decisions.',
  atmosphere: 'Atmosphere should reveal depth or climate without becoming decoration.',
  material: 'Material response should remain physically plausible under the selected light.',
  fx: 'FX should have an explicit visual function, not exist as filler.',
};

const TRADEOFFS: Partial<Record<DirectorCategory, string>> = {
  shot: 'More intimacy usually means less environmental evidence.',
  lens: 'Longer lenses isolate/compress; wider lenses reveal space but can exaggerate perspective.',
  aperture: 'Shallower depth isolates the subject but can hide useful background evidence.',
  lighting: 'More contrast adds separation but can change emotional tone.',
  movement: 'More camera energy can reduce clarity and authority.',
  look: 'A strong treatment can dominate skin, product colour or factual visual information.',
  atmosphere: 'More haze separates depth but lowers clarity and black density.',
};

export function recommendDirectorOptions(sourceText: string, mode: DirectorMode, analysis = analyzeDirectorSource(sourceText, mode)): DirectionRecommendation[] {
  return DIRECTOR_CATEGORIES.flatMap(({ id: category }) => {
    const ranked = DIRECTOR_OPTIONS
      .filter((option) => option.category === category)
      .map((option) => ({ option, score: scoreOption(option, analysis, mode) }))
      .sort((a, b) => b.score - a.score || a.option.label.localeCompare(b.option.label));
    const primary = ranked[0]?.option;
    if (!primary) return [];
    const bestScore = Math.max(0, ranked[0]?.score ?? 0);
    return [{
      category,
      primary,
      alternatives: ranked.slice(1, 3).map((entry) => entry.option),
      reason: REASONS[category] ?? 'Keep the decision motivated by Source Truth.',
      tradeoff: TRADEOFFS[category] ?? 'Compare the recommended option with one alternative before locking it.',
      confidence: Math.min(96, Math.max(52, 58 + bestScore)),
    }];
  });
}

export function detectDirectionConflicts(analysis: SourceAnalysis, mode: DirectorMode, selections: DirectorSelections): DirectionConflict[] {
  const result: DirectionConflict[] = [];
  const needsContext = analysis.visualPriorities.some((item) => /document|proposal|table|space|architecture/i.test(item));

  if (needsContext && ['ecu','cu'].includes(selections.shot ?? '')) {
    result.push({
      id: 'context-vs-close',
      title: 'The frame may hide required evidence',
      explanation: 'Source Truth requires context or objects in addition to the subject.',
      suggested: { shot: 'medium' },
    });
  }
  if (needsContext && selections.lens === '135mm') {
    result.push({
      id: 'context-vs-tele',
      title: 'The focal length may compress too much context',
      explanation: 'A long telephoto can make the spatial relationship required by Source Truth harder to read.',
      suggested: { lens: '50mm' },
    });
  }
  if (needsContext && ['f14','f20'].includes(selections.aperture ?? '')) {
    result.push({
      id: 'evidence-vs-dof',
      title: 'Depth of field may hide useful evidence',
      explanation: 'Several planes or objects need to remain readable for the scene to make sense.',
      suggested: { aperture: 'f40' },
    });
  }
  if (mode === 'image' && selections.movement && selections.movement !== 'static') {
    result.push({
      id: 'image-motion',
      title: 'Camera trajectory is not necessary for a still image',
      explanation: 'Describe the decisive frame instead of an unused temporal camera path.',
    });
  }
  return result;
}

export function anatomyGroup(category: string) {
  if (['camera','shot','angle'].includes(category)) return 'Camera';
  if (['lens','aperture','focus'].includes(category)) return 'Optics';
  if (['shutter','frameRate'].includes(category)) return 'Motion rendering';
  if (['whiteBalance','lighting'].includes(category)) return 'Light / color';
  if (['movement','subjectMotion','environmentMotion'].includes(category)) return 'Motion';
  if (['look','atmosphere','material','fx'].includes(category)) return 'Look / material / FX';
  const labels: Record<string, string> = {
    intent: 'Intent / Source Truth', subject: 'Subject', action: 'Action', scene: 'Scene',
    composition: 'Composition', continuity: 'Continuity', constraints: 'Constraints', text: 'Text', output: 'Output',
  };
  return labels[category] ?? category;
}
