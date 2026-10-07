export type DirectorMode = 'image' | 'video' | 'xroll';

export type DirectorCategory =
  | 'shot'
  | 'camera'
  | 'lens'
  | 'angle'
  | 'aperture'
  | 'focus'
  | 'shutter'
  | 'frameRate'
  | 'whiteBalance'
  | 'composition'
  | 'lighting'
  | 'movement'
  | 'subjectMotion'
  | 'environmentMotion'
  | 'look'
  | 'atmosphere'
  | 'material'
  | 'fx';

export type PreviewSpec = {
  subjectScale?: number;
  subjectX?: number;
  subjectY?: number;
  backgroundScale?: number;
  blur?: number;
  contrast?: number;
  warmth?: number;
  vignette?: number;
  haze?: number;
  grain?: number;
  bloom?: number;
  light?: 'front' | 'left' | 'right' | 'back' | 'top' | 'practical' | 'flat';
  motion?: 'none' | 'push' | 'pull' | 'pan' | 'tilt' | 'orbit' | 'truck' | 'handheld' | 'crane';
};

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
  preview: PreviewSpec;
};

export type DirectorPreset = {
  id: string;
  label: string;
  family: string;
  description: string;
  tags: string[];
  values: Partial<Record<DirectorCategory, string>>;
};

export type DirectorSelections = Partial<Record<DirectorCategory, string>>;

const o = (
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
  preview: PreviewSpec = {},
): DirectorOption => ({ category, id, label, short, effect, feel, useFor, avoidWhen, prompt, tags, preview });

export const DIRECTOR_CATEGORIES: Array<{ id: DirectorCategory; label: string; description: string; group: 'camera' | 'light' | 'motion' | 'look' }> = [
  { id: 'shot', label: 'Encuadre', description: 'Cuánto sujeto y cuánto mundo entran en el plano.', group: 'camera' },
  { id: 'camera', label: 'Cámara', description: 'Respuesta de sensor/cuerpo y carácter de captura.', group: 'camera' },
  { id: 'lens', label: 'Lente', description: 'Perspectiva, compresión y relación espacial.', group: 'camera' },
  { id: 'angle', label: 'Ángulo / altura', description: 'Posición psicológica y altura de la cámara.', group: 'camera' },
  { id: 'aperture', label: 'Apertura', description: 'Profundidad de campo y separación óptica.', group: 'camera' },
  { id: 'focus', label: 'Foco', description: 'Qué plano domina y cómo cambia la atención.', group: 'camera' },
  { id: 'shutter', label: 'Shutter', description: 'Cantidad y carácter del motion blur.', group: 'camera' },
  { id: 'frameRate', label: 'FPS', description: 'Cadencia temporal y sensación de movimiento.', group: 'camera' },
  { id: 'whiteBalance', label: 'Balance', description: 'Temperatura base y mezcla de fuentes.', group: 'light' },
  { id: 'composition', label: 'Composición', description: 'Jerarquía, blocking, espacio negativo y profundidad.', group: 'camera' },
  { id: 'lighting', label: 'Iluminación', description: 'Fuente, dirección, calidad y contraste.', group: 'light' },
  { id: 'movement', label: 'Movimiento cámara', description: 'Trayectoria, velocidad y energía de cámara.', group: 'motion' },
  { id: 'subjectMotion', label: 'Movimiento sujeto', description: 'Acción observable y performance física.', group: 'motion' },
  { id: 'environmentMotion', label: 'Movimiento entorno', description: 'Aire, telas, lluvia, reflejos y secundarios.', group: 'motion' },
  { id: 'look', label: 'Look / film', description: 'Color, respuesta fotoquímica y carácter óptico.', group: 'look' },
  { id: 'atmosphere', label: 'Atmósfera', description: 'Densidad espacial, clima, haze y partículas.', group: 'look' },
  { id: 'material', label: 'Material', description: 'Respuesta física de piel, metal, vidrio, papel y tela.', group: 'look' },
  { id: 'fx', label: 'FX / VFX', description: 'Efectos con una función visual explícita.', group: 'look' },
];

