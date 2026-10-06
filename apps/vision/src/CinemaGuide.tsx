import { Camera, Move3d, ScanEye, Sparkles } from 'lucide-react';
import { useVisionI18n } from './i18n';

const focalCards = [
  { value: '24mm', titleEn: 'Wide / immersive', titleEs: 'Amplio / inmersivo', bodyEn: 'Shows more environment and exaggerates perspective. Useful for geography, energy and close camera placement.', bodyEs: 'Muestra más entorno y exagera la perspectiva. Útil para geografía, energía y cámara cercana.' },
  { value: '35mm', titleEn: 'Natural wide', titleEs: 'Amplio natural', bodyEn: 'A versatile cinematic focal length for people inside environments without looking too distorted.', bodyEs: 'Focal cinematográfica versátil para personas dentro del entorno sin deformar demasiado.' },
  { value: '50mm', titleEn: 'Neutral / human', titleEs: 'Neutro / humano', bodyEn: 'Feels balanced and familiar. A strong default for interviews, narrative coverage and editorial portraits.', bodyEs: 'Se siente equilibrado y familiar. Buen punto de partida para entrevistas, narrativa y retratos editoriales.' },
  { value: '85mm', titleEn: 'Intimate / compressed', titleEs: 'Íntimo / comprimido', bodyEn: 'Separates subjects from the background and creates more visual intimacy with less perspective distortion.', bodyEs: 'Separa al sujeto del fondo y crea más intimidad visual con menos distorsión de perspectiva.' },
  { value: '135mm', titleEn: 'Strong compression', titleEs: 'Compresión fuerte', bodyEn: 'Flattens depth and isolates details. Useful for premium portraits, distant subjects and graphic layering.', bodyEs: 'Aplana la profundidad y aísla detalles. Útil para retratos premium, sujetos lejanos y composición gráfica.' },
];

const framingCards = [
  { key: 'Wide', en: 'Wide', es: 'Plano general', bodyEn: 'Establishes place, scale and relationships.', bodyEs: 'Establece lugar, escala y relaciones.', scale: .34 },
  { key: 'Full', en: 'Full', es: 'Plano entero', bodyEn: 'Shows the complete body and action.', bodyEs: 'Muestra el cuerpo completo y la acción.', scale: .48 },
  { key: 'Medium', en: 'Medium', es: 'Plano medio', bodyEn: 'Balances expression with body language.', bodyEs: 'Equilibra expresión y lenguaje corporal.', scale: .64 },
  { key: 'Close-up', en: 'Close-up', es: 'Primer plano', bodyEn: 'Prioritizes face, emotion and detail.', bodyEs: 'Prioriza rostro, emoción y detalle.', scale: .82 },
];

const movementCards = [
  { icon: '→', en: 'Tracking', es: 'Tracking', bodyEn: 'Camera follows lateral or forward subject motion.', bodyEs: 'La cámara acompaña el movimiento lateral o frontal del sujeto.' },
  { icon: '◎', en: 'Orbit', es: 'Órbita', bodyEn: 'Camera moves around the subject to add dimensionality.', bodyEs: 'La cámara rodea al sujeto para añadir dimensionalidad.' },
  { icon: '⇢', en: 'Dolly in', es: 'Dolly in', bodyEn: 'Camera physically moves closer, increasing emphasis and intimacy.', bodyEs: 'La cámara se acerca físicamente, aumentando énfasis e intimidad.' },
  { icon: '≈', en: 'Handheld', es: 'Cámara en mano', bodyEn: 'Adds controlled human imperfection and documentary energy.', bodyEs: 'Añade imperfección humana controlada y energía documental.' },
];

export function CinemaGuide({ compact = false }: { compact?: boolean }) {
  const { language } = useVisionI18n();
  const es = language === 'es';

  return (
    <section className={compact ? 'cinema-guide compact' : 'cinema-guide'}>
      <div className="cinema-guide-head">
        <div>
          <span className="micro">{es ? 'GUÍA VISUAL DE CINE' : 'VISUAL CINEMA GUIDE'}</span>
          <h2>{es ? 'Qué cambia realmente cuando eliges cada control' : 'What actually changes when you choose each control'}</h2>
          <p>{es ? 'No necesitas saber cine para empezar. Estas referencias explican el efecto visual y narrativo de las decisiones más importantes.' : 'You do not need film-school vocabulary to begin. These references explain the visual and narrative effect of the most important decisions.'}</p>
        </div>
        <div className="cinema-guide-badge"><Sparkles size={15}/>{es ? 'Aprender mientras diriges' : 'Learn while directing'}</div>
      </div>

      <div className="cinema-guide-section">
        <div className="cinema-guide-title"><Camera size={16}/><strong>{es ? 'Distancia focal' : 'Focal length'}</strong><span>{es ? 'cuánto entorno ves y cómo se comprime la profundidad' : 'how much environment you see and how depth feels compressed'}</span></div>
        <div className="focal-reference-strip">
          {focalCards.map((card) => <article key={card.value} className="cinema-reference-card"><div className="lens-orb"><span>{card.value}</span></div><strong>{es ? card.titleEs : card.titleEn}</strong><p>{es ? card.bodyEs : card.bodyEn}</p></article>)}
        </div>
      </div>

      <div className="cinema-guide-section">
        <div className="cinema-guide-title"><ScanEye size={16}/><strong>{es ? 'Encuadre' : 'Framing'}</strong><span>{es ? 'cuánta información recibe el espectador' : 'how much information the viewer receives'}</span></div>
        <div className="framing-reference-grid">
          {framingCards.map((card) => <article key={card.key} className="frame-reference-card"><div className="frame-reference-visual"><div className="frame-person" style={{ transform: `scale(${card.scale})` }}><i/><b/></div><span>16:9</span></div><strong>{es ? card.es : card.en}</strong><p>{es ? card.bodyEs : card.bodyEn}</p></article>)}
        </div>
      </div>

      <div className="cinema-guide-section">
        <div className="cinema-guide-title"><Move3d size={16}/><strong>{es ? 'Movimiento de cámara' : 'Camera movement'}</strong><span>{es ? 'cómo cambia la energía del plano' : 'how the energy of the shot changes'}</span></div>
        <div className="movement-reference-grid">
          {movementCards.map((card) => <article key={card.en} className="movement-reference-card"><div className="movement-symbol">{card.icon}</div><div><strong>{es ? card.es : card.en}</strong><p>{es ? card.bodyEs : card.bodyEn}</p></div></article>)}
        </div>
      </div>
    </section>
  );
}
