export type Category = 'shot' | 'lens' | 'aperture' | 'angle' | 'light' | 'movement' | 'look';
export type AnatomyType = 'source' | 'composition' | 'camera' | 'optics' | 'light' | 'motion' | 'look' | 'constraints';
export type Target = 'generic' | 'higgsfield';

export type DirectionState = Record<Category, string>;

export type Option = {
  id: string;
  label: string;
  short: string;
  prompt: string;
  why: string;
  tradeoff: string;
};

export type Group = {
  id: Category;
  label: string;
  anatomy: AnatomyType;
  options: Option[];
};

export type Recommendation = {
  category: Category;
  optionId: string;
  reason: string;
};

export type PromptSegment = {
  type: AnatomyType;
  label: string;
  text: string;
};

export const GROUPS: Group[] = [
  {
    id: 'shot', label: 'Plano', anatomy: 'composition', options: [
      { id: 'wide', label: 'Wide', short: 'Contexto', prompt: 'wide shot with clear environmental context', why: 'Hace que el espacio y la relación entre elementos formen parte de la historia.', tradeoff: 'Reduce intimidad facial.' },
      { id: 'medium', label: 'Medium', short: 'Equilibrado', prompt: 'balanced medium shot', why: 'Mantiene gesto y contexto legibles al mismo tiempo.', tradeoff: 'Tiene menos intensidad emocional que un plano cerrado.' },
      { id: 'mcu', label: 'Medium close', short: 'Cercano', prompt: 'medium close-up with readable expression', why: 'Acerca emoción sin perder por completo el entorno.', tradeoff: 'Oculta más evidencia espacial.' },
      { id: 'close', label: 'Close-up', short: 'Íntimo', prompt: 'intimate close-up portrait', why: 'Convierte la expresión en la información dominante.', tradeoff: 'Sacrifica contexto.' }
    ]
  },
  {
    id: 'lens', label: 'Lente', anatomy: 'camera', options: [
      { id: '24', label: '24 mm', short: 'Expansivo', prompt: '24mm wide-angle perspective with pronounced spatial depth', why: 'Aumenta sensación de espacio y foreground.', tradeoff: 'Puede exagerar perspectiva facial si la cámara está cerca.' },
      { id: '35', label: '35 mm', short: 'Contextual', prompt: '35mm contextual perspective', why: 'Se siente natural y mantiene información del entorno.', tradeoff: 'Aísla menos al sujeto.' },
      { id: '50', label: '50 mm', short: 'Neutral', prompt: '50mm normal lens with balanced perspective', why: 'Es un punto medio estable y fácil de controlar.', tradeoff: 'Tiene menos carácter espacial.' },
      { id: '65', label: '65 mm', short: 'Íntimo equilibrado', prompt: '65mm short-telephoto perspective with gentle compression', why: 'Aísla sin comprimir tanto como 85 mm.', tradeoff: 'Pierde algo de contexto frente a 50 mm.' },
      { id: '85', label: '85 mm', short: 'Comprimido', prompt: '85mm portrait lens with compressed background', why: 'Aísla el sujeto y simplifica el fondo.', tradeoff: 'Reduce contexto y requiere más distancia.' },
      { id: '135', label: '135 mm', short: 'Telefoto', prompt: '135mm telephoto compression with strong isolation', why: 'Produce aislamiento fuerte y compresión marcada.', tradeoff: 'Necesita mucho espacio físico.' }
    ]
  },
  {
    id: 'aperture', label: 'Apertura', anatomy: 'optics', options: [
      { id: '1.4', label: 'f/1.4', short: 'DOF mínima', prompt: 'f/1.4 shallow depth of field', why: 'Aísla de forma agresiva y dirige la vista.', tradeoff: 'Puede borrar información necesaria del fondo.' },
      { id: '2.8', label: 'f/2.8', short: 'Selectiva', prompt: 'f/2.8 selective depth of field', why: 'Separa al sujeto sin desaparecer por completo el espacio.', tradeoff: 'Exige foco más preciso.' },
      { id: '4', label: 'f/4', short: 'Equilibrada', prompt: 'f/4 balanced depth of field', why: 'Protege sujeto y contexto con una separación moderada.', tradeoff: 'Menos aislamiento.' },
      { id: '8', label: 'f/8', short: 'Profunda', prompt: 'f/8 deep focus', why: 'Mantiene varios planos legibles.', tradeoff: 'La jerarquía por foco es menor.' }
    ]
  },
  {
    id: 'angle', label: 'Ángulo', anatomy: 'camera', options: [
      { id: 'low', label: 'Low angle', short: 'Presencia', prompt: 'low camera angle', why: 'Aumenta presencia y autoridad.', tradeoff: 'Puede sentirse dominante.' },
      { id: 'eye', label: 'Eye level', short: 'Neutral', prompt: 'eye-level camera', why: 'Se siente humano y no comenta demasiado la acción.', tradeoff: 'Tiene menos dramatismo.' },
      { id: 'high', label: 'High angle', short: 'Observación', prompt: 'high camera angle', why: 'Puede mostrar vulnerabilidad o más información del entorno.', tradeoff: 'Reduce autoridad.' },
      { id: 'overhead', label: 'Overhead', short: 'Gráfico', prompt: 'overhead camera', why: 'Convierte posiciones y relaciones en información visual clara.', tradeoff: 'Pierde conexión facial.' }
    ]
  },
  {
    id: 'light', label: 'Luz', anatomy: 'light', options: [
      { id: 'window', label: 'Soft window', short: 'Natural', prompt: 'large soft window key from camera left with restrained fill', why: 'Se siente motivada, limpia y humana.', tradeoff: 'Tiene menos tensión que una luz más contrastada.' },
      { id: 'rembrandt', label: 'Rembrandt', short: 'Esculpida', prompt: 'soft Rembrandt key with controlled negative fill', why: 'Añade volumen al rostro sin perder elegancia.', tradeoff: 'Se percibe más diseñada.' },
      { id: 'split', label: 'Split light', short: 'Tensión', prompt: 'dramatic split lighting across the face', why: 'Introduce conflicto visual inmediato.', tradeoff: 'Puede volverse demasiado teatral.' },
      { id: 'back', label: 'Backlight', short: 'Separación', prompt: 'motivated backlight with restrained rim', why: 'Separa silueta y profundidad.', tradeoff: 'Necesita exposición frontal controlada.' },
      { id: 'overcast', label: 'Overcast', short: 'Documental', prompt: 'soft overcast ambient light', why: 'Reduce teatralidad y se siente observacional.', tradeoff: 'Modela menos el rostro.' }
    ]
  },
  {
    id: 'movement', label: 'Movimiento', anatomy: 'motion', options: [
      { id: 'static', label: 'Static', short: 'Autoridad', prompt: 'locked-off camera', why: 'Deja que la acción tenga todo el peso.', tradeoff: 'Aporta menos energía.' },
      { id: 'push', label: 'Slow push', short: 'Presión', prompt: 'slow controlled push-in', why: 'Aumenta atención y tensión gradualmente.', tradeoff: 'Puede subrayar demasiado el momento.' },
      { id: 'truck', label: 'Truck', short: 'Espacio', prompt: 'slow lateral truck move', why: 'Conecta sujeto y entorno.', tradeoff: 'Puede distraer si la escena no lo necesita.' },
      { id: 'handheld', label: 'Handheld', short: 'Humano', prompt: 'restrained documentary handheld camera', why: 'Añade presencia humana y observación.', tradeoff: 'Reduce pulcritud.' }
    ]
  },
  {
    id: 'look', label: 'Look', anatomy: 'look', options: [
      { id: 'neutral', label: 'Neutral cinema', short: 'Natural', prompt: 'neutral cinematic color with realistic skin tones', why: 'Protege piel, materiales e información.', tradeoff: 'Tiene menos estilización.' },
      { id: 'cool', label: 'Cool editorial', short: 'Preciso', prompt: 'cool restrained editorial grade with protected skin', why: 'Se siente moderno y controlado.', tradeoff: 'Puede enfriar demasiado la piel.' },
      { id: 'warm', label: 'Warm documentary', short: 'Humano', prompt: 'warm documentary color response with natural skin', why: 'Añade cercanía y humanidad.', tradeoff: 'Puede suavizar tensión.' },
      { id: 'noir', label: 'Modern noir', short: 'Contraste', prompt: 'modern noir contrast with protected skin detail', why: 'Aumenta tensión y separación.', tradeoff: 'Pierde neutralidad.' }
    ]
  }
];

