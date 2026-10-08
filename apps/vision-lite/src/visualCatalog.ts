import type { Category } from './engine';

export type VisualMeta = {
  image: string;
  notice: string;
  cue: string;
};

const u = (id: string, crop = 'faces') => `https://images.unsplash.com/${id}?auto=format&fit=crop&crop=${crop}&w=900&q=82`;

export const GROUP_GUIDE: Record<Category, { question: string; help: string }> = {
  shot: {
    question: '¿Qué tan cerca debe sentirse el espectador?',
    help: 'El plano decide cuánto contexto conservas frente a cuánta intimidad ganas.'
  },
  lens: {
    question: '¿Qué relación espacial quieres entre sujeto y entorno?',
    help: 'La focal cambia campo de visión, sensación de profundidad y aislamiento.'
  },
  aperture: {
    question: '¿Cuánto del mundo debe permanecer legible?',
    help: 'La apertura cambia la profundidad de campo y cuánto compite el fondo con el sujeto.'
  },
  angle: {
    question: '¿Desde qué relación quieres mirar al sujeto?',
    help: 'La altura de cámara cambia presencia, neutralidad, vulnerabilidad y lectura gráfica.'
  },
  light: {
    question: '¿Cómo debe sentirse la escena antes del color?',
    help: 'La dirección y dureza de la luz crean volumen, tensión, naturalidad o separación.'
  },
  movement: {
    question: '¿La cámara debe observar o intervenir?',
    help: 'El movimiento debe aportar intención narrativa, no sólo energía visual.'
  },
  look: {
    question: '¿Qué acabado debe unir todas las decisiones?',
    help: 'El look termina la imagen; no sustituye cámara, óptica ni iluminación.'
  }
};

