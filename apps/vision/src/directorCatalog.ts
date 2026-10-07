export type DirectorCategory =
  | 'shot'
  | 'lens'
  | 'angle'
  | 'focus'
  | 'composition'
  | 'lighting'
  | 'movement'
  | 'look'
  | 'atmosphere'
  | 'fx';

export type DirectorOption = {
  id: string;
  category: DirectorCategory;
  label: string;
  short: string;
  effect: string;
  feel: string;
  useFor: string;
  avoidWhen: string;
  prompt: string;
  tags: string[];
  preview: {
    subjectScale?: number;
    subjectX?: number;
    subjectY?: number;
    backgroundScale?: number;
    blur?: number;
    contrast?: number;
    warmth?: number;
    vignette?: number;
    haze?: number;
    motion?: 'none' | 'push' | 'pull' | 'pan' | 'orbit' | 'handheld' | 'crane';
    light?: 'front' | 'left' | 'right' | 'back' | 'top' | 'practical' | 'flat';
  };
};

export type DirectorPreset = {
  id: string;
  label: string;
  family: string;
  description: string;
  values: Partial<Record<DirectorCategory, string>>;
};

const option = (
  category: DirectorCategory,
  id: string,
  label: string,
  short: string,
  effect: string,
  feel: string,
  useFor: string,
  avoidWhen: string,
  prompt: string,
  tags: string[],
  preview: DirectorOption['preview'] = {},
): DirectorOption => ({ category, id, label, short, effect, feel, useFor, avoidWhen, prompt, tags, preview });

export const DIRECTOR_CATEGORIES: Array<{ id: DirectorCategory; label: string; description: string }> = [
  { id: 'shot', label: 'Encuadre', description: 'Cuánto mundo y cuánto sujeto entran en el plano.' },
  { id: 'lens', label: 'Lente', description: 'Perspectiva, compresión y relación del sujeto con el entorno.' },
  { id: 'angle', label: 'Ángulo', description: 'Altura y posición psicológica de la cámara.' },
  { id: 'focus', label: 'Foco / DOF', description: 'Qué plano visual domina y cómo se separa del resto.' },
  { id: 'composition', label: 'Composición', description: 'Jerarquía, espacio negativo, profundidad y geometría.' },
  { id: 'lighting', label: 'Iluminación', description: 'Fuente, dirección, calidad, contraste y temperatura.' },
  { id: 'movement', label: 'Movimiento', description: 'Trayectoria y energía temporal de cámara, sujeto y escena.' },
  { id: 'look', label: 'Look', description: 'Respuesta óptica, color, grano y carácter fotográfico.' },
  { id: 'atmosphere', label: 'Atmósfera', description: 'Aire, clima, partículas y densidad espacial.' },
  { id: 'fx', label: 'FX / VFX', description: 'Efectos con función narrativa, no decoración arbitraria.' },
];