export const DEFAULTS: DirectionState = {
  shot: 'medium', lens: '50', aperture: '2.8', angle: 'eye', light: 'window', movement: 'static', look: 'neutral'
};

export const ANATOMY_LEGEND: Array<{ type: AnatomyType; label: string }> = [
  { type: 'source', label: 'Source' },
  { type: 'composition', label: 'Composición' },
  { type: 'camera', label: 'Cámara' },
  { type: 'optics', label: 'Óptica' },
  { type: 'light', label: 'Luz' },
  { type: 'motion', label: 'Movimiento' },
  { type: 'look', label: 'Look' },
  { type: 'constraints', label: 'Restricciones' }
];

export function optionFor(category: Category, id: string): Option {
  const group = GROUPS.find(g => g.id === category)!;
  return group.options.find(o => o.id === id) ?? group.options[0];
}

export function analyzeSource(source: string): { recommendations: Recommendation[]; summary: string } {
  const s = source.toLowerCase();
  const recs: Recommendation[] = [];
  const add = (category: Category, optionId: string, reason: string) => recs.push({ category, optionId, reason });

  const has = (...terms: string[]) => terms.some(t => s.includes(t));

  if (has('tensión', 'decision', 'decisión', 'criterio', 'presión', 'duda', 'hesita', 'conflicto')) {
    add('shot', 'mcu', 'La tensión se beneficia de una lectura clara del rostro sin perder por completo el contexto.');
    add('lens', '65', '65 mm aporta intimidad y compresión moderada sin borrar el entorno.');
    add('light', 'rembrandt', 'La luz esculpida ayuda a construir tensión contenida.');
    add('movement', 'push', 'Un push lento puede aumentar la presión sin convertir la escena en acción.');
    add('look', 'cool', 'Un acabado ligeramente frío refuerza precisión y control.');
  } else if (has('producto', 'product', 'reloj', 'perfume', 'zapato', 'botella', 'comida', 'food')) {
    add('shot', 'medium', 'El producto necesita suficiente contexto para entender forma, escala y uso.');
    add('lens', '85', 'Una focal más larga ayuda a controlar perspectiva y aislar el objeto.');
    add('aperture', '4', 'f/4 mantiene más superficie del producto legible.');
    add('light', 'window', 'Una fuente grande y suave conserva textura sin endurecer demasiado los materiales.');
    add('movement', 'static', 'La cámara estable facilita leer forma y detalle.');
  } else if (has('entrevista', 'interview', 'podcast', 'testimonio', 'testimonial')) {
    add('shot', 'mcu', 'El plano medio corto funciona bien para conversación y expresión.');
    add('lens', '50', '50 mm mantiene una perspectiva natural y fácil de sostener.');
    add('aperture', '2.8', 'f/2.8 separa al hablante sin borrar por completo el set.');
    add('light', 'window', 'La luz suave mantiene piel y expresión naturales.');
    add('movement', 'static', 'Una cámara estable evita competir con el discurso.');
  } else if (has('documental', 'documentary', 'realista', 'realistic', 'calle', 'street')) {
    add('shot', 'medium', 'El plano medio conserva acción y entorno.');
    add('lens', '35', '35 mm aporta contexto y sensación de presencia.');
    add('aperture', '4', 'f/4 protege suficiente información ambiental.');
    add('light', 'overcast', 'La luz ambiental suave evita una sensación excesivamente producida.');
    add('movement', 'handheld', 'Un handheld restringido aporta observación sin caer en caos.');
    add('look', 'warm', 'Un acabado cálido moderado puede reforzar humanidad.');
  } else if (has('lujo', 'luxury', 'premium', 'elegante', 'elegance')) {
    add('shot', 'mcu', 'Una composición más contenida aumenta sensación de control.');
    add('lens', '85', '85 mm aporta compresión y aislamiento asociados a retrato editorial.');
    add('aperture', '2.8', 'f/2.8 mantiene separación elegante sin destruir detalle.');
    add('light', 'back', 'Un contraluz motivado puede separar bordes y materiales.');
    add('movement', 'push', 'Un movimiento lento y preciso se siente más premium que uno nervioso.');
    add('look', 'neutral', 'La neutralidad protege materiales y tonos de piel.');
  } else {
    add('shot', 'medium', 'Es un punto de partida seguro que conserva sujeto y contexto.');
    add('lens', '50', '50 mm mantiene perspectiva equilibrada.');
    add('aperture', '2.8', 'f/2.8 aporta jerarquía sin aislar en exceso.');
    add('angle', 'eye', 'Eye level evita imponer una lectura psicológica innecesaria.');
    add('light', 'window', 'La luz suave motivada funciona como base flexible.');
    add('movement', 'static', 'La cámara estable evita añadir intención que no existe en el source.');
    add('look', 'neutral', 'El look neutral conserva margen para adaptar después.');
  }

  if (!recs.some(r => r.category === 'angle')) add('angle', 'eye', 'Eye level mantiene la lectura humana y neutral.');
  if (!recs.some(r => r.category === 'aperture')) add('aperture', '2.8', 'f/2.8 ofrece separación selectiva sin perder completamente el contexto.');

  const summary = recs.length
    ? `Veo ${recs.length} decisiones útiles para dirigir este prompt sin reescribir su intención.`
    : 'El source es suficiente para empezar. Puedes dirigirlo manualmente con los controles.';

  return { recommendations: recs, summary };
}