export const DIRECTOR_OPTIONS: DirectorOption[] = [
  o('shot','ecu','ECU','Detalle extremo','Aísla un detalle y elimina casi todo el contexto.','Urgente · sensorial','ojos, manos, producto, textura','necesitas leer el espacio','extreme close-up, one decisive detail fills the frame, minimal environmental context',['macro','detail','tension'],{subjectScale:1.58,vignette:.28}),
  o('shot','cu','Close-up','Rostro dominante','Prioriza expresión y microgesto.','Íntimo · humano','reacción, retrato, testimonio','el entorno es evidencia principal','close-up framing, face and micro-expression dominate, background remains subordinate',['portrait','emotion'],{subjectScale:1.36,vignette:.18}),
  o('shot','mcu','Medium CU','Rostro + gesto','Conserva rostro, manos y un objeto narrativo.','Editorial · controlado','autoridad, educación, diálogo','necesitas cuerpo completo','medium close-up, face, hands and one narrative object clearly readable',['business','social','portrait'],{subjectScale:1.18}),
  o('shot','medium','Medium','Contexto humano','Equilibra gesto, cuerpo y espacio.','Natural · observacional','diálogo, oficina, documental','buscas máxima intimidad','medium shot with enough environment to explain action without losing expression',['documentary','business'],{subjectScale:1}),
  o('shot','full','Full shot','Cuerpo completo','Hace legibles postura y relación con el espacio.','Descriptivo · físico','performance, fashion, blocking','microexpresión es lo principal','full-body shot with posture and spatial relationship clearly readable',['fashion','blocking'],{subjectScale:.82}),
  o('shot','wide','Wide','Entorno dominante','El lugar participa en el significado.','Situacional · arquitectónico','aislamiento, arquitectura, reveal','emoción facial es el centro','wide shot, environment carries narrative meaning while subject remains readable',['architecture','cinema'],{subjectScale:.68,backgroundScale:.92}),
  o('shot','ews','Extreme Wide','Escala máxima','Convierte al sujeto en parte del espacio.','Épico · distante','paisaje, escala, soledad','necesitas detalle de actuación','extreme wide shot, large environmental scale, subject intentionally small but legible',['landscape','scale'],{subjectScale:.48,backgroundScale:.86}),

  o('camera','large-format','Large Format','Separación amplia','Sensación limpia, amplia y de alta resolución con caída suave.','Premium · inmersivo','commercial, portrait, architecture','quieres crudeza pequeña','large-format digital cinema response, smooth tonal roll-off, spacious dimensional rendering',['premium','commercial'],{contrast:1.02}),
  o('camera','super35','Super 35','Cine equilibrado','Escala cinematográfica clásica y versátil.','Narrativo · natural','drama, documentary, branded cinema','buscas look extremadamente clínico','Super 35 digital cinema rendering, natural perspective and controlled highlight roll-off',['cinema','narrative'],{contrast:1.06}),
  o('camera','full-frame','Full Frame','Limpio moderno','Separación natural y detalle contemporáneo.','Moderno · pulido','business, beauty, social','quieres textura vintage fuerte','full-frame digital cinema capture, modern detail, gentle highlight roll-off',['modern','business'],{contrast:1.03}),
  o('camera','documentary-sensor','Documentary','Respuesta honesta','Prioriza rango dinámico y naturalidad sobre brillo comercial.','Real · humano','interview, street, BTS','producto extremadamente estilizado','documentary-oriented cinema camera response, restrained sharpening, natural dynamic range',['documentary'],{contrast:.98}),

  o('lens','18mm','18mm','Ultra wide','Aumenta profundidad y proximidad del primer plano.','Inmersivo · enérgico','arquitectura, acción espacial','rostro cercano','18mm ultra-wide perspective, strong foreground depth, carefully controlled edge distortion',['wide','dynamic'],{subjectScale:.76,backgroundScale:.78}),
  o('lens','24mm','24mm','Wide dramático','Amplía la distancia aparente entre planos.','Inmersivo · espacial','arquitectura, tracking, foreground','portrait cercano','24mm wide-angle perspective, pronounced depth, controlled edge distortion',['wide','architecture'],{subjectScale:.84,backgroundScale:.86}),
  o('lens','28mm','28mm','Wide natural','Amplio pero menos agresivo.','Vivo · narrativo','street, social, interior','quieres compresión','28mm perspective, energetic spatial depth with restrained distortion',['street','social'],{subjectScale:.9,backgroundScale:.9}),
  o('lens','35mm','35mm','Natural con entorno','Incluye contexto sin verse excesivamente ancho.','Humano · cinematográfico','documental, diálogo, social','fuerte aislamiento','35mm perspective, natural environmental context and cinematic depth',['documentary','cinema'],{subjectScale:.95,backgroundScale:.94}),
  o('lens','40mm','40mm','Natural íntimo','Compromiso entre contexto y retrato.','Orgánico · cercano','narrative, editorial','arquitectura amplia','40mm spherical perspective, natural proportions with mild subject emphasis',['cinema','editorial'],{subjectScale:1}),
  o('lens','50mm','50mm','Neutral cine','Perspectiva equilibrada.','Limpio · editorial','business, conversación, producto humano','espacio amplio','50mm spherical perspective, natural proportions, balanced subject and environment',['business','editorial'],{subjectScale:1.05}),
  o('lens','65mm','65mm','Compresión suave','Separa más sin perder demasiado contexto.','Refinado · íntimo','portrait editorial, interview','espacio es protagonista','65mm perspective, gentle compression, refined subject isolation',['portrait','interview'],{subjectScale:1.12,blur:.08}),
  o('lens','85mm','85mm','Compresión íntima','Aísla al sujeto y comprime relaciones espaciales.','Íntimo · controlado','reacción, retrato, presión interna','el entorno explica la idea','85mm portrait compression, natural facial proportions, strong subject separation',['portrait','tension','beauty'],{subjectScale:1.22,backgroundScale:1.08,blur:.22,vignette:.16}),
  o('lens','135mm','135mm','Tele comprimido','Aplana el espacio y separa fuertemente.','Elegante · observacional','fashion, detail, distant portrait','necesitas profundidad ambiental','135mm telephoto compression, flattened perspective, strong optical isolation',['fashion','portrait'],{subjectScale:1.34,backgroundScale:1.16,blur:.3}),
  o('lens','macro100','100mm Macro','Macro físico','Convierte textura/material en protagonista.','Táctil · preciso','food, product, mechanism','acción espacial amplia','100mm macro optics, tactile micro-texture, physically credible surface detail',['macro','food','product'],{subjectScale:1.5,blur:.28}),
  o('lens','anamorphic','Anamorphic','Óptica expresiva','Bokeh ovalado y flare horizontal controlado.','Cinemático · expansivo','night, automotive, narrative','texto limpio o beauty clínico','anamorphic lens response, subtle oval bokeh and restrained horizontal flare',['cinema','night'],{backgroundScale:1.06,contrast:1.06}),
  o('lens','vintage','Vintage Spherical','Imperfección óptica','Suaviza bordes y microcontraste sin parecer filtro.','Orgánico · nostálgico','fashion, music, period','producto técnico','vintage spherical lens character, mild edge softness, gentle flare and lower micro-contrast',['vintage','fashion'],{contrast:.96,warmth:.05}),

  o('angle','ground','Ground level','Muy bajo','Convierte foreground y escala en protagonistas.','Físico · monumental','automotive, product, footsteps','portrait neutral','ground-level camera height with strong foreground perspective',['automotive','low'],{subjectY:-6}),
  o('angle','waist','Waist level','Bajo humano','Más físico sin heroicidad extrema.','Presente · táctil','movement, fashion, walk','interview formal','waist-level camera height, restrained low perspective',['fashion','movement'],{subjectY:-3}),
  o('angle','eye','Eye level','Neutral humano','Comparte altura con el sujeto.','Honesto · cercano','documental, interview, editorial','quieres marcar poder','eye-level camera height, neutral human perspective',['documentary','portrait'],{}),
  o('angle','high','High angle','Exposición','Reduce presencia y aumenta vulnerabilidad.','Frágil · analítico','indecisión, soledad','autoridad','controlled high-angle camera, mild downward perspective',['drama','vulnerability'],{subjectY:4}),
  o('angle','overhead','Overhead','Geometría','Transforma la escena en sistema o mapa.','Analítico · gráfico','tabletop, food, process, XR','expresión facial central','true overhead top-down composition, clean planar geometry',['food','process'],{subjectScale:.8,backgroundScale:.86}),
  o('angle','low','Low angle','Autoridad','Mira ligeramente hacia arriba.','Dominante · sólido','leadership, hero product','vulnerabilidad','restrained low-angle camera, subtle upward perspective without caricature',['power','product'],{subjectY:-4}),
  o('angle','dutch','Dutch subtle','Inestabilidad','Inclina ligeramente el horizonte.','Incómodo · inestable','disorientation, tension','business sobrio','subtle Dutch angle, restrained horizon tilt, no music-video excess',['tension','experimental'],{subjectY:1}),
  o('angle','ots','Over shoulder','Relación','Introduce foreground humano y vínculo entre sujetos.','Narrativo · presente','dialogue, screen, negotiation','copy limpio','over-the-shoulder framing with restrained foreground occlusion',['dialogue','business'],{subjectX:8}),

  o('aperture','f14','f/1.4','Ultra shallow','Plano de foco muy estrecho.','Soñador · íntimo','beauty, detail, low light','múltiples planos deben leerse','f/1.4 aperture, very shallow depth of field, precise focal plane, natural optical falloff',['beauty','portrait'],{blur:.38}),
  o('aperture','f20','f/2','Shallow','Aislamiento fuerte con algo más de tolerancia.','Premium · íntimo','portrait, product','evidencia de fondo','f/2 aperture, shallow depth of field, strong subject separation',['portrait','product'],{blur:.3}),
  o('aperture','f28','f/2.8','Cine equilibrado','Separación controlada y entorno todavía útil.','Cinemático · flexible','narrative, business, dialogue','necesitas deep focus','f/2.8 aperture, moderate shallow depth, environment remains contextually readable',['cinema','business'],{blur:.18}),
  o('aperture','f40','f/4','Moderada','Más profundidad y consistencia de foco.','Natural · preciso','documentary, two-shot','aislamiento fuerte','f/4 aperture, moderate depth of field, subject and nearby context readable',['documentary'],{blur:.1}),
  o('aperture','f56','f/5.6','Profunda','Varios planos útiles en foco.','Claro · descriptivo','process, architecture, XR','portrait dreamy','f/5.6 aperture, deeper focus with layered scene readability',['architecture','process'],{blur:.04}),
  o('aperture','f8','f/8','Deep','Alta legibilidad espacial.','Técnico · estable','architecture, tabletop, evidence','low light natural','f/8 aperture, deep focus, foreground through background intentionally legible',['architecture','xroll'],{blur:0}),

  o('focus','subject','Subject lock','Foco sujeto','Mantiene identidad/rostro como ancla.','Seguro · humano','portrait, interview','objeto es protagonista','focus locked on subject eyes/face with stable focal plane',['portrait'],{blur:.14}),
  o('focus','foreground','Foreground focus','Foco objeto','El objeto cercano domina y el sujeto acompaña.','Táctil · explicativo','product, decision cards, props','rostro debe dominar','foreground narrative object in sharp focus, subject secondary but readable',['product','education'],{blur:.2}),
  o('focus','deep','Deep focus','Todo legible','Mantiene múltiples planos narrativos.','Preciso · explicativo','architecture, process, XR','aislamiento emocional','deep focus across foreground, subject and environment',['architecture','xroll'],{blur:0}),
  o('focus','rack','Rack focus','Cambio jerarquía','Desplaza atención durante el plano.','Narrativo · revelador','video reveal, object→face','still image','controlled rack focus between two motivated focal planes, no focus hunting',['video','reveal'],{blur:.2,motion:'push'}),
  o('focus','split','Split focus','Dos planos','Mantiene foreground y background legibles a la vez.','Técnico · extraño','dialogue, conceptual','naturalismo simple','split-focus visual logic, two narrative planes remain intentionally sharp',['conceptual','dialogue'],{blur:.05}),

  o('shutter','180','180° / 1/48','Motion natural','Blur cinematográfico estándar.','Natural · cine','24fps narrative, most motion','acción muy nítida','180-degree shutter equivalent, natural cinematic motion blur',['cinema','default'],{}),
  o('shutter','90','90°','Motion crisp','Reduce blur y vuelve el movimiento más duro.','Urgente · preciso','action, sports, product motion','drama suave','90-degree shutter equivalent, crisp motion with reduced blur',['action','crisp'],{contrast:1.06}),
  o('shutter','270','270°','Motion soft','Aumenta blur y continuidad de movimiento.','Fluido · onírico','dream, slow movement','detalle técnico','270-degree shutter equivalent, softer motion blur and fluid cadence',['dream','soft'],{blur:.08}),
  o('shutter','360','360°','Drag motion','Blur marcado y arrastre temporal.','Experimental · etéreo','music, abstraction','realismo clásico','360-degree shutter equivalent, pronounced motion smear used intentionally',['experimental'],{blur:.16}),

  o('frameRate','24fps','24 fps','Cadencia cine','Movimiento temporal clásico.','Narrativo · cine','drama, commercial, dialogue','slow motion real','24 fps cinematic cadence',['cinema','default'],{}),
  o('frameRate','25fps','25 fps','Cadencia broadcast','Leve cambio europeo/broadcast.','Neutral · broadcast','PAL workflows, interview','cine USA estricto','25 fps acquisition cadence',['broadcast'],{}),
  o('frameRate','30fps','30 fps','Más directo','Algo más inmediato y limpio.','Digital · social','social, product demo','cine narrativo clásico','30 fps cadence, slightly more immediate motion rendering',['social','digital'],{}),
  o('frameRate','48fps','48 fps','Alta cadencia','Más definición temporal.','Preciso · hiperreal','action, technical movement','drama íntimo','48 fps high-frame-rate capture, increased temporal clarity',['action','hfr'],{}),
  o('frameRate','60fps','60 fps','Slow motion source','Permite ralentizar con detalle.','Fluido · comercial','beauty, food, product, sports','dialogue normal','60 fps capture intended for controlled slow-motion playback',['slowmo','commercial'],{}),
  o('frameRate','120fps','120 fps','Slow motion extremo','Captura microdinámica con gran detalle temporal.','Heroico · sensorial','liquid, particles, sport detail','performance dialogada','120 fps high-speed capture for pronounced slow motion',['slowmo','macro'],{}),

  o('whiteBalance','3200k','3200K','Tungsten base','Neutraliza prácticos cálidos y enfría daylight.','Nocturno · controlado','night interior, tungsten','day exterior natural','white balance around 3200K, tungsten-neutral base with cooler daylight contamination',['night','tungsten'],{warmth:-.08}),
  o('whiteBalance','4300k','4300K','Mixed neutral','Equilibra tungsten y daylight mixtos.','Cinemático · mixto','office, night/day mix','fuente única daylight','white balance around 4300K, controlled mixed-source separation',['mixed'],{warmth:.02}),
  o('whiteBalance','5600k','5600K','Daylight','Base neutra exterior/día.','Natural · limpio','window, exterior, commercial','tungsten dominante','white balance around 5600K for neutral daylight rendering',['daylight'],{}),
  o('whiteBalance','6500k','6500K','Cool ambient','Empuja fuentes neutras ligeramente cálidas y conserva cielo frío.','Atmosférico · dusk','overcast, dusk','skin cálida interior','white balance around 6500K for cool ambient environments while protecting skin',['dusk','overcast'],{warmth:-.08}),
  o('whiteBalance','mixed','Mixed color','Separación color','Mantiene diferencias entre fuentes cálidas y frías.','Rico · nocturno','practicals + window, city night','brand color estrictamente neutral','intentional mixed color temperature, warm practicals against cooler ambient light',['night','cinema'],{warmth:.12}),

  o('composition','thirds','Rule of thirds','Jerarquía clásica','Descentra sujeto y crea aire.','Editorial · claro','copy, portrait, social','simetría es concepto','rule-of-thirds composition, deliberate negative space, one dominant hierarchy',['editorial','social'],{subjectX:-13}),
  o('composition','center','Centered','Centro fuerte','Bloquea la jerarquía en el eje.','Icónico · directo','product, portrait, social hook','quieres naturalismo asimétrico','centered composition with strong central focal hierarchy',['product','portrait'],{}),
  o('composition','symmetry','Symmetry','Orden geométrico','Convierte geometría en mensaje.','Controlado · icónico','architecture, product','documentary espontáneo','precise symmetrical composition and controlled visual balance',['architecture','product'],{}),
  o('composition','negative','Negative space','Aire narrativo','Reserva una zona tranquila y útil.','Premium · editorial','copy, isolation, authority','escena densa','strong negative space, subject offset, protected text-safe area',['editorial','text'],{subjectX:-17}),
  o('composition','layered','Layered depth','Tres planos','Foreground, midground y background tienen función.','Inmersivo · cine','XR, storytelling, documentary','gráfica plana','meaningful foreground, midground and background separation',['cinema','xroll'],{backgroundScale:.92}),
  o('composition','frame','Frame within frame','Marco interno','Usa arquitectura/objetos para contener al sujeto.','Observado · tenso','drama, introspection','product clean','frame-within-frame composition using real architecture or foreground objects',['drama'],{vignette:.24}),
  o('composition','leading','Leading lines','Dirección visual','Geometría guía mirada al foco.','Preciso · dinámico','architecture, product, road','portrait minimal','leading lines converge toward the primary narrative subject',['architecture','automotive'],{}),
  o('composition','diagonal','Diagonal tension','Energía diagonal','Crea dirección y desequilibrio controlado.','Activo · tenso','action, fashion','business sober','controlled diagonal composition, directional energy without visual clutter',['fashion','action'],{}),

  o('lighting','soft-side','Soft side','Lateral suave','Modela volumen sin agresividad.','Premium · humano','editorial, business, portrait','sol duro','large soft motivated side key, gentle falloff, controlled negative fill, natural skin response',['portrait','business'],{light:'left',contrast:1.08}),
  o('lighting','hard-side','Hard side','Lateral duro','Sombras definidas y borde claro.','Tenso · gráfico','drama, fashion, product','beauty suave','hard directional side key, crisp shadow edge, protected highlights',['drama','fashion'],{light:'right',contrast:1.28,vignette:.12}),
  o('lighting','window','Window motivated','Ventana creíble','La fuente tiene causa visible/inferible.','Natural · cine','interior, documentary','set sin fuente lógica','motivated window key with believable direction and subtle ambient fill',['documentary','interior'],{light:'left',warmth:-.04}),
  o('lighting','backlight','Backlight','Separación trasera','Perfil y profundidad desde atrás.','Atmosférico · elegante','fashion, reveal, night','texto sobre fondo brillante','controlled backlight with restrained rim separation and protected facial exposure',['fashion','night'],{light:'back',contrast:1.18,haze:.1}),
  o('lighting','top','Top light','Luz cenital','Esculpe ojos/cara o producto desde arriba.','Dramático · gráfico','tabletop, moody portrait','beauty abierta','motivated top light with controlled eye sockets and spill',['dramatic','tabletop'],{light:'top',contrast:1.24}),
  o('lighting','beauty','Beauty wrap','Envolvente','Transiciones suaves y catchlights limpios.','Pulido · comercial','beauty, skincare','drama contrastado','large frontal-soft beauty source with wrap, clean catchlight and gentle fill',['beauty','commercial'],{light:'front',contrast:.94}),
  o('lighting','practical','Night practical','Prácticos','Lámparas visibles motivan color y dirección.','Íntimo · nocturno','night interior, documentary','high-key clean','motivated practical lamps, warm pools, restrained ambient exposure',['night','documentary'],{light:'practical',warmth:.28,vignette:.18}),
  o('lighting','noir','Negative fill 8:1','Contraste alto','Reduce fill y deja sombra con intención.','Tenso · escultórico','decision pressure, noir portrait','marca luminosa','high-contrast key with strong negative fill, approximately 8:1 key-to-fill ratio',['noir','tension'],{light:'right',contrast:1.42,vignette:.28}),
  o('lighting','overcast','Overcast sky','Difusa exterior','Ambiental uniforme con bajas especulares.','Honesto · suave','exterior, fashion natural','sombras gráficas','soft overcast skylight, low specular contrast and natural color response',['documentary','exterior'],{light:'flat',contrast:.92,warmth:-.06}),
  o('lighting','product-rim','Product rim','Borde producto','Define silueta y materiales reflectantes.','Premium · preciso','product, automotive','human documentary','controlled rim and strip-light reflections defining product geometry',['product','automotive'],{light:'back',contrast:1.2}),

  o('movement','static','Static','Bloqueado','La actuación/composición cargan el plano.','Seguro · observacional','dialogue, product, tension','necesitas reveal espacial','locked-off camera, no camera movement',['dialogue','product'],{motion:'none'}),
  o('movement','push','Slow push-in','Acercamiento','Aumenta atención progresivamente.','Íntimo · inevitable','decision, reveal, emotion','ya estás demasiado cerca','restrained slow dolly-in with smooth acceleration and stable horizon',['drama','tension'],{motion:'push'}),
  o('movement','pull','Slow pull-out','Distancia','Revela contexto/aislamiento.','Reflexivo · revelador','ending, loneliness, architecture','hook inmediato','slow controlled dolly-out revealing environmental context',['reveal','architecture'],{motion:'pull'}),
  o('movement','pan','Pan','Giro horizontal','Revela relación lateral sin mover posición.','Observacional · descriptivo','space, process, follow','parallax fuerte','slow motivated pan, stable horizon, subject remains readable',['documentary'],{motion:'pan'}),
  o('movement','tilt','Tilt','Giro vertical','Revela escala arriba/abajo.','Descriptivo · monumental','architecture, product','dialogue','controlled tilt revealing vertical scale, no whip unless requested',['architecture'],{motion:'tilt'}),
  o('movement','truck','Truck','Desplazamiento lateral','Genera parallax entre planos.','Espacial · premium','product, XR, interior','flat graphic','slow lateral truck move creating controlled parallax',['xroll','product'],{motion:'truck'}),
  o('movement','orbit','Orbit','Arco alrededor','Expone forma y profundidad.','Premium · hero','product, automotive','dialogue naturalista','slow controlled orbit around subject, constant distance and stable geometry',['product','automotive'],{motion:'orbit'}),
  o('movement','handheld','Restrained handheld','Microvariación','Sensación humana sin perder composición.','Documental · vivo','BTS, interview, street','product clean','restrained handheld micro-movement, stabilized enough to preserve framing',['documentary','street'],{motion:'handheld'}),
  o('movement','crane','Crane reveal','Vertical espacial','Cambia escala y jerarquía del entorno.','Expansivo · cine','architecture, reveal','intimate portrait','slow crane rise revealing spatial context while preserving continuity',['architecture'],{motion:'crane'}),

  o('subjectMotion','still','Still tension','Quietud','Microgesto y respiración cargan significado.','Contenido · tenso','portrait, decision, interview','acción física es la tesis','subject remains mostly still; only natural breathing and micro-expression',['portrait','tension'],{}),
  o('subjectMotion','look','Look shift','Cambio mirada','Hace visible atención/decisión.','Psicológico · claro','reaction, decision','producto sin persona','subject shifts gaze deliberately between motivated points of attention',['decision','reaction'],{}),
  o('subjectMotion','reach','Reach / stop','Alcance interrumpido','Convierte duda en acción observable.','Tenso · humano','choice, product, narrative','acción rápida','subject reaches toward the narrative object, pauses before commitment, then settles',['decision','action'],{}),
  o('subjectMotion','turn','Turn','Giro','Reorienta cuerpo/atención en un beat.','Narrativo · legible','reveal, dialogue','still portrait','one controlled head/body turn motivated by an off-screen cue',['reveal','dialogue'],{}),
  o('subjectMotion','walk','Walk','Desplazamiento humano','Da ritmo y blocking al espacio.','Natural · cinético','fashion, office, street','macro/product','natural walking pace with grounded foot contact and consistent body mechanics',['fashion','street'],{}),
  o('subjectMotion','gesture','Measured gesture','Gesto medido','Comunica sin sobreactuar.','Autoridad · real','talking head, business','silent product','one restrained hand gesture synchronized with the key idea, no repetitive gesturing',['business','social'],{}),

  o('environmentMotion','none','Still environment','Entorno quieto','Evita movimiento decorativo.','Controlado · limpio','business, product, portrait','escena requiere clima','environment remains stable; no decorative background motion',['clean','product'],{}),
  o('environmentMotion','fabric','Fabric / hair','Movimiento sutil','Añade física secundaria creíble.','Táctil · vivo','fashion, exterior','office static','subtle physically plausible hair and fabric movement driven by a gentle air source',['fashion','beauty'],{}),
  o('environmentMotion','rain','Rain interaction','Lluvia física','Reflejos, gotas y superficie reaccionan.','Urbano · dramático','automotive, night','interior clean','real rain with surface interaction, wet reflections and directional fall',['rain','automotive'],{haze:.14}),
  o('environmentMotion','haze','Haze drift','Aire lento','Hace visible profundidad sin partículas arbitrarias.','Atmosférico · cine','backlight, reveal','clinical product','very slow atmospheric haze drift, only visible where motivated by light',['cinema','haze'],{haze:.18}),
  o('environmentMotion','reflection','Moving reflections','Reflejo contextual','La luz del entorno se mueve sobre superficies.','Premium · urbano','car, glass, product','matte documentary','physically motivated moving reflections from real environmental sources',['product','night'],{}),
  o('environmentMotion','traffic','Background life','Vida fondo','Crea mundo sin robar foco.','Observacional · real','street, cafe, office','isolated portrait','restrained background human/traffic movement, soft and subordinate to subject',['documentary','street'],{}),

  o('look','clean','Clean digital','Limpio moderno','Neutralidad, detalle y roll-off controlado.','Preciso · moderno','product, business, tech','analog texture','clean modern digital cinema response, controlled highlights, neutral micro-contrast',['business','product'],{contrast:1.03}),
  o('look','35mm','35mm film','Fotoquímico','Grano fino, halation y densidad de color.','Cinemático · táctil','narrative, editorial, doc premium','UI clínica','35mm film response, fine organic grain, gentle halation, soft highlight roll-off',['cinema','editorial'],{contrast:1.08,warmth:.05,grain:.25}),
  o('look','16mm','16mm','Grano presente','Textura y respuesta más cruda.','Crudo · nostálgico','documentary, music, street','beauty clean','16mm film response, visible organic grain, restrained saturation and gate character',['documentary','music'],{contrast:1.1,grain:.48}),
  o('look','soft-diffusion','Soft diffusion','Difusión óptica','Reduce microcontraste en highlights.','Romántico · beauty','beauty, fashion','technical product','subtle optical diffusion, gentle highlight bloom, preserved facial detail',['beauty','fashion'],{contrast:.96,bloom:.16}),
  o('look','cool-editorial','Cool editorial','Frío sobrio','Ambiente frío con piel protegida.','Editorial · serio','business, architecture, decision','hospitality cálida','cool-neutral editorial grade, natural skin protected, restrained saturation',['business','architecture'],{warmth:-.18,contrast:1.06}),
  o('look','warm-doc','Warm documentary','Cálido real','Medios tonos cálidos sin naranja artificial.','Humano · cercano','documentary, testimonial, food','tech clinical','warm documentary color response, natural skin and deep neutral blacks',['documentary','food'],{warmth:.18}),
  o('look','bleach','Bleach restrained','Desaturado denso','Menos color y más separación tonal.','Severo · gráfico','industrial, tension','beauty','restrained bleach-bypass-inspired response, lower saturation, dense contrast, protected skin',['industrial','tension'],{contrast:1.22}),
  o('look','pastel','Pastel editorial','Suave color','Baja densidad cromática con highlights suaves.','Ligero · fashion','beauty, lifestyle','noir','pastel editorial palette, softened highlights, controlled low-contrast color separation',['fashion','beauty'],{contrast:.92,warmth:.06}),

  o('atmosphere','clean','Clean air','Aire limpio','Máxima claridad espacial.','Preciso · comercial','product, tech, architecture','rayos/haze','clean clear air, high spatial clarity, no decorative haze',['product','tech'],{haze:0}),
  o('atmosphere','light-haze','Light haze','Haze leve','Revela profundidad/backlight sin lavar negros.','Cinemático · atmosférico','cinema, reveal','text-heavy','very light atmospheric haze, enough for depth separation without milky blacks',['cinema','reveal'],{haze:.18}),
  o('atmosphere','mist','Mist','Niebla fina','Suaviza distancia y crea capas.','Poético · exterior','landscape, fashion','product technical','fine environmental mist with physically plausible depth falloff',['fashion','landscape'],{haze:.32}),
  o('atmosphere','rain','Rain','Lluvia','Añade clima y reflejos motivados.','Dramático · urbano','night, automotive','interior clean','realistic rain interaction, wet surfaces, controlled reflections',['automotive','night'],{haze:.14,contrast:1.1}),
  o('atmosphere','dust','Dust motes','Partículas reales','Hace visible un haz de forma física.','Táctil · antiguo','workshop, archive','corporate clean','sparse dust motes visible only inside motivated light beams',['workshop','period'],{haze:.1}),
  o('atmosphere','smoke','Smoke layer','Humo localizado','Crea volumen pesado y separación.','Denso · dramático','stage, industrial','food clean','localized physically motivated smoke, layered by depth, never uniform fog',['stage','industrial'],{haze:.36}),

  o('material','natural-skin','Natural skin','Piel real','Conserva poro, variación y specular natural.','Humano · premium','portrait, beauty, testimonial','stylized illustration','natural skin texture with pores, subtle color variation and physically plausible specular response',['portrait','beauty'],{}),
  o('material','matte-paper','Matte paper','Papel mate','Fibra y absorción sin brillo plástico.','Editorial · táctil','cards, documents, carousel concepts','glass product','matte paper fibers, soft edge wear and low specular response',['paper','editorial'],{}),
  o('material','brushed-metal','Brushed metal','Metal cepillado','Reflejo direccional controlado.','Premium · industrial','product, automotive','soft lifestyle','brushed metal anisotropic highlights with physically coherent reflections',['metal','product'],{}),
  o('material','glass','Optical glass','Vidrio real','Reflejos/refracción con geometría creíble.','Preciso · premium','bottle, architecture','matte concept','physically plausible glass refraction, Fresnel reflections and clean edges',['glass','product'],{}),
  o('material','fabric','Real fabric','Tela real','Fibras, pliegues y caída física.','Táctil · humano','fashion, wardrobe','hard product','real woven fabric texture, plausible folds, weight and light absorption',['fashion','wardrobe'],{}),
  o('material','wood','Natural wood','Madera real','Grano, matte finish y variación.','Cálido · tangible','table, interior, food','futuristic clean','natural wood grain, matte finish, restrained specular highlights',['interior','food'],{}),

  o('fx','none','No decorative FX','Sin FX','Obliga a resolver con escena/cámara/luz.','Realista · disciplinado','documentary, editorial, business','transformación explícita','no decorative visual effects; rely on physical scene, camera, light and performance',['realism'],{}),
  o('fx','bloom','Controlled bloom','Bloom','Suaviza fuentes fuertes sin lavar negros.','Óptico · nocturno','night, beauty','text-heavy','controlled optical bloom around motivated highlights only, blacks remain anchored',['night','beauty'],{bloom:.2}),
  o('fx','halation','Subtle halation','Halation','Borde cálido fotoquímico en highlights.','Film · táctil','35mm, practicals','clinical product','subtle red-warm halation only on strongest highlights',['film'],{warmth:.07,bloom:.08}),
  o('fx','reflections','Practical reflections','Reflejos','Añade capas sobre vidrio/metal reales.','Premium · espacial','automotive, product','clean portrait','physically motivated reflections on real glass or metal, no impossible mirror geometry',['automotive','product'],{}),
  o('fx','volumetric','Motivated volumetric','Volumétrico','Hace visible haz sólo con fuente + medio.','Atmosférico · dramático','stage, window beam','flat clean light','motivated volumetric light through real haze, coherent beam direction',['cinema','stage'],{haze:.28,contrast:1.14}),
  o('fx','light-leak','Light leak restrained','Leak óptico','Accidente óptico controlado como transición.','Orgánico · experimental','music, transition','business clean','brief restrained optical light leak motivated as a transition, not constant overlay',['music','experimental'],{warmth:.15,bloom:.1}),
];