export const DIRECTOR_OPTIONS: DirectorOption[] = [
  option('shot','ecu','ECU','Detalle extremo','Aísla un detalle y elimina casi todo el contexto.','Urgente · íntimo · sensorial','ojos, manos, textura, producto, microgesto','necesitas entender el espacio','extreme close-up, one decisive detail filling the frame, minimal environmental context',['portrait','macro','tension'],{subjectScale:1.58,backgroundScale:1.12,vignette:.32}),
  option('shot','cu','Close-up','Rostro dominante','Prioriza expresión y reduce el entorno.','Íntimo · humano','reacción, emoción, testimonio','el entorno explica la idea','close-up framing, face and micro-expression dominant, restrained background context',['portrait','interview'],{subjectScale:1.36,vignette:.22}),
  option('shot','mcu','Medium Close-up','Equilibrio íntimo','Muestra rostro, gesto y algo de contexto.','Controlado · editorial','autoridad, diálogo, educación','necesitas cuerpo completo o arquitectura','medium close-up framing, face, hands and one narrative object readable',['business','editorial','social'],{subjectScale:1.18}),
  option('shot','medium','Medium','Contexto humano','Equilibra gesto, cuerpo y entorno.','Natural · observacional','diálogo, oficina, documental','buscas máxima intimidad','medium shot with enough environment to explain action without losing expression',['documentary','business'],{subjectScale:1}),
  option('shot','wide','Wide','Entorno dominante','Explica relación entre personaje y espacio.','Situacional · arquitectónico','location, aislamiento, arquitectura','la emoción facial es lo principal','wide shot, environment carries narrative meaning, subject remains clearly readable',['architecture','cinema'],{subjectScale:.72,backgroundScale:.92}),

  option('lens','24mm','24mm','Wide dramático','Amplía la sensación de espacio y diferencia planos.','Inmersivo · enérgico','arquitectura, proximidad, profundidad','rostro muy cerca de cámara','24mm wide-angle perspective, pronounced foreground-to-background depth, controlled edge distortion',['wide','architecture','dynamic'],{subjectScale:.86,backgroundScale:.86}),
  option('lens','35mm','35mm','Natural con entorno','Conserva contexto sin verse excesivamente ancho.','Humano · cinematográfico','documental premium, diálogo, social','quieres fuerte compresión','35mm perspective, natural environmental context, cinematic spatial depth',['documentary','cinema','social'],{subjectScale:.95,backgroundScale:.94}),
  option('lens','50mm','50mm','Neutral cinematográfico','Perspectiva equilibrada y poco invasiva.','Natural · limpio · editorial','business, producto humano, conversación','necesitas mostrar mucho espacio','50mm spherical perspective, natural proportions, balanced subject and environment',['editorial','business','portrait'],{subjectScale:1.05,backgroundScale:1}),
  option('lens','85mm','85mm','Compresión íntima','Comprime relaciones espaciales y separa al sujeto.','Íntimo · controlado','reacción, retrato, presión interna','el entorno es parte esencial de la historia','85mm portrait compression, natural facial proportions, strong subject separation, restrained background',['portrait','tension','beauty'],{subjectScale:1.2,backgroundScale:1.08,blur:.2,vignette:.18}),
  option('lens','135mm','135mm','Tele comprimido','Aplana el espacio y crea separación fuerte.','Observacional · elegante','retrato distante, moda, detalles','necesitas profundidad ambiental legible','135mm telephoto compression, flattened perspective, strong optical isolation',['fashion','portrait'],{subjectScale:1.32,backgroundScale:1.18,blur:.32}),
  option('lens','macro','Macro 100mm','Detalle físico','Convierte material y textura en protagonista.','Táctil · preciso','producto, comida, superficie, mecanismo','la acción depende del entorno','100mm macro perspective, tactile micro-texture, physically credible surface detail',['product','food','macro'],{subjectScale:1.48,blur:.25,vignette:.2}),
  option('lens','anamorphic','Anamorphic','Horizontal y óptico','Introduce bokeh ovalado, flare controlado y expansión lateral.','Cinemático · expresivo','narrativa, night exterior, automotive','pieza editorial limpia o texto dominante','anamorphic lens response, subtle oval bokeh, restrained horizontal flare, cinematic edge character',['cinema','automotive','night'],{backgroundScale:1.06,contrast:1.08}),

  option('angle','eye','Eye level','Neutral humano','La cámara comparte altura con el sujeto.','Honesto · cercano','documental, entrevista, editorial','quieres poder o vulnerabilidad marcada','eye-level camera height, neutral human perspective',['documentary','portrait'],{subjectY:0}),
  option('angle','low','Low angle','Poder','La cámara mira ligeramente hacia arriba.','Dominante · monumental','autoridad, producto hero, arquitectura','quieres cercanía neutral','restrained low-angle camera, subtle upward perspective, no exaggerated heroic distortion',['power','product'],{subjectY:-3}),
  option('angle','high','High angle','Vulnerabilidad','Mira ligeramente hacia abajo y reduce presencia.','Expuesto · frágil','indecisión, soledad, overview humano','quieres autoridad','controlled high-angle camera, mild downward perspective',['drama','vulnerability'],{subjectY:3}),
  option('angle','overhead','Overhead','Geometría superior','Transforma la escena en sistema, mapa o composición.','Analítico · gráfico','mesa, producto, proceso, comida','la expresión facial es el centro','true overhead top-down composition, clean planar geometry',['food','process','design'],{subjectScale:.82,backgroundScale:.86}),
  option('angle','ots','Over shoulder','Relación','Introduce un primer plano humano para situar interacción.','Presente · narrativo','diálogo, pantalla, negociación','necesitas composición limpia para copy','over-the-shoulder composition with restrained foreground occlusion',['dialogue','business'],{subjectX:8,backgroundScale:1.03}),

  option('focus','deep','Deep focus','Todo legible','Mantiene varios planos narrativos útiles.','Preciso · explicativo','arquitectura, proceso, XR, evidencia','quieres aislar emoción','deep focus with foreground, subject and environment intentionally readable',['architecture','xroll','education'],{blur:0}),
  option('focus','moderate','Moderate DOF','Separación natural','Separa al sujeto sin borrar el mundo.','Cinemático · realista','editorial, negocio, documental','el fondo debe desaparecer','moderate depth of field, readable environment with gentle optical separation',['editorial','documentary'],{blur:.1}),
  option('focus','shallow','Shallow DOF','Aislamiento','Reduce información secundaria.','Íntimo · premium','retrato, producto, beauty','la escena necesita evidencia de fondo','shallow depth of field, smooth optical separation, focal plane locked on subject',['portrait','beauty','product'],{blur:.3,vignette:.14}),
  option('focus','rack','Rack focus','Cambio de atención','Traslada la jerarquía durante el plano.','Narrativo · revelador','video, reveal, objeto→persona','imagen fija o escena sin segundo foco','controlled rack focus from foreground narrative object to subject, stable geometry',['video','reveal'],{blur:.2,motion:'push'}),

  option('composition','thirds','Rule of thirds','Jerarquía clásica','Descentra al sujeto y crea aire útil.','Editorial · claro','copy, retrato, social','simetría es parte del concepto','rule-of-thirds composition with deliberate negative space and one dominant focal hierarchy',['editorial','social'],{subjectX:-13}),
  option('composition','symmetry','Symmetry','Orden frontal','Convierte la geometría en mensaje.','Controlado · icónico','producto, arquitectura, comedia seca','quieres espontaneidad documental','precise symmetrical composition, centered geometry, controlled visual balance',['product','architecture'],{subjectX:0,backgroundScale:.98}),
  option('composition','negative','Negative space','Aire narrativo','Protege una zona tranquila y concentra significado.','Premium · editorial','texto, soledad, autoridad','la escena necesita densidad informativa','strong negative space, subject offset, text-safe quiet area away from face and hands',['editorial','text-safe'],{subjectX:-17}),
  option('composition','layered','Layered depth','Profundidad','Usa foreground, midground y background con función.','Cinemático · inmersivo','XR, storytelling, documental','quieres gráfica plana','layered foreground, midground and background with meaningful depth separation',['cinema','xroll'],{backgroundScale:.92}),
  option('composition','frame','Frame within frame','Encierro visual','Usa arquitectura u objetos para contener al sujeto.','Tensión · observación','drama, vigilancia, introspección','producto limpio','frame-within-frame composition using real architecture or foreground objects',['drama','cinema'],{vignette:.28}),

  option('lighting','soft-side','Soft side','Lateral suave','Modela volumen sin volverse agresivo.','Premium · humano','editorial, business, beauty','quieres dureza solar','large soft motivated side key, gentle falloff, controlled negative fill, natural skin response',['portrait','editorial','business'],{light:'left',contrast:1.08}),
  option('lighting','hard-side','Hard side','Lateral duro','Crea borde claro y sombras definidas.','Tenso · gráfico','drama, moda, producto','piel suave o documental íntimo','hard directional side light, crisp shadow edge, controlled highlight roll-off',['drama','fashion'],{light:'right',contrast:1.28,vignette:.15}),
  option('lighting','window','Window motivated','Ventana creíble','La fuente tiene una causa visible o inferible.','Natural · cinematográfico','interior, documental, negocio','set abstracto sin fuente lógica','motivated window key, believable direction, subtle ambient fill, practical exposure preserved',['documentary','interior'],{light:'left',warmth:-.05}),
  option('lighting','backlight','Backlight','Separación','Perfila el sujeto desde atrás y sostiene profundidad.','Atmosférico · elegante','night, fashion, reveal','copy limpio sobre fondo brillante','controlled backlight with subtle rim separation and protected facial exposure',['fashion','night','cinema'],{light:'back',contrast:1.18,haze:.12}),
  option('lighting','beauty','Beauty wrap','Envolvente','Suaviza transiciones y conserva detalle de piel.','Pulido · comercial','beauty, skincare, portrait','drama contrastado','large frontal-soft beauty source with wrap, clean catchlight and gentle fill',['beauty','commercial'],{light:'front',contrast:.94}),
  option('lighting','practical','Night practical','Prácticos','Usa lámparas reales como motivación y color.','Íntimo · nocturno','night interior, documentary','high-key clean','motivated practical lamps, warm pools of light, restrained ambient exposure',['night','documentary'],{light:'practical',warmth:.3,vignette:.2}),
  option('lighting','noir','Noir contrast','Contraste 8:1','Reduce fill y deja zonas caer a sombra.','Tenso · escultórico','thriller, decision pressure, portrait','marca luminosa y abierta','high-contrast side key with strong negative fill, approximately 8:1 key-to-fill ratio',['noir','tension'],{light:'right',contrast:1.42,vignette:.3}),
  option('lighting','overcast','Overcast','Cielo difuso','Luz ambiental uniforme y realista.','Honesto · suave','exterior, documental, moda natural','quieres sombras direccionales','soft overcast skylight, low specular contrast, natural color response',['documentary','exterior'],{light:'flat',contrast:.92,warmth:-.08}),

  option('movement','static','Static','Bloqueado','Deja que actuación y composición carguen el plano.','Seguro · observacional','diálogo, producto, tensión silenciosa','necesitas revelar espacio','locked-off camera, no camera movement, motion comes only from subject and environment',['dialogue','product'],{motion:'none'}),
  option('movement','push','Slow push-in','Acercamiento','Aumenta atención sin cambiar de idea.','Íntimo · progresivo','tensión, decisión, revelación emocional','ya estás demasiado cerca','restrained slow dolly-in, smooth acceleration, no sudden perspective jump',['drama','social','tension'],{motion:'push'}),
  option('movement','pull','Slow pull-out','Distancia','Revela aislamiento o contexto progresivamente.','Reflexivo · revelador','ending, loneliness, architecture','hook necesita inmediatez','slow controlled dolly-out revealing additional environmental context',['reveal','architecture'],{motion:'pull'}),
  option('movement','pan','Slow pan','Descubrimiento lateral','Conecta elementos en el mismo espacio.','Observacional · descriptivo','producto, arquitectura, proceso','acción frontal simple','slow deliberate pan linking two narrative elements, stable horizon',['product','architecture'],{motion:'pan'}),
  option('movement','orbit','Light orbit','Cambio de relación','Modifica suavemente el fondo alrededor del sujeto.','Premium · espacial','producto, hero, reveal','documental naturalista','restrained 10–20 degree orbit, stable subject scale, physically plausible parallax',['product','cinema'],{motion:'orbit'}),
  option('movement','handheld','Restrained handheld','Presencia humana','Añade microvariación sin perder control.','Documental · vivo','behind the scenes, interview, street','producto perfectamente limpio','restrained handheld micro-movement, stabilized enough to preserve composition',['documentary','street'],{motion:'handheld'}),
  option('movement','crane','Crane reveal','Vertical reveal','Cambia escala y jerarquía del espacio.','Cinemático · expansivo','architecture, automotive, reveal','retrato íntimo','slow crane rise revealing spatial context while preserving subject continuity',['architecture','automotive'],{motion:'crane'}),

  option('look','clean','Clean digital','Limpio','Conserva detalle y neutralidad óptica.','Preciso · moderno','producto, business, tech','quieres textura analógica','clean modern digital cinema response, controlled highlights, neutral micro-contrast',['business','product','tech'],{contrast:1.03}),
  option('look','35mm-film','35mm film','Fotoquímico','Añade grano fino, roll-off y densidad de color.','Cinemático · táctil','narrativa, editorial, documental premium','UI/texto muy clínico','35mm film response, fine organic grain, gentle halation, soft highlight roll-off',['cinema','editorial'],{contrast:1.08,warmth:.06}),
  option('look','16mm','16mm','Textura visible','Grano y respuesta más presente.','Crudo · nostálgico','documental, music, street','beauty limpio','16mm film response, visible organic grain, subtle gate character, restrained saturation',['documentary','music'],{contrast:1.1,warmth:.04}),
  option('look','soft-diffusion','Soft diffusion','Difusión','Reduce microcontraste de altas luces.','Romántico · beauty','beauty, fashion, dream','producto técnico','subtle optical diffusion, gentle highlight bloom, preserved facial detail',['beauty','fashion'],{contrast:.96}),
  option('look','cool-editorial','Cool editorial','Neutro frío','Desplaza ambiente a frío conservando piel.','Editorial · sobrio','business, architecture, decision','hospitality cálida','cool-neutral editorial grade, natural skin protected, restrained saturation',['business','architecture'],{warmth:-.2,contrast:1.06}),
  option('look','warm-doc','Warm documentary','Cálido realista','Calienta medios tonos sin naranja artificial.','Humano · cercano','documental, testimonial, food','tech clínico','warm documentary color response, natural skin, deep neutral blacks, restrained saturation',['documentary','testimonial'],{warmth:.2}),

  option('atmosphere','clean-air','Clean air','Aire limpio','Máxima claridad entre planos.','Preciso · comercial','producto, tech, architecture','buscas rayos o densidad','clean clear air, high spatial clarity, no decorative haze',['product','tech'],{haze:0}),
  option('atmosphere','light-haze','Light haze','Haze sutil','Hace visible profundidad y backlight sin lavar la escena.','Cinemático · atmosférico','cinema, concert, product reveal','texto necesita contraste máximo','very light atmospheric haze, enough for depth separation without milky blacks',['cinema','reveal'],{haze:.18}),
  option('atmosphere','mist','Mist','Niebla fina','Suaviza distancia y crea capas.','Poético · exterior','landscape, fashion, mystery','producto técnico','fine environmental mist with physically plausible depth falloff',['fashion','landscape'],{haze:.32}),
  option('atmosphere','rain','Rain','Lluvia','Añade movimiento y reflejos motivados.','Dramático · urbano','night exterior, automotive','interior limpio','realistic rain interaction, wet surfaces, controlled reflections, no floating particles',['automotive','night'],{haze:.15,contrast:1.12}),
  option('atmosphere','dust','Dust motes','Partículas reales','Hace legible un haz de luz de manera física.','Táctil · antiguo','workshop, archive, sunbeam','corporate clean','sparse dust motes visible only inside motivated light beams',['workshop','period'],{haze:.1}),

  option('fx','none','No decorative FX','Sin FX','Obliga a que cámara, luz y acción resuelvan la escena.','Realista · disciplinado','documental, editorial, business','concepto necesita transformación explícita','no decorative visual effects; rely on physical scene, camera, light and performance',['realism'],{}),
  option('fx','bloom','Controlled bloom','Bloom','Suaviza fuentes intensas sin lavar negros.','Óptico · nocturno','night, beauty, neon restrained','text-heavy graphics','controlled optical bloom around motivated highlights only, blacks remain anchored',['night','beauty'],{contrast:.98}),
  option('fx','halation','Subtle halation','Halation','Crea borde cálido fotoquímico en altas luces.','Film · táctil','35mm look, practicals','clinical product','subtle red-warm halation on strongest highlights, never as a global glow',['film'],{warmth:.08}),
  option('fx','reflections','Practical reflections','Reflejos','Usa vidrio/metal para sumar capas y contexto.','Premium · espacial','automotive, product, architecture','rostro debe quedar completamente limpio','physically motivated reflections on real glass or metal surfaces, no impossible mirror geometry',['automotive','product'],{contrast:1.08}),
  option('fx','volumetric','Motivated volumetric','Volumétrico','Hace visibles haces sólo cuando hay fuente y medio.','Atmosférico · dramático','stage, window beam, reveal','luz plana sin haze','motivated volumetric light through real haze, physically coherent beam direction',['cinema','stage'],{haze:.3,contrast:1.15}),
];