export const VISUAL_META: Record<Category, Record<string, VisualMeta>> = {
  shot: {
    wide: {
      image: u('photo-1497366811353-6870744d04b2', 'entropy'),
      notice: 'Mira cuánto entorno queda disponible alrededor del sujeto.',
      cue: 'Más contexto · menos intimidad'
    },
    medium: {
      image: u('photo-1519085360753-af0119f7cbe7'),
      notice: 'El cuerpo y el espacio siguen siendo legibles sin perder expresión.',
      cue: 'Balance entre persona y contexto'
    },
    mcu: {
      image: u('photo-1507003211169-0a1dd7228f2d'),
      notice: 'La expresión empieza a dominar, pero todavía existe información del entorno.',
      cue: 'Cercanía sin aislar por completo'
    },
    close: {
      image: u('photo-1494790108377-be9c29b29330'),
      notice: 'El rostro se convierte en la información principal de la imagen.',
      cue: 'Máxima intimidad · mínimo contexto'
    }
  },
  lens: {
    '24': {
      image: u('photo-1497366754035-f200968a6e72', 'entropy'),
      notice: 'Busca sensación de espacio expandido y foreground más presente.',
      cue: 'Expansivo · dinámico'
    },
    '35': {
      image: u('photo-1519085360753-af0119f7cbe7'),
      notice: 'Conserva contexto y una perspectiva que suele sentirse natural.',
      cue: 'Contextual · cercano'
    },
    '50': {
      image: u('photo-1500648767791-00dcc994a43e'),
      notice: 'Busca una relación equilibrada entre sujeto y fondo.',
      cue: 'Neutral · estable'
    },
    '65': {
      image: u('photo-1507003211169-0a1dd7228f2d'),
      notice: 'El fondo empieza a calmarse y el sujeto gana prioridad.',
      cue: 'Íntimo · compresión moderada'
    },
    '85': {
      image: u('photo-1494790108377-be9c29b29330'),
      notice: 'El sujeto se siente más aislado y el fondo menos dominante.',
      cue: 'Comprimido · retrato'
    },
    '135': {
      image: u('photo-1485846234645-a62644f84728', 'entropy'),
      notice: 'La sensación buscada es fuerte aislamiento y planos visualmente comprimidos.',
      cue: 'Telefoto · aislamiento fuerte'
    }
  },
  aperture: {
    '1.4': {
      image: u('photo-1494790108377-be9c29b29330'),
      notice: 'Fíjate en cómo el fondo deja de competir con el rostro.',
      cue: 'DOF mínima · aislamiento alto'
    },
    '2.8': {
      image: u('photo-1507003211169-0a1dd7228f2d'),
      notice: 'El sujeto sigue separado, pero el espacio conserva suficiente lectura.',
      cue: 'Selectiva · versátil'
    },
    '4': {
      image: u('photo-1519085360753-af0119f7cbe7'),
      notice: 'Más del entorno permanece comprensible alrededor del sujeto.',
      cue: 'Equilibrada · contexto protegido'
    },
    '8': {
      image: u('photo-1497366811353-6870744d04b2', 'entropy'),
      notice: 'La escena completa gana importancia y varios planos permanecen legibles.',
      cue: 'Profunda · información espacial'
    }
  },
  angle: {
    low: {
      image: u('photo-1519085360753-af0119f7cbe7'),
      notice: 'Busca una lectura de mayor presencia y autoridad del sujeto.',
      cue: 'Presencia · escala'
    },
    eye: {
      image: u('photo-1507003211169-0a1dd7228f2d'),
      notice: 'La cámara se siente humana y evita imponer una lectura fuerte.',
      cue: 'Neutral · humano'
    },
    high: {
      image: u('photo-1524504388940-b1c1722653e1'),
      notice: 'La mirada desde arriba reduce presencia y puede aumentar vulnerabilidad.',
      cue: 'Observación · vulnerabilidad'
    },
    overhead: {
      image: u('photo-1497366754035-f200968a6e72', 'entropy'),
      notice: 'Prioriza posiciones, patrones y relaciones por encima de la expresión facial.',
      cue: 'Gráfico · estructural'
    }
  },
  light: {
    window: {
      image: u('photo-1507003211169-0a1dd7228f2d'),
      notice: 'Busca transiciones suaves y una fuente que parezca motivada por el espacio.',
      cue: 'Natural · suave'
    },
    rembrandt: {
      image: u('photo-1500648767791-00dcc994a43e'),
      notice: 'Fíjate en el volumen del rostro y en la sombra controlada del lado opuesto.',
      cue: 'Esculpida · cinematográfica'
    },
    split: {
      image: u('photo-1494790108377-be9c29b29330'),
      notice: 'La división claro/oscuro crea conflicto y tensión inmediata.',
      cue: 'Tensión · contraste'
    },
    back: {
      image: u('photo-1485846234645-a62644f84728', 'entropy'),
      notice: 'Busca separación del contorno y profundidad entre sujeto y fondo.',
      cue: 'Separación · rim'
    },
    overcast: {
      image: u('photo-1524504388940-b1c1722653e1'),
      notice: 'La luz es más plana y observacional, con menos sensación de montaje.',
      cue: 'Documental · suave'
    }
  },
  movement: {
    static: {
      image: u('photo-1500648767791-00dcc994a43e'),
      notice: 'La composición permanece estable y la acción carga con toda la atención.',
      cue: 'Autoridad · quietud'
    },
    push: {
      image: u('photo-1485846234645-a62644f84728', 'entropy'),
      notice: 'La sensación buscada es acercamiento progresivo y aumento de atención.',
      cue: 'Presión · acercamiento'
    },
    truck: {
      image: u('photo-1497366811353-6870744d04b2', 'entropy'),
      notice: 'El desplazamiento lateral sirve para revelar relación entre sujeto y espacio.',
      cue: 'Revelación · espacio'
    },
    handheld: {
      image: u('photo-1524504388940-b1c1722653e1'),
      notice: 'La cámara se siente presente y ligeramente imperfecta, no totalmente pulida.',
      cue: 'Humano · observacional'
    }
  },
  look: {
    neutral: {
      image: u('photo-1507003211169-0a1dd7228f2d'),
      notice: 'Busca piel creíble, materiales honestos y contraste contenido.',
      cue: 'Natural · flexible'
    },
    cool: {
      image: u('photo-1497366811353-6870744d04b2', 'entropy'),
      notice: 'La sensación es más precisa, moderna y ligeramente distante.',
      cue: 'Frío · editorial'
    },
    warm: {
      image: u('photo-1494790108377-be9c29b29330'),
      notice: 'El acabado busca cercanía, humanidad y temperatura emocional.',
      cue: 'Cálido · humano'
    },
    noir: {
      image: u('photo-1485846234645-a62644f84728', 'entropy'),
      notice: 'Busca negros más presentes y separación tonal fuerte sin perder piel.',
      cue: 'Contraste · tensión'
    }
  }
};

export function visualMeta(category: Category, optionId: string): VisualMeta {
  return VISUAL_META[category][optionId] ?? Object.values(VISUAL_META[category])[0];
}