export const DIRECTOR_PRESETS: DirectorPreset[] = [
  { id:'intimate-pressure', label:'Intimate Pressure', family:'Cinema', description:'Tensión interna sin caer en thriller.', tags:['decision','pressure','tension','business'], values:{ shot:'mcu', camera:'super35', lens:'85mm', angle:'eye', aperture:'f28', focus:'subject', shutter:'180', frameRate:'24fps', whiteBalance:'4300k', composition:'negative', lighting:'soft-side', movement:'push', subjectMotion:'reach', environmentMotion:'none', look:'cool-editorial', atmosphere:'clean', material:'natural-skin', fx:'none' } },
  { id:'quiet-authority', label:'Quiet Authority', family:'Business', description:'Autoridad sobria y editorial.', tags:['business','authority','leadership'], values:{ shot:'mcu', camera:'full-frame', lens:'50mm', angle:'eye', aperture:'f28', focus:'subject', shutter:'180', frameRate:'24fps', whiteBalance:'5600k', composition:'thirds', lighting:'window', movement:'static', subjectMotion:'gesture', environmentMotion:'none', look:'clean', atmosphere:'clean', material:'natural-skin', fx:'none' } },
  { id:'human-documentary', label:'Human Documentary', family:'Documentary', description:'Entorno legible y presencia humana.', tags:['documentary','interview','real'], values:{ shot:'medium', camera:'documentary-sensor', lens:'35mm', angle:'eye', aperture:'f40', focus:'subject', shutter:'180', frameRate:'24fps', whiteBalance:'5600k', composition:'layered', lighting:'overcast', movement:'handheld', subjectMotion:'gesture', environmentMotion:'traffic', look:'warm-doc', atmosphere:'clean', material:'natural-skin', fx:'none' } },
  { id:'editorial-portrait', label:'Editorial Portrait', family:'Editorial', description:'Retrato con aire para copy y textura fotográfica.', tags:['portrait','editorial','fashion'], values:{ shot:'cu', camera:'large-format', lens:'85mm', angle:'eye', aperture:'f20', focus:'subject', shutter:'180', frameRate:'24fps', whiteBalance:'5600k', composition:'negative', lighting:'soft-side', movement:'static', subjectMotion:'still', environmentMotion:'none', look:'35mm', atmosphere:'clean', material:'natural-skin', fx:'halation' } },
  { id:'luxury-product', label:'Luxury Product Reveal', family:'Commercial', description:'Volumen, materiales y reflejos controlados.', tags:['product','luxury','commercial'], values:{ shot:'cu', camera:'large-format', lens:'macro100', angle:'low', aperture:'f28', focus:'foreground', shutter:'180', frameRate:'60fps', whiteBalance:'4300k', composition:'center', lighting:'product-rim', movement:'orbit', subjectMotion:'still', environmentMotion:'reflection', look:'clean', atmosphere:'light-haze', material:'brushed-metal', fx:'reflections' } },
  { id:'architecture-reveal', label:'Architecture Reveal', family:'Architecture', description:'Escala, profundidad y movimiento estable.', tags:['architecture','interior','space'], values:{ shot:'wide', camera:'large-format', lens:'24mm', angle:'eye', aperture:'f56', focus:'deep', shutter:'180', frameRate:'24fps', whiteBalance:'5600k', composition:'leading', lighting:'window', movement:'crane', environmentMotion:'none', look:'clean', atmosphere:'light-haze', material:'glass', fx:'none' } },
  { id:'vertical-authority', label:'Vertical Authority', family:'Social', description:'Reel sobrio con rostro, gesto y copy-safe area.', tags:['social','reel','talking-head','business'], values:{ shot:'mcu', camera:'full-frame', lens:'50mm', angle:'eye', aperture:'f28', focus:'subject', shutter:'180', frameRate:'30fps', whiteBalance:'5600k', composition:'negative', lighting:'soft-side', movement:'push', subjectMotion:'gesture', environmentMotion:'none', look:'clean', atmosphere:'clean', material:'natural-skin', fx:'none' } },
  { id:'night-practical', label:'Night Practical', family:'Cinema', description:'Interior nocturno creíble con fuentes prácticas.', tags:['night','cinema','interior'], values:{ shot:'medium', camera:'super35', lens:'50mm', angle:'eye', aperture:'f20', focus:'subject', shutter:'180', frameRate:'24fps', whiteBalance:'3200k', composition:'frame', lighting:'practical', movement:'push', subjectMotion:'still', environmentMotion:'haze', look:'35mm', atmosphere:'light-haze', material:'natural-skin', fx:'bloom' } },
  { id:'beauty-clean', label:'Beauty Clean', family:'Beauty', description:'Piel, catchlights y movimiento suave.', tags:['beauty','skincare','portrait'], values:{ shot:'cu', camera:'large-format', lens:'85mm', angle:'eye', aperture:'f20', focus:'subject', shutter:'180', frameRate:'60fps', whiteBalance:'5600k', composition:'center', lighting:'beauty', movement:'static', subjectMotion:'turn', environmentMotion:'fabric', look:'soft-diffusion', atmosphere:'clean', material:'natural-skin', fx:'bloom' } },
  { id:'automotive-night', label:'Automotive Night', family:'Automotive', description:'Metal, reflejos y ciudad nocturna.', tags:['car','automotive','night'], values:{ shot:'wide', camera:'large-format', lens:'35mm', angle:'ground', aperture:'f28', focus:'foreground', shutter:'90', frameRate:'48fps', whiteBalance:'4300k', composition:'leading', lighting:'product-rim', movement:'truck', environmentMotion:'reflection', look:'35mm', atmosphere:'rain', material:'brushed-metal', fx:'reflections' } },
  { id:'food-macro', label:'Food Macro', family:'Food', description:'Textura, vapor y apetito visual.', tags:['food','macro','restaurant'], values:{ shot:'ecu', camera:'large-format', lens:'macro100', angle:'overhead', aperture:'f28', focus:'foreground', shutter:'180', frameRate:'60fps', whiteBalance:'4300k', composition:'thirds', lighting:'soft-side', movement:'push', environmentMotion:'haze', look:'warm-doc', atmosphere:'clean', material:'glass', fx:'none' } },
  { id:'fashion-walk', label:'Fashion Walk', family:'Fashion', description:'Movimiento corporal, textura y profundidad.', tags:['fashion','walk','editorial'], values:{ shot:'full', camera:'full-frame', lens:'50mm', angle:'waist', aperture:'f28', focus:'subject', shutter:'180', frameRate:'24fps', whiteBalance:'5600k', composition:'diagonal', lighting:'hard-side', movement:'truck', subjectMotion:'walk', environmentMotion:'fabric', look:'35mm', atmosphere:'light-haze', material:'fabric', fx:'halation' } },
  { id:'product-clean', label:'Clean Product Hero', family:'Product', description:'Geometría precisa, materiales limpios y cero ruido visual.', tags:['product','clean','tech'], values:{ shot:'cu', camera:'large-format', lens:'65mm', angle:'eye', aperture:'f56', focus:'foreground', shutter:'180', frameRate:'30fps', whiteBalance:'5600k', composition:'symmetry', lighting:'product-rim', movement:'static', environmentMotion:'none', look:'clean', atmosphere:'clean', material:'glass', fx:'none' } },
  { id:'decision-xr', label:'Decision / Criterion XRoll', family:'XRoll', description:'Jerarquía por capas para explicar una decisión.', tags:['xroll','decision','criterion','layers'], values:{ shot:'medium', camera:'full-frame', lens:'35mm', angle:'overhead', aperture:'f56', focus:'deep', shutter:'180', frameRate:'30fps', whiteBalance:'5600k', composition:'layered', lighting:'soft-side', movement:'truck', environmentMotion:'none', look:'clean', atmosphere:'clean', material:'matte-paper', fx:'none' } },
  { id:'social-hook', label:'Social Hook', family:'Social', description:'Entrada inmediata sin movimiento gratuito.', tags:['social','hook','vertical'], values:{ shot:'mcu', camera:'full-frame', lens:'35mm', angle:'eye', aperture:'f28', focus:'subject', shutter:'180', frameRate:'30fps', whiteBalance:'5600k', composition:'thirds', lighting:'soft-side', movement:'push', subjectMotion:'look', environmentMotion:'none', look:'clean', atmosphere:'clean', material:'natural-skin', fx:'none' } },
  { id:'psychological-drama', label:'Psychological Drama', family:'Cinema', description:'Presión visual contenida y blocking preciso.', tags:['drama','pressure','psychological'], values:{ shot:'cu', camera:'super35', lens:'85mm', angle:'high', aperture:'f20', focus:'subject', shutter:'180', frameRate:'24fps', whiteBalance:'4300k', composition:'frame', lighting:'noir', movement:'push', subjectMotion:'still', environmentMotion:'none', look:'35mm', atmosphere:'light-haze', material:'natural-skin', fx:'halation' } },
  { id:'office-documentary', label:'Office Documentary', family:'Business', description:'Trabajo real, sin stock-corporate.', tags:['office','business','documentary'], values:{ shot:'medium', camera:'documentary-sensor', lens:'35mm', angle:'eye', aperture:'f40', focus:'subject', shutter:'180', frameRate:'24fps', whiteBalance:'4300k', composition:'layered', lighting:'window', movement:'handheld', subjectMotion:'gesture', environmentMotion:'traffic', look:'warm-doc', atmosphere:'clean', material:'natural-skin', fx:'none' } },
];

