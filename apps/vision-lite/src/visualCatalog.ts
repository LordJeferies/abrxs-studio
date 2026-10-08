import type { Category } from './engine';

export type InfographicKind = 'framing' | 'fov' | 'depth' | 'angle' | 'light' | 'motion' | 'grade';

export type InfographicSpec = {
  kind: InfographicKind;
  value?: number;
  direction?: 'left' | 'right' | 'back' | 'top' | 'ambient' | 'static' | 'push' | 'truck' | 'handheld' | 'neutral' | 'cool' | 'warm' | 'noir';
  label: string;
};

export type VisualMeta = {
  image: string;
  imagePosition?: string;
  notice: string;
  cue: string;
  explanation: string;
  infographic: InfographicSpec;
};

const u = (id: string, crop = 'faces') => `https://images.unsplash.com/${id}?auto=format&fit=crop&crop=${crop}&w=1000&q=86`;
const p = (id: string) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop`;

export const GROUP_GUIDE: Record<Category, { question: string; help: string }> = {
  shot: {
    question: '¿Qué tan cerca debe sentirse el espectador?',
    help: 'El plano decide cuánto contexto conservas frente a cuánta intimidad ganas. Observa el tamaño del sujeto dentro del encuadre.'
  },
  lens: {
    question: '¿Qué relación espacial quieres entre sujeto y entorno?',
    help: 'La focal cambia campo de visión, compresión y sensación espacial. La mini-infografía muestra el cono de visión para que la diferencia sea inmediata.'
  },
  aperture: {
    question: '¿Cuánto del mundo debe permanecer legible?',
    help: 'La apertura cambia la profundidad de campo. La infografía marca cuánta zona permanece visualmente enfocada.'
  },
  angle: {
    question: '¿Desde qué relación quieres mirar al sujeto?',
    help: 'La altura y orientación de cámara cambian presencia, neutralidad, vulnerabilidad y lectura gráfica.'
  },
  light: {
    question: '¿Cómo debe sentirse la escena antes del color?',
    help: 'La dirección de la luz crea volumen, tensión y separación. La animación muestra de dónde entra la fuente principal.'
  },
  movement: {
    question: '¿La cámara debe observar o intervenir?',
    help: 'El movimiento debe aportar intención narrativa. La trayectoria animada muestra cómo se desplaza la cámara respecto del sujeto.'
  },
  look: {
    question: '¿Qué acabado debe unir todas las decisiones?',
    help: 'El look termina la imagen. La mini-infografía hace un barrido RAW → LOOK para mostrar el tipo de transformación tonal.'
  }
};

export const VISUAL_META: Record<Category, Record<string, VisualMeta>> = {
  shot: {
    wide: {
      image: u('photo-1524758631624-e2822e304c36', 'entropy'),
      imagePosition: 'center',
      notice: 'El sujeto ocupa poco cuadro y el espacio explica dónde ocurre la acción.',
      cue: 'Más contexto · menos intimidad',
      explanation: 'Úsalo cuando la arquitectura, el equipo o la distancia entre elementos también cuentan la historia.',
      infographic: { kind: 'framing', value: 10, label: 'Sujeto pequeño · entorno dominante' }
    },
    medium: {
      image: p('3769021'),
      imagePosition: 'center 30%',
      notice: 'Cabe torso, gesto y suficiente entorno para entender la situación.',
      cue: 'Persona + contexto en equilibrio',
      explanation: 'Es el punto medio más flexible para presentaciones, entrevistas y escenas de negocio.',
      infographic: { kind: 'framing', value: 18, label: 'Torso + entorno' }
    },
    mcu: {
      image: u('photo-1506794778202-cad84cf45f1d'),
      imagePosition: 'center 24%',
      notice: 'La cara gana prioridad, pero hombros y una parte del entorno siguen presentes.',
      cue: 'Cercanía controlada',
      explanation: 'Funciona cuando necesitas leer microexpresiones sin perder completamente el contexto.',
      infographic: { kind: 'framing', value: 25, label: 'Rostro dominante · contexto secundario' }
    },
    close: {
      image: u('photo-1534528741775-53994a69daeb'),
      imagePosition: 'center 18%',
      notice: 'El rostro llena el encuadre y casi toda la atención cae en ojos y expresión.',
      cue: 'Máxima intimidad · mínimo contexto',
      explanation: 'Úsalo para emoción, énfasis o momentos donde la reacción importa más que el espacio.',
      infographic: { kind: 'framing', value: 29, label: 'Rostro ocupa el cuadro' }
    }
  },
  lens: {
    '24': {
      image: u('photo-1497366754035-f200968a6e72', 'entropy'),
      notice: 'Observa foreground grande, líneas que se abren y sensación de espacio expandido.',
      cue: 'Campo amplio · profundidad marcada',
      explanation: '24 mm enfatiza distancia entre primer plano y fondo; es útil cuando quieres energía espacial.',
      infographic: { kind: 'fov', value: 82, label: 'Campo de visión muy amplio' }
    },
    '35': {
      image: u('photo-1517245386807-bb43f82c33c4', 'entropy'),
      notice: 'El entorno sigue muy presente, pero la perspectiva se siente menos extrema que en 24 mm.',
      cue: 'Contextual · natural',
      explanation: '35 mm suele funcionar para personas dentro de espacios reales porque conserva contexto sin exagerar tanto.',
      infographic: { kind: 'fov', value: 69, label: 'Campo amplio contextual' }
    },
    '50': {
      image: u('photo-1500648767791-00dcc994a43e'),
      notice: 'La relación entre cara y fondo se siente equilibrada, sin gran expansión ni compresión.',
      cue: 'Neutral · estable',
      explanation: '50 mm es un punto medio útil cuando no quieres que la focal sea protagonista.',
      infographic: { kind: 'fov', value: 55, label: 'Campo medio equilibrado' }
    },
    '65': {
      image: u('photo-1535713875002-d1d0cf377fde'),
      notice: 'El sujeto gana separación y el fondo empieza a sentirse visualmente más cercano y calmado.',
      cue: 'Íntimo · compresión moderada',
      explanation: '65 mm acerca la sensación de retrato sin llegar al aislamiento fuerte de un 85 mm.',
      infographic: { kind: 'fov', value: 45, label: 'Campo más cerrado' }
    },
    '85': {
      image: u('photo-1508214751196-bcfd4ca60f91'),
      notice: 'El fondo pierde protagonismo y el rostro queda claramente aislado.',
      cue: 'Retrato · compresión alta',
      explanation: '85 mm simplifica el fondo y suele favorecer retratos controlados y editoriales.',
      infographic: { kind: 'fov', value: 33, label: 'Campo estrecho · aislamiento' }
    },
    '135': {
      image: p('2379004'),
      imagePosition: 'center 24%',
      notice: 'El fondo parece acercarse al sujeto y la escena pierde sensación de profundidad expansiva.',
      cue: 'Telefoto · compresión fuerte',
      explanation: '135 mm prioriza aislamiento y compresión; requiere más distancia física entre cámara y sujeto.',
      infographic: { kind: 'fov', value: 22, label: 'Campo muy estrecho' }
    }
  },
  aperture: {
    '1.4': {
      image: u('photo-1517841905240-472988babdf9'),
      notice: 'El fondo se convierte en manchas suaves y casi deja de aportar información concreta.',
      cue: 'DOF mínima · aislamiento máximo',
      explanation: 'f/1.4 crea una zona de foco muy fina. La mirada va directamente al plano enfocado.',
      infographic: { kind: 'depth', value: 24, label: 'Zona enfocada muy fina' }
    },
    '2.8': {
      image: u('photo-1527980965255-d3b416303d12'),
      notice: 'El sujeto se separa claramente, aunque todavía puedes reconocer parte del ambiente.',
      cue: 'Selectiva · versátil',
      explanation: 'f/2.8 mantiene jerarquía visual fuerte sin borrar por completo el espacio.',
      infographic: { kind: 'depth', value: 39, label: 'Foco selectivo' }
    },
    '4': {
      image: u('photo-1519085360753-af0119f7cbe7'),
      notice: 'Más contexto alrededor del sujeto permanece comprensible y útil.',
      cue: 'Equilibrada · contexto protegido',
      explanation: 'f/4 da más margen de foco y suele ser una buena base para personas dentro de entornos profesionales.',
      infographic: { kind: 'depth', value: 58, label: 'Foco medio' }
    },
    '8': {
      image: u('photo-1497366811353-6870744d04b2', 'entropy'),
      notice: 'Primer plano, medio y fondo permanecen mucho más legibles al mismo tiempo.',
      cue: 'Profunda · información espacial',
      explanation: 'f/8 sirve cuando el espacio completo importa y no quieres que el fondo desaparezca.',
      infographic: { kind: 'depth', value: 82, label: 'Zona enfocada amplia' }
    }
  },
  angle: {
    low: {
      image: u('photo-1507679799987-c73779587ccf'),
      imagePosition: 'center 24%',
      notice: 'La cámara mira hacia arriba y el sujeto gana escala, presencia y autoridad.',
      cue: 'Presencia · poder',
      explanation: 'El low angle hace que el sujeto domine visualmente el espacio.',
      infographic: { kind: 'angle', value: -24, label: 'Cámara baja mirando arriba' }
    },
    eye: {
      image: u('photo-1507003211169-0a1dd7228f2d'),
      imagePosition: 'center 18%',
      notice: 'Los ojos quedan cerca de la altura de cámara y la relación se siente directa y humana.',
      cue: 'Neutral · humano',
      explanation: 'Eye level evita imponer una lectura psicológica fuerte y funciona como base natural.',
      infographic: { kind: 'angle', value: 0, label: 'Cámara a nivel de ojos' }
    },
    high: {
      image: u('photo-1524504388940-b1c1722653e1'),
      imagePosition: 'center 30%',
      notice: 'La cámara mira hacia abajo; el sujeto puede sentirse más observado o vulnerable.',
      cue: 'Observación · vulnerabilidad',
      explanation: 'El high angle reduce presencia y deja que el espacio pese más sobre el personaje.',
      infographic: { kind: 'angle', value: 24, label: 'Cámara alta mirando abajo' }
    },
    overhead: {
      image: u('photo-1516321318423-f06f85e504b3', 'entropy'),
      imagePosition: 'center',
      notice: 'La lectura se vuelve gráfica: posiciones, formas y relaciones pesan más que la expresión facial.',
      cue: 'Gráfico · estructural',
      explanation: 'Overhead convierte la escena en un mapa visual y funciona para mesas, procesos y composición geométrica.',
      infographic: { kind: 'angle', value: 88, label: 'Vista casi cenital' }
    }
  },
  light: {
    window: {
      image: u('photo-1544005313-94ddf0286df2'),
      notice: 'Un lado del rostro recibe una fuente amplia y las sombras caen de forma suave.',
      cue: 'Natural · suave',
      explanation: 'Una ventana grande crea transiciones agradables y una luz que se siente motivada por el espacio.',
      infographic: { kind: 'light', direction: 'left', label: 'Fuente grande desde un lado' }
    },
    rembrandt: {
      image: u('photo-1488426862026-3ee34a7d66df'),
      notice: 'El rostro tiene volumen: un lado está modelado y el opuesto conserva sombra controlada.',
      cue: 'Esculpida · cinematográfica',
      explanation: 'Rembrandt combina dirección lateral/alta con sombra suficiente para dar profundidad al rostro.',
      infographic: { kind: 'light', direction: 'left', label: 'Key lateral alta + sombra' }
    },
    split: {
      image: u('photo-1501196354995-efc7d9f0a5f7'),
      notice: 'La cara queda dividida visualmente entre luz y sombra, creando conflicto inmediato.',
      cue: 'Tensión · contraste',
      explanation: 'Split light hace que una mitad del rostro sea claramente más luminosa que la otra.',
      infographic: { kind: 'light', direction: 'right', label: 'Luz lateral casi a 90°' }
    },
    back: {
      image: p('614810'),
      imagePosition: 'center 25%',
      notice: 'La luz llega desde detrás y dibuja contorno, cabello o hombros contra el fondo.',
      cue: 'Separación · rim',
      explanation: 'El contraluz aumenta separación de planos; normalmente necesita control de exposición frontal.',
      infographic: { kind: 'light', direction: 'back', label: 'Fuente detrás del sujeto' }
    },
    overcast: {
      image: u('photo-1531123897727-8f129e1688ce'),
      notice: 'Las sombras son muy suaves y la escena se siente observacional, menos producida.',
      cue: 'Documental · uniforme',
      explanation: 'Un cielo cubierto actúa como una fuente enorme y reduce contraste duro en el rostro.',
      infographic: { kind: 'light', direction: 'ambient', label: 'Luz envolvente y difusa' }
    }
  },
  movement: {
    static: {
      image: p('220453'),
      imagePosition: 'center 20%',
      notice: 'La composición se percibe estable: el movimiento debe ocurrir dentro del cuadro, no desde la cámara.',
      cue: 'Autoridad · quietud',
      explanation: 'Locked-off comunica control, precisión y deja que la acción tenga todo el peso.',
      infographic: { kind: 'motion', direction: 'static', label: 'Cámara bloqueada' }
    },
    push: {
      image: u('photo-1485846234645-a62644f84728', 'entropy'),
      notice: 'Imagina que el cuadro se acerca progresivamente al sujeto y aumenta su importancia.',
      cue: 'Presión · acercamiento',
      explanation: 'Un push-in lento incrementa atención y tensión sin necesidad de cortar.',
      infographic: { kind: 'motion', direction: 'push', label: 'Avance hacia el sujeto' }
    },
    truck: {
      image: u('photo-1521737711867-e3b97375f902', 'entropy'),
      notice: 'El desplazamiento lateral cambia el fondo detrás del sujeto y revela relación con el espacio.',
      cue: 'Revelación · espacio',
      explanation: 'Truck mueve la cámara paralela a la escena; sirve para acompañar o revelar información lateral.',
      infographic: { kind: 'motion', direction: 'truck', label: 'Desplazamiento lateral' }
    },
    handheld: {
      image: p('1681010'),
      imagePosition: 'center 30%',
      notice: 'La imagen se siente más presente, humana e imperfecta, con microvariaciones de encuadre.',
      cue: 'Humano · observacional',
      explanation: 'Handheld controlado aporta inmediatez sin convertir la toma en caos.',
      infographic: { kind: 'motion', direction: 'handheld', label: 'Micro movimiento orgánico' }
    }
  },
  look: {
    neutral: {
      image: u('photo-1520813792240-56fc4a3765a7'),
      notice: 'Piel, blancos y materiales mantienen una respuesta equilibrada sin una dominante fuerte.',
      cue: 'Natural · flexible',
      explanation: 'Neutral cinema protege información y deja margen para adaptar la imagen después.',
      infographic: { kind: 'grade', direction: 'neutral', label: 'RAW → contraste cinematográfico suave' }
    },
    cool: {
      image: u('photo-1522071820081-009f0129c71c', 'entropy'),
      notice: 'Sombras y ambiente se desplazan hacia tonos fríos mientras la piel intenta mantenerse creíble.',
      cue: 'Frío · editorial',
      explanation: 'Cool editorial comunica precisión, distancia y modernidad.',
      infographic: { kind: 'grade', direction: 'cool', label: 'RAW → sombras frías' }
    },
    warm: {
      image: u('photo-1485230895905-ec40ba36b9bc'),
      notice: 'La escena gana temperatura en medios tonos y luces, produciendo una sensación más cercana.',
      cue: 'Cálido · humano',
      explanation: 'Warm documentary favorece cercanía y memoria sin necesitar un contraste extremo.',
      infographic: { kind: 'grade', direction: 'warm', label: 'RAW → medios tonos cálidos' }
    },
    noir: {
      image: p('91227'),
      imagePosition: 'center 18%',
      notice: 'Negros más densos, menos información ambiental y separación tonal más agresiva.',
      cue: 'Contraste · tensión',
      explanation: 'Modern noir aumenta dramatismo mediante negros, contraste y una paleta más contenida.',
      infographic: { kind: 'grade', direction: 'noir', label: 'RAW → negros densos + contraste' }
    }
  }
};

export function visualMeta(category: Category, optionId: string): VisualMeta {
  return VISUAL_META[category][optionId] ?? Object.values(VISUAL_META[category])[0];
}
