export type TechnicalDirectorState = {
  cameraSystem?: string;
  aperture?: string;
  shutter?: string;
  frameRate?: string;
  whiteBalance?: string;
};

export type TechnicalOption = {
  id: string;
  label: string;
  short: string;
  effect: string;
  prompt: string;
};

export const CAMERA_SYSTEMS: TechnicalOption[] = [
  { id:'super35-digital', label:'Super 35 Digital', short:'Cine digital equilibrado', effect:'Profundidad y perspectiva familiares, buena base para narrativa y documental premium.', prompt:'Super 35 digital cinema capture, natural highlight roll-off and restrained digital sharpness' },
  { id:'large-format-digital', label:'Large Format Digital', short:'Separación + escala', effect:'Permite mayor sensación de profundidad y aislamiento con perspectiva limpia.', prompt:'large-format digital cinema capture, smooth tonal separation, natural large-format depth rendering' },
  { id:'35mm-film-camera', label:'35mm Film', short:'Textura fotoquímica', effect:'Introduce respuesta orgánica, roll-off y grano físicamente coherente.', prompt:'35mm motion-picture film capture, organic grain structure, gentle halation and soft highlight roll-off' },
  { id:'65mm-film-camera', label:'65mm / Large Format Film', short:'Escala + detalle', effect:'Sensación amplia, limpia y monumental sin verse clínica.', prompt:'65mm large-format film language, high spatial fidelity, refined grain and broad tonal latitude' },
  { id:'documentary-digital', label:'Documentary Digital', short:'Ligera y observacional', effect:'Prioriza presencia humana y espontaneidad por encima del acabado publicitario.', prompt:'lightweight documentary digital cinema capture, natural exposure response and observational immediacy' },
  { id:'vintage-digital', label:'Vintage Digital', short:'Digital temprano', effect:'Menor limpieza clínica, color y highlights con carácter más imperfecto.', prompt:'early-generation digital cinema character, restrained highlight clipping, subtle chroma texture and softer micro-contrast' },
];

export const APERTURES: TechnicalOption[] = [
  { id:'f1.4', label:'f/1.4', short:'Muy abierto', effect:'Aislamiento extremo; foco crítico y fondo muy suave.', prompt:'f/1.4 aperture with extremely shallow depth of field and a precise critical focus plane' },
  { id:'f2', label:'f/2', short:'Aislamiento fuerte', effect:'Separa claramente al sujeto manteniendo algo más de estabilidad de foco.', prompt:'f/2 aperture with strong optical separation and controlled shallow depth of field' },
  { id:'f2.8', label:'f/2.8', short:'Cine equilibrado', effect:'Separación visible sin destruir el contexto.', prompt:'f/2.8 aperture with balanced cinematic subject separation and readable environment' },
  { id:'f4', label:'f/4', short:'Contexto legible', effect:'Permite rostro/objeto y entorno suficientemente enfocados.', prompt:'f/4 aperture with moderate depth and reliable subject-plus-context readability' },
  { id:'f5.6', label:'f/5.6', short:'Profundidad útil', effect:'Adecuado para grupos, procesos y composición por capas.', prompt:'f/5.6 aperture with deeper focus and multiple useful spatial planes' },
  { id:'f8', label:'f/8', short:'Deep focus', effect:'Maximiza legibilidad espacial y reduce separación óptica.', prompt:'f/8 aperture with deep focus and strong environment readability' },
];

export const SHUTTERS: TechnicalOption[] = [
  { id:'180', label:'180°', short:'Movimiento natural', effect:'Motion blur cinematográfico estándar y familiar.', prompt:'180-degree shutter cadence with natural cinematic motion blur' },
  { id:'90', label:'90°', short:'Movimiento nítido', effect:'Menos blur; acción más seca, tensa y definida.', prompt:'90-degree shutter cadence with crisp reduced motion blur and heightened temporal tension' },
  { id:'270', label:'270°', short:'Movimiento suave', effect:'Más blur; sensación más fluida y ligeramente soñada.', prompt:'270-degree shutter cadence with smoother extended motion blur' },
  { id:'slow-drag', label:'Slow Shutter', short:'Arrastre expresivo', effect:'Trazas visibles y sensación subjetiva; úsalo con intención.', prompt:'intentional slow-shutter motion smear used selectively for expressive movement while preserving subject recognition' },
];

export const FRAME_RATES: TechnicalOption[] = [
  { id:'24fps', label:'24 fps', short:'Cadencia cine', effect:'Movimiento narrativo clásico.', prompt:'24 fps cinematic cadence' },
  { id:'30fps', label:'30 fps', short:'Más inmediato', effect:'Algo más directo y nítido; útil en contenido y documental.', prompt:'30 fps cadence with direct contemporary motion response' },
  { id:'48fps', label:'48 fps', short:'Movimiento limpio', effect:'Mayor claridad temporal sin entrar en slow motion fuerte.', prompt:'48 fps high-frame-rate capture with clean motion detail' },
  { id:'60fps', label:'60 fps', short:'Slow motion flexible', effect:'Permite ralentizar con detalle fluido.', prompt:'60 fps capture intended for controlled slow-motion playback' },
  { id:'120fps', label:'120 fps', short:'Slow motion extremo', effect:'Para acciones rápidas, partículas, líquidos y producto.', prompt:'120 fps high-speed capture for detailed slow motion, stable exposure and physically plausible motion' },
];

export const WHITE_BALANCE: TechnicalOption[] = [
  { id:'3200k', label:'3200K', short:'Tungsten', effect:'Base cálida/tungsteno; daylight tenderá a verse frío.', prompt:'3200K white balance with controlled tungsten-neutral response' },
  { id:'4300k', label:'4300K', short:'Mixed neutral', effect:'Equilibra fuentes cálidas y daylight mixto.', prompt:'4300K mixed-light white balance, preserving deliberate warm/cool separation' },
  { id:'5600k', label:'5600K', short:'Daylight', effect:'Base neutra para exterior y ventana daylight.', prompt:'5600K daylight white balance with natural skin neutrality' },
  { id:'mixed', label:'Mixed Color Temp', short:'Contraste de color', effect:'Conserva fuentes con temperaturas distintas como parte de la narrativa.', prompt:'intentional mixed color temperatures with motivated warm practicals and cooler ambient light' },
];

export function technicalPromptFragments(state: TechnicalDirectorState) {
  const pick = (items: TechnicalOption[], id?: string) => items.find((item) => item.id === id)?.prompt;
  return [
    pick(CAMERA_SYSTEMS, state.cameraSystem),
    pick(APERTURES, state.aperture),
    pick(SHUTTERS, state.shutter),
    pick(FRAME_RATES, state.frameRate),
    pick(WHITE_BALANCE, state.whiteBalance),
  ].filter(Boolean) as string[];
}