export const DIRECTOR_PRESETS: DirectorPreset[] = [
  { id:'intimate-pressure', label:'Intimate Pressure', family:'Cinema', description:'Tensión interna sin convertir la escena en thriller.', values:{ shot:'mcu', lens:'85mm', angle:'eye', focus:'shallow', composition:'negative', lighting:'soft-side', movement:'push', look:'cool-editorial', atmosphere:'clean-air', fx:'none' } },
  { id:'quiet-authority', label:'Quiet Authority', family:'Business', description:'Autoridad sobria, natural y editorial.', values:{ shot:'mcu', lens:'50mm', angle:'eye', focus:'moderate', composition:'thirds', lighting:'window', movement:'static', look:'clean', atmosphere:'clean-air', fx:'none' } },
  { id:'documentary-human', label:'Human Documentary', family:'Documentary', description:'Presencia humana con entorno legible y cámara contenida.', values:{ shot:'medium', lens:'35mm', angle:'eye', focus:'moderate', composition:'layered', lighting:'overcast', movement:'handheld', look:'warm-doc', atmosphere:'clean-air', fx:'none' } },
  { id:'luxury-product', label:'Luxury Product Reveal', family:'Commercial', description:'Volumen, superficie y separación óptica para producto premium.', values:{ shot:'cu', lens:'macro', angle:'low', focus:'shallow', composition:'symmetry', lighting:'backlight', movement:'orbit', look:'clean', atmosphere:'light-haze', fx:'reflections' } },
  { id:'editorial-portrait', label:'Editorial Portrait', family:'Editorial', description:'Retrato contemporáneo con aire para copy y textura fotográfica.', values:{ shot:'cu', lens:'85mm', angle:'eye', focus:'shallow', composition:'negative', lighting:'soft-side', movement:'static', look:'35mm-film', atmosphere:'clean-air', fx:'halation' } },
  { id:'architecture-reveal', label:'Architecture Reveal', family:'Architecture', description:'Espacio, escala y profundidad con movimiento estable.', values:{ shot:'wide', lens:'24mm', angle:'eye', focus:'deep', composition:'layered', lighting:'window', movement:'crane', look:'clean', atmosphere:'light-haze', fx:'none' } },
  { id:'social-authority', label:'Vertical Authority', family:'Social', description:'Reel vertical sobrio: rostro, gesto y copy-safe space.', values:{ shot:'mcu', lens:'50mm', angle:'eye', focus:'moderate', composition:'negative', lighting:'soft-side', movement:'push', look:'clean', atmosphere:'clean-air', fx:'none' } },
  { id:'decision-system', label:'Decision / Criterion XR', family:'XRoll', description:'Jerarquía visual para opciones, criterio y capas explicativas.', values:{ shot:'medium', lens:'35mm', angle:'overhead', focus:'deep', composition:'layered', lighting:'soft-side', movement:'push', look:'clean', atmosphere:'clean-air', fx:'none' } },
  { id:'night-practical', label:'Night Practical', family:'Cinema', description:'Interior nocturno creíble basado en fuentes prácticas.', values:{ shot:'medium', lens:'50mm', angle:'eye', focus:'moderate', composition:'frame', lighting:'practical', movement:'push', look:'35mm-film', atmosphere:'light-haze', fx:'bloom' } },
  { id:'beauty-clean', label:'Beauty Clean', family:'Beauty', description:'Piel, detalle y catchlights con separación limpia.', values:{ shot:'cu', lens:'85mm', angle:'eye', focus:'shallow', composition:'symmetry', lighting:'beauty', movement:'static', look:'soft-diffusion', atmosphere:'clean-air', fx:'bloom' } },
  { id:'automotive-night', label:'Automotive Night', family:'Automotive', description:'Metal, reflejos y movimiento controlado en noche urbana.', values:{ shot:'wide', lens:'35mm', angle:'low', focus:'moderate', composition:'layered', lighting:'backlight', movement:'orbit', look:'35mm-film', atmosphere:'rain', fx:'reflections' } },
  { id:'food-macro', label:'Food Macro', family:'Food', description:'Textura, material y apetito visual con foco selectivo.', values:{ shot:'ecu', lens:'macro', angle:'overhead', focus:'shallow', composition:'thirds', lighting:'soft-side', movement:'push', look:'warm-doc', atmosphere:'clean-air', fx:'none' } },
];