const DEFAULTS: Record<DirectorMode, DirectorSelections> = {
  image: { shot:'mcu', camera:'full-frame', lens:'50mm', angle:'eye', aperture:'f28', focus:'subject', whiteBalance:'5600k', composition:'thirds', lighting:'soft-side', look:'clean', atmosphere:'clean', material:'natural-skin', fx:'none' },
  video: { shot:'mcu', camera:'super35', lens:'50mm', angle:'eye', aperture:'f28', focus:'subject', shutter:'180', frameRate:'24fps', whiteBalance:'5600k', composition:'thirds', lighting:'soft-side', movement:'push', subjectMotion:'still', environmentMotion:'none', look:'35mm', atmosphere:'clean', material:'natural-skin', fx:'none' },
  xroll: { shot:'medium', camera:'full-frame', lens:'35mm', angle:'eye', aperture:'f56', focus:'deep', shutter:'180', frameRate:'30fps', whiteBalance:'5600k', composition:'layered', lighting:'soft-side', movement:'truck', environmentMotion:'none', look:'clean', atmosphere:'clean', material:'matte-paper', fx:'none' },
};

export function optionsFor(category: DirectorCategory) {
  return DIRECTOR_OPTIONS.filter((item) => item.category === category);
}

export function optionById(id: string | undefined) {
  return DIRECTOR_OPTIONS.find((item) => item.id === id);
}