export function compileSegments(source: string, state: DirectionState): PromptSegment[] {
  const cleanSource = source.trim() || 'Describe the subject, action and environment clearly';
  return [
    { type: 'source', label: 'Source', text: cleanSource },
    { type: 'composition', label: 'Composition', text: optionFor('shot', state.shot).prompt },
    { type: 'camera', label: 'Camera', text: `${optionFor('lens', state.lens).prompt}, ${optionFor('angle', state.angle).prompt}` },
    { type: 'optics', label: 'Optics', text: optionFor('aperture', state.aperture).prompt },
    { type: 'light', label: 'Light', text: optionFor('light', state.light).prompt },
    { type: 'motion', label: 'Motion', text: optionFor('movement', state.movement).prompt },
    { type: 'look', label: 'Look', text: optionFor('look', state.look).prompt },
    { type: 'constraints', label: 'Constraints', text: 'preserve subject identity, coherent anatomy, physically plausible light, no accidental text or logos' }
  ];
}

export function compilePrompt(source: string, state: DirectionState): string {
  return compileSegments(source, state).map(s => s.text).join(', ') + '.';
}

export function buildHiggsfieldExport(source: string, state: DirectionState) {
  return {
    note: 'ABRAXAS draft using Higgsfield public schema fields plus ABRAXAS direction metadata. Confirm the live schema with `higgsfield model get <job_set_type>` before sending.',
    job_set_type: 'cinematic_studio_2_5',
    prompt: compilePrompt(source, state),
    aspect_ratio: '16:9',
    resolution: '2k',
    mode: 'auto',
    abrxs_direction: {
      shot: optionFor('shot', state.shot).label,
      lens: optionFor('lens', state.lens).label,
      aperture: optionFor('aperture', state.aperture).label,
      angle: optionFor('angle', state.angle).label,
      light: optionFor('light', state.light).label,
      movement: optionFor('movement', state.movement).label,
      look: optionFor('look', state.look).label
    }
  };
}

export function buildExportText(source: string, state: DirectionState, target: Target): string {
  const prompt = compilePrompt(source, state);
  if (target === 'generic') return prompt;
  return `${prompt}\n\n---\nHIGGSFIELD PUBLIC-SCHEMA DRAFT\n${JSON.stringify(buildHiggsfieldExport(source, state), null, 2)}`;
}