export function optionsFor(category: DirectorCategory) {
  return DIRECTOR_OPTIONS.filter((item) => item.category === category);
}

export function optionById(id: string | undefined) {
  return DIRECTOR_OPTIONS.find((item) => item.id === id);
}

const CATEGORY_REPLACERS: Record<DirectorCategory, RegExp[]> = {
  shot: [/\b(extreme close-up|close-up|medium close-up|medium shot|full shot|wide shot|extreme wide shot)\b[^.;]*/i],
  lens: [/\b(14|18|21|24|28|35|40|50|65|75|85|100|105|135|200)\s?mm\b[^.;]*/i, /\b(anamorphic|macro|telephoto)\b[^.;]*/i],
  angle: [/\b(eye[- ]level|low[- ]angle|high[- ]angle|overhead|top[- ]down|over[- ]the[- ]shoulder|dutch angle)\b[^.;]*/i],
  focus: [/\b(deep focus|shallow depth of field|moderate depth of field|rack focus|split focus)\b[^.;]*/i],
  composition: [/\b(rule of thirds|symmetrical composition|negative space|layered foreground|frame[- ]within[- ]frame)\b[^.;]*/i],
  lighting: [/\b(soft|hard|motivated|window|backlight|rim|practical|overcast|beauty)\b[^.;]*(light|lighting|key|fill)[^.;]*/i],
  movement: [/\b(static camera|locked[- ]off|dolly|push[- ]in|pull[- ]out|pan|tilt|truck|orbit|handheld|crane|tracking)\b[^.;]*/i],
  look: [/\b(35mm film|16mm film|clean digital|film response|diffusion|editorial grade)\b[^.;]*/i],
  atmosphere: [/\b(haze|mist|rain|dust|smoke|clear air|atmosphere)\b[^.;]*/i],
  fx: [/\b(bloom|halation|volumetric|reflection|visual effects|vfx)\b[^.;]*/i],
};