export function selectionsFromPreset(preset: DirectorPreset): DirectorSelections {
  return { ...preset.values };
}

export function selectedOptions(mode: DirectorMode, selections: DirectorSelections, defaults = true) {
  const resolved = defaults ? { ...DEFAULTS[mode], ...selections } : selections;
  return (Object.entries(resolved) as Array<[DirectorCategory, string]>).flatMap(([category, id]) => {
    const found = DIRECTOR_OPTIONS.find((item) => item.category === category && item.id === id);
    return found ? [found] : [];
  });
}

export function recommendPresets(sourceText: string, mode: DirectorMode, limit = 6) {
  const text = sourceText.toLowerCase();
  const keywords = new Set(text.split(/[^a-záéíóúñ0-9-]+/i).filter(Boolean));
  return DIRECTOR_PRESETS.map((preset) => {
    let score = preset.tags.reduce((sum, tag) => sum + (keywords.has(tag.toLowerCase()) || text.includes(tag.toLowerCase()) ? 4 : 0), 0);
    if (mode === 'xroll' && preset.family === 'XRoll') score += 12;
    if (mode === 'video' && ['Cinema','Documentary','Social','Fashion','Automotive'].includes(preset.family)) score += 2;
    if (mode === 'image' && ['Editorial','Beauty','Product','Commercial'].includes(preset.family)) score += 2;
    return { preset, score };
  }).sort((a,b) => b.score - a.score || a.preset.label.localeCompare(b.preset.label)).slice(0,limit).map((entry) => entry.preset);
}