export function applyDirectorOptionToPrompt(source: string, selected: DirectorOption) {
  const clean = source.trim();
  const replacement = selected.prompt.replace(/^\w/, (value) => value.toUpperCase());
  for (const pattern of CATEGORY_REPLACERS[selected.category]) {
    if (pattern.test(clean)) return clean.replace(pattern, replacement);
  }
  const separator = clean && !/[.!?]$/.test(clean) ? '. ' : clean ? ' ' : '';
  return `${clean}${separator}${replacement}.`.trim();
}

export function applyDirectorPresetToPrompt(source: string, preset: DirectorPreset) {
  return Object.entries(preset.values).reduce((prompt, [category, id]) => {
    const selected = DIRECTOR_OPTIONS.find((item) => item.category === category && item.id === id);
    return selected ? applyDirectorOptionToPrompt(prompt, selected) : prompt;
  }, source);
}

export type AnatomySegment = { text: string; category: DirectorCategory | 'intent' | 'subject' | 'action' | 'scene' | 'output' };

const ANATOMY_HINTS: Record<AnatomySegment['category'], string[]> = {
  intent: ['purpose','visualize','show','communicate','represent','meaning','idea','criterion','decision'],
  subject: ['person','woman','man','founder','joc','subject','character','face','portrait','product'],
  action: ['moves','moving','walks','reaches','turns','looks','holds','sits','stands','pauses','compares','reviewing','gesture'],
  scene: ['room','office','studio','street','table','environment','location','interior','exterior','background','foreground'],
  shot: ['close-up','medium shot','wide shot','framing'],
  lens: ['mm','lens','anamorphic','macro','telephoto'],
  angle: ['angle','eye-level','overhead','top-down','low angle','high angle','over-the-shoulder'],
  focus: ['focus','depth of field','focal plane','bokeh'],
  composition: ['composition','negative space','thirds','symmetry','foreground','midground'],
  lighting: ['light','lighting','key','fill','rim','window','practical','shadow','contrast ratio'],
  movement: ['camera','dolly','push','pull','pan','tilt','orbit','handheld','crane','tracking'],
  look: ['film','grain','halation','bloom','grade','color response','diffusion'],
  atmosphere: ['haze','mist','rain','smoke','dust','atmosphere'],
  fx: ['vfx','effect','reflection','volumetric','particles'],
  output: ['9:16','4:5','16:9','vertical','horizontal','resolution','output','seconds','duration'],
};

function classifyClause(text: string): AnatomySegment['category'] {
  const lower = text.toLowerCase();
  const entries = Object.entries(ANATOMY_HINTS) as Array<[AnatomySegment['category'], string[]]>;
  let best: AnatomySegment['category'] = 'intent';
  let score = 0;
  for (const [category, hints] of entries) {
    const hits = hints.reduce((total, hint) => total + (lower.includes(hint) ? 1 : 0), 0);
    if (hits > score) { score = hits; best = category; }
  }
  return best;
}

export function anatomizePrompt(source: string): AnatomySegment[] {
  const parts = source.split(/((?:[,;:]\s+)|(?:[.!?]\s+)|\n+)/g).filter(Boolean);
  return parts.map((text) => (/^[,;:.!?\s]+$/.test(text) ? { text, category: 'intent' as const } : { text, category: classifyClause(text) }));
}

export type DirectorAudit = {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  strengths: string[];
  issues: Array<{ id: DirectorCategory | 'specificity' | 'action' | 'output'; label: string; suggestion: string }>;
};

export function auditDirectorPrompt(source: string): DirectorAudit {
  const text = source.trim();
  const lower = text.toLowerCase();
  const issues: DirectorAudit['issues'] = [];
  const strengths: string[] = [];
  let score = 28;
  const specific = text.length >= 80;
  if (specific) { score += 14; strengths.push('Intención suficientemente desarrollada'); }
  else issues.push({ id:'specificity', label:'La idea todavía es demasiado genérica', suggestion:'Nombra sujeto, acción observable y qué debe significar visualmente.' });
  const hasAction = /\b(move|walk|reach|turn|look|hold|sit|stand|pause|compare|review|gesture|mueve|camina|gira|mira|sostiene|se sienta|pausa|compara)\b/i.test(text);
  if (hasAction) { score += 10; strengths.push('Acción observable'); }
  else issues.push({ id:'action', label:'Falta comportamiento observable', suggestion:'Convierte emociones abstractas en una acción física que pueda verse.' });
  const checks: Array<[DirectorCategory, RegExp, string, string]> = [
    ['shot', /close-up|medium|wide|ecu|mcu|encuadre/i, 'Encuadre definido', 'Elige cuánto sujeto y cuánto mundo necesita la idea.'],
    ['lens', /\b\d{2,3}\s?mm\b|anamorphic|macro|telephoto/i, 'Lente definida', 'Elige focal por función, no por adjetivo cinematográfico.'],
    ['composition', /negative space|thirds|symmetr|composition|foreground|midground|composición|espacio negativo/i, 'Composición definida', 'Declara jerarquía, profundidad o zona de aire útil.'],
    ['lighting', /light|lighting|key|fill|window|practical|shadow|luz|iluminación/i, 'Iluminación motivada', 'Declara fuente, dirección y calidad de luz.'],
    ['movement', /dolly|push|pull|pan|tilt|orbit|handheld|crane|tracking|static camera|movimiento/i, 'Movimiento definido', 'Para video, define un movimiento primario y físicamente plausible.'],
    ['look', /film|grain|grade|halation|bloom|diffusion|look|grano|color/i, 'Tratamiento visual', 'Define respuesta fotográfica sólo si cambia el significado o acabado.'],
  ];
  for (const [id, rx, strength, suggestion] of checks) {
    if (rx.test(lower)) { score += id === 'lighting' || id === 'lens' ? 9 : 7; strengths.push(strength); }
    else issues.push({ id, label:`Falta ${strength.toLowerCase()}`, suggestion });
  }
  const hasOutput = /9:16|4:5|16:9|vertical|horizontal|resolution|output|seconds|duration|segundos|duración/i.test(lower);
  if (hasOutput) { score += 7; strengths.push('Contrato de salida presente'); }
  else issues.push({ id:'output', label:'Falta salida', suggestion:'Define formato/aspect y duración si es video.' });
  score = Math.min(100, score);
  return { score, grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 65 ? 'C' : 'D', strengths, issues };
}