function sentence(value: string) {
  const trimmed = value.trim();
  return trimmed && !/[.!?]$/.test(trimmed) ? `${trimmed}.` : trimmed;
}

function linesFor(categories: DirectorCategory[], mode: DirectorMode, selections: DirectorSelections) {
  return selectedOptions(mode, selections).filter((item) => categories.includes(item.category)).map((item) => item.prompt).join('; ');
}

export function compileDirectorPrompt(input: {
  sourceText: string;
  mode: DirectorMode;
  selections: DirectorSelections;
  aspect?: string;
  duration?: string;
  preserveText?: boolean;
  useDefaults?: boolean;
}) {
  const source = sentence(input.sourceText);
  const resolved = input.useDefaults === false ? input.selections : { ...DEFAULTS[input.mode], ...input.selections };
  const decisions = selectedOptions(input.mode, resolved, false);
  const aspect = input.aspect || (input.mode === 'image' ? '4:5' : '9:16');
  const duration = input.mode === 'image' ? 'single decisive frame' : input.duration || (input.mode === 'xroll' ? '5–7 seconds' : '6–8 seconds');
  const camera = linesFor(['shot','camera','lens','angle','aperture','focus','shutter','frameRate'], input.mode, resolved);
  const light = linesFor(['whiteBalance','lighting'], input.mode, resolved);
  const motion = linesFor(['movement','subjectMotion','environmentMotion'], input.mode, resolved);
  const design = linesFor(['composition','look','atmosphere','material','fx'], input.mode, resolved);
  const temporal = input.mode === 'image'
    ? 'Freeze the single moment that best explains the idea. Do not invent extra story beats.'
    : input.mode === 'video'
      ? `One coherent shot lasting ${duration}. One primary camera move, one readable subject action and a clear end state. Preserve anatomy, identity, geometry and light continuity from first frame to last.`
      : `A layered XRoll lasting ${duration}. Background, midground, hero subject/object, foreground and graphics exist only when each layer has an explanatory function. Build controlled differential parallax rather than decorative motion.`;
  const textPolicy = input.preserveText
    ? 'Preserve every supplied literal word exactly. Keep typography as a separate editable layer whenever reliable spelling matters.'
    : 'Do not invent body copy or fake interface text. Protect a useful text-safe region if the layout needs later typography.';
  const constraints = input.mode === 'xroll'
    ? 'Each visual layer must be independently generatable and compositable. No arbitrary holograms, fake dashboards, impossible reflections, illegible microtext, plastic AI surfaces or depth without function.'
    : 'No generic stock-business staging, plastic skin, impossible anatomy, arbitrary holograms, fake interfaces, decorative camera moves or effects without narrative function.';

  const prompt = [
    `ROLE / VISUAL FUNCTION\nDirect a production-ready ${input.mode === 'image' ? 'cinematic still' : input.mode === 'video' ? 'cinematic shot' : 'layered XRoll'} whose visual decisions make the supplied idea legible rather than merely “cinematic.”`,
    `SOURCE TRUTH\n${source}`,
    `CAMERA / OPTICS / EXPOSURE\n${camera || 'Use a neutral, physically plausible camera package; do not add an optical gimmick without purpose.'}.`,
    `COMPOSITION / LOOK / MATERIAL\n${design || 'Build one clear focal hierarchy with physically plausible materials and restrained photographic treatment.'}.`,
    `LIGHT / COLOR\n${light || 'Use motivated lighting with a readable source, direction and controlled contrast.'}.`,
    `MOTION / PERFORMANCE\n${motion || (input.mode === 'image' ? 'No motion direction required for the still frame.' : 'Keep camera, subject and environmental motion restrained and physically motivated.')}.`,
    `TEMPORAL / FRAME LOGIC\n${temporal}`,
    `CONTINUITY\nLock identity, wardrobe, scene geography, screen direction, focal treatment, key-light direction and palette unless the source explicitly requests a change. New takes may change interpretation; they must not silently change continuity.` ,
    `TEXT / GRAPHICS\n${textPolicy}`,
    `CONSTRAINTS\n${constraints}`,
    `OUTPUT CONTRACT\n${aspect}; ${duration}; production-ready; clean focal hierarchy; physically plausible depth, reflections and motion; preserve the source idea and do not replace it with generic spectacle.`,
  ].join('\n\n');

  return { prompt, decisions, selections: resolved, aspect, duration };
}