export function improveDirectorPrompt(source: string, mode: 'image' | 'video' | 'xroll' = 'image') {
  const audit = auditDirectorPrompt(source);
  let next = source.trim();
  const defaultsByCategory: Partial<Record<DirectorCategory, string>> = {
    shot: 'mcu', lens: '50mm', composition: 'thirds', lighting: 'soft-side', look: 'clean',
    movement: mode === 'video' || mode === 'xroll' ? 'push' : 'static',
  };
  for (const issue of audit.issues) {
    if (!(issue.id in defaultsByCategory)) continue;
    const id = defaultsByCategory[issue.id as DirectorCategory];
    const selected = DIRECTOR_OPTIONS.find((item) => item.id === id);
    if (selected) next = applyDirectorOptionToPrompt(next, selected);
  }
  if (!/must not|avoid|no decorative/i.test(next)) next += ' Preserve subject identity and scene logic; avoid decorative AI gloss, arbitrary holograms, impossible anatomy, fake interfaces and unmotivated effects.';
  if (!/9:16|4:5|16:9/i.test(next)) next += mode === 'image' ? ' Output: production-ready 4:5 image with protected text-safe negative space.' : ' Output: production-ready 9:16 motion piece with stable geometry, coherent end state and physically plausible movement.';
  return next.trim();
}