const HINTS: Array<[DirectorCategory | 'intent' | 'subject' | 'action' | 'scene' | 'output', string[]]> = [
  ['subject',['person','woman','man','subject','character','joc','face','portrait','product','persona','rostro']],
  ['action',['move','walk','reach','turn','look','hold','sit','stand','pause','compare','mueve','camina','gira','mira','compara','gesto']],
  ['scene',['room','office','studio','street','table','interior','exterior','background','foreground','oficina','mesa']],
  ['shot',['close-up','medium','wide','ecu','mcu','encuadre']],
  ['camera',['super 35','full-frame','large-format','camera','sensor','cámara']],
  ['lens',['mm','anamorphic','macro','telephoto','lens','lente']],
  ['angle',['eye-level','overhead','low-angle','high-angle','dutch','over-the-shoulder','ángulo']],
  ['aperture',['f/1.4','f/2','f/2.8','f/4','f/5.6','f/8','aperture','apertura']],
  ['focus',['focus','depth of field','focal plane','bokeh','foco']],
  ['shutter',['shutter','180-degree','90-degree','270-degree','360-degree']],
  ['frameRate',['fps','frame rate','cadence','cadencia']],
  ['whiteBalance',['3200k','4300k','5600k','6500k','white balance','temperature','temperatura']],
  ['composition',['composition','negative space','thirds','symmetry','leading lines','composición']],
  ['lighting',['light','lighting','key','fill','rim','window','practical','shadow','luz','iluminación']],
  ['movement',['dolly','push','pull','pan','tilt','orbit','truck','handheld','crane','camera move']],
  ['subjectMotion',['gesture','walking','reaches','turns','gaze','breathing','micro-expression']],
  ['environmentMotion',['rain','fabric','hair','traffic','reflection','haze drift']],
  ['look',['film','grain','grade','diffusion','look','color response','grano']],
  ['atmosphere',['haze','mist','smoke','dust','rain','atmosphere','atmósfera']],
  ['material',['skin','paper','metal','glass','fabric','wood','piel','papel','vidrio','madera']],
  ['fx',['bloom','halation','volumetric','vfx','light leak']],
  ['output',['9:16','4:5','16:9','2.39:1','output','duration','seconds','resolución','duración']],
  ['intent',['purpose','show','communicate','represent','meaning','idea','criterion','decision','mostrar','criterio','decisión']],
];

export type AnatomySegment = { text: string; category: DirectorCategory | 'intent' | 'subject' | 'action' | 'scene' | 'output' };

export function anatomizePrompt(source: string): AnatomySegment[] {
  const parts = source.split(/((?:[,;:]\s+)|(?:[.!?]\s+)|\n+)/g).filter(Boolean);
  return parts.map((text) => {
    if (/^[,;:.!?\s]+$/.test(text)) return { text, category: 'intent' as const };
    const lower = text.toLowerCase();
    let best: AnatomySegment['category'] = 'intent';
    let score = 0;
    for (const [category,hints] of HINTS) {
      const hits = hints.reduce((sum,hint) => sum + (lower.includes(hint) ? 1 : 0),0);
      if (hits > score) { best = category; score = hits; }
    }
    return { text, category: best };
  });
}

export function auditDirectorPrompt(source: string, mode: DirectorMode = 'video') {
  const text = source.trim();
  const lower = text.toLowerCase();
  const issues: Array<{ id: string; label: string; suggestion: string }> = [];
  const strengths: string[] = [];
  let score = 24;
  if (text.length >= 100) { score += 10; strengths.push('Source intent sufficiently developed'); }
  else issues.push({ id:'specificity', label:'Idea poco específica', suggestion:'Añade sujeto, acción observable y mecanismo visual.' });
  if (/\b(move|walk|reach|turn|look|hold|sit|stand|pause|compare|mueve|camina|gira|mira|compara|pausa)\b/i.test(text)) { score += 9; strengths.push('Observable behavior'); }
  else issues.push({ id:'action', label:'Falta acción observable', suggestion:'Convierte emoción abstracta en comportamiento físico visible.' });
  const checks: Array<[string,RegExp,string,string,number]> = [
    ['camera',/large-format|super 35|full-frame|camera|sensor|cámara/i,'Cámara','Define el carácter de captura sólo si aporta.',5],
    ['lens',/\b\d{2,3}\s?mm\b|anamorphic|macro|telephoto/i,'Lente','Selecciona focal por perspectiva y función.',8],
    ['composition',/negative space|thirds|symmetr|composition|foreground|leading lines|composición/i,'Composición','Declara jerarquía y profundidad.',7],
    ['lighting',/light|lighting|key|fill|window|practical|shadow|luz|iluminación/i,'Iluminación','Declara fuente, dirección y calidad.',8],
    ['look',/film|grain|grade|halation|bloom|diffusion|look|grano/i,'Look','Define tratamiento sólo si cambia el acabado.',6],
  ];
  if (mode !== 'image') checks.push(['movement',/dolly|push|pull|pan|tilt|orbit|truck|handheld|crane|static|movimiento/i,'Movimiento','Define un movimiento primario y físicamente plausible.',7]);
  for (const [id,rx,label,suggestion,points] of checks) {
    if (rx.test(lower)) { score += points; strengths.push(label); }
    else issues.push({ id, label:`Falta ${label.toLowerCase()}`, suggestion });
  }
  if (/must not|avoid|constraint|no generic|preserve|lock|evita|conserva/i.test(lower)) { score += 8; strengths.push('Constraints'); }
  else issues.push({ id:'constraints', label:'Faltan constraints', suggestion:'Declara qué no debe cambiar y qué clichés evitar.' });
  if (/9:16|4:5|16:9|2\.39:1|output|duration|seconds|segundos|duración/i.test(lower)) { score += 8; strengths.push('Output contract'); }
  else issues.push({ id:'output', label:'Falta output contract', suggestion:'Define aspect y duración si aplica.' });
  score = Math.min(100, score);
  return { score, grade: score >= 92 ? 'A' : score >= 82 ? 'B' : score >= 68 ? 'C' : 'D', strengths, issues } as const;
}

export function recommendImprovement(source: string, mode: DirectorMode) {
  const recommended = recommendPresets(source, mode, 3);
  return {
    audit: auditDirectorPrompt(source, mode),
    presets: recommended,
    conservative: recommended[0] ? compileDirectorPrompt({ sourceText: source, mode, selections: recommended[0].values }).prompt : compileDirectorPrompt({ sourceText: source, mode, selections: {} }).prompt,
  };
}
