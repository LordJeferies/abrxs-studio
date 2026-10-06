import { Aperture, Camera, Lightbulb, Move3d, ScanEye, Sparkles } from 'lucide-react';
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
  { icon: '→', en: 'Tracking', es: 'Tracking', bodyEn: 'Camera follows lateral or forward subject motion. Use when the viewer should travel with the action.', bodyEs: 'La cámara acompaña el movimiento lateral o frontal del sujeto. Úsalo cuando el espectador debe viajar con la acción.' },
  { icon: '◎', en: 'Orbit', es: 'Órbita', bodyEn: 'Camera moves around the subject to add dimensionality. Strong for reveals and product/character hero moments.', bodyEs: 'La cámara rodea al sujeto para añadir dimensionalidad. Funciona en revelaciones y momentos hero de producto o personaje.' },
  { icon: '⇢', en: 'Dolly in', es: 'Dolly in', bodyEn: 'Camera physically moves closer, increasing emphasis and intimacy without changing lens perspective.', bodyEs: 'La cámara se acerca físicamente, aumentando énfasis e intimidad sin cambiar la perspectiva óptica.' },
  { icon: '≈', en: 'Handheld', es: 'Cámara en mano', bodyEn: 'Adds controlled human imperfection and documentary energy. Too much amplitude quickly feels cheap or unstable.', bodyEs: 'Añade imperfección humana controlada y energía documental. Demasiada amplitud se siente barata o inestable.' },
];

const apertureCards = [
  { value: 'f/1.4', en: 'Very shallow depth', es: 'Profundidad muy corta', bodyEn: 'Strong subject isolation; focus is fragile. Best when the face/hero detail must dominate.', bodyEs: 'Aísla mucho al sujeto; el foco es frágil. Útil cuando el rostro o detalle principal debe dominar.', blur: 10 },
  { value: 'f/2.8', en: 'Cinematic separation', es: 'Separación cinematográfica', bodyEn: 'Background stays soft but recognizable. A practical cinematic default for portraits and dialogue.', bodyEs: 'El fondo queda suave pero reconocible. Buen default cinematográfico para retratos y diálogo.', blur: 7 },
  { value: 'f/4', en: 'Balanced depth', es: 'Profundidad equilibrada', bodyEn: 'More environment remains legible. Useful for editorial, product and two-person coverage.', bodyEs: 'Más entorno permanece legible. Útil para editorial, producto y planos de dos personas.', blur: 4 },
  { value: 'f/8', en: 'Deep focus', es: 'Foco profundo', bodyEn: 'Foreground and background remain clearer. Useful when geography or graphic information matters.', bodyEs: 'Primer plano y fondo quedan más claros. Útil cuando importan la geografía o la información gráfica.', blur: 1 },
];

const angleCards = [
  { value: 'Eye level', en: 'Neutral relationship', es: 'Relación neutral', bodyEn: 'The viewer meets the subject as an equal. Strong default for credibility and conversation.', bodyEs: 'El espectador se encuentra con el sujeto como igual. Buen default para credibilidad y conversación.', tilt: 0, y: 48 },
  { value: 'Low angle', en: 'Power / scale', es: 'Poder / escala', bodyEn: 'Looking upward can increase authority, scale or threat. Keep it motivated, not automatically “epic”.', bodyEs: 'Mirar hacia arriba puede aumentar autoridad, escala o amenaza. Debe estar motivado, no ser “épico” por defecto.', tilt: -7, y: 64 },
  { value: 'High angle', en: 'Exposure / vulnerability', es: 'Exposición / vulnerabilidad', bodyEn: 'Looking down can reduce perceived power or reveal spatial relationships.', bodyEs: 'Mirar desde arriba puede reducir poder percibido o revelar relaciones espaciales.', tilt: 7, y: 30 },
  { value: 'Dutch angle', en: 'Instability', es: 'Inestabilidad', bodyEn: 'A tilted horizon signals imbalance or unease. Use sparingly or it becomes a gimmick.', bodyEs: 'Un horizonte inclinado comunica desequilibrio o tensión. Úsalo poco o se vuelve un truco.', tilt: 14, y: 48 },
];

const lightingCards = [
  { key: 'soft', en: 'Soft motivated key', es: 'Luz principal suave', bodyEn: 'Large source, gentle transitions and believable direction. Strong for interviews, editorial and premium education.', bodyEs: 'Fuente grande, transiciones suaves y dirección creíble. Funciona para entrevistas, editorial y educación premium.', contrast: .35, keyX: '24%' },
  { key: 'hard', en: 'Hard directional sun', es: 'Sol duro direccional', bodyEn: 'Defined shadows and graphic shape. Useful for tension, heat, architecture and strong visual statements.', bodyEs: 'Sombras definidas y forma gráfica. Útil para tensión, calor, arquitectura y declaraciones visuales fuertes.', contrast: .8, keyX: '18%' },
  { key: 'low', en: 'Low-key practical', es: 'Low-key con prácticas', bodyEn: 'Dark frame with motivated lamps/signs. Good for intimacy, suspense and late-night environments.', bodyEs: 'Cuadro oscuro con lámparas o luces prácticas motivadas. Bueno para intimidad, suspenso y noche.', contrast: .92, keyX: '72%' },
  { key: 'high', en: 'High-key commercial', es: 'High-key comercial', bodyEn: 'Low contrast and broad illumination. Useful for clarity, beauty, product and optimistic brand work.', bodyEs: 'Bajo contraste e iluminación amplia. Útil para claridad, belleza, producto y marcas optimistas.', contrast: .18, keyX: '50%' },
];

const recipes = [
  { en: 'Credible expert', es: 'Experto creíble', recipe: '50–85mm · medium close-up · eye level · soft motivated key · static / subtle push' },
  { en: 'Immediate social hook', es: 'Hook social inmediato', recipe: '24–35mm · close-up · slight low angle · decisive foreground · one controlled move' },
  { en: 'Emotional intimacy', es: 'Intimidad emocional', recipe: '85mm · close-up · eye level/profile · f/2–2.8 · slow push or locked frame' },
  { en: 'Clear explanation', es: 'Explicación clara', recipe: '35–50mm · medium · eye level · f/4 · readable environment · minimal camera motion' },
  { en: 'Premium product', es: 'Producto premium', recipe: '85–135mm · macro/close · low angle · controlled hard/soft edge light · orbit or slider' },
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
          <p>{es ? 'No necesitas saber cine para empezar. Estas referencias explican el efecto visual y narrativo de las decisiones más importantes y qué errores evitar.' : 'You do not need film-school vocabulary to begin. These references explain the visual and narrative effect of the most important decisions and what to avoid.'}</p>
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

      {!compact && <>
        <div className="cinema-guide-section">
          <div className="cinema-guide-title"><Aperture size={16}/><strong>{es ? 'Apertura / profundidad de campo' : 'Aperture / depth of field'}</strong><span>{es ? 'qué tan separado se siente el sujeto del fondo' : 'how isolated the subject feels from the background'}</span></div>
          <div className="aperture-reference-grid">
            {apertureCards.map((card) => <article className="aperture-card" key={card.value}><div className="aperture-visual"><div className="aperture-bg" style={{ filter: `blur(${card.blur}px)` }}/><div className="aperture-subject"/></div><strong>{card.value} · {es ? card.es : card.en}</strong><p>{es ? card.bodyEs : card.bodyEn}</p></article>)}
          </div>
        </div>

        <div className="cinema-guide-section">
          <div className="cinema-guide-title"><Camera size={16}/><strong>{es ? 'Ángulo de cámara' : 'Camera angle'}</strong><span>{es ? 'cómo cambia la relación de poder y estabilidad' : 'how power and stability change'}</span></div>
          <div className="angle-reference-grid">
            {angleCards.map((card) => <article className="angle-card" key={card.value}><div className="angle-visual"><i style={{ transform: `translateY(${card.y - 48}px) rotate(${card.tilt}deg)` }}/><b style={{ transform: `rotate(${card.tilt}deg)` }}/></div><strong>{card.value}</strong><span>{es ? card.es : card.en}</span><p>{es ? card.bodyEs : card.bodyEn}</p></article>)}
          </div>
        </div>

        <div className="cinema-guide-section">
          <div className="cinema-guide-title"><Lightbulb size={16}/><strong>{es ? 'Iluminación' : 'Lighting'}</strong><span>{es ? 'dirección, contraste y credibilidad física' : 'direction, contrast and physical credibility'}</span></div>
          <div className="lighting-reference-grid">
            {lightingCards.map((card) => <article className="lighting-card" key={card.key}><div className={`lighting-visual ${card.key}`}><span className="light-source" style={{ left: card.keyX }}/><div className="light-face" style={{ boxShadow: `inset -28px 0 30px rgba(0,0,0,${card.contrast})` }}/></div><strong>{es ? card.es : card.en}</strong><p>{es ? card.bodyEs : card.bodyEn}</p></article>)}
          </div>
        </div>

        <div className="cinema-guide-section cinema-recipes">
          <div className="cinema-guide-title"><Sparkles size={16}/><strong>{es ? 'Atajos de intención' : 'Intent recipes'}</strong><span>{es ? 'empieza por el efecto, no por la jerga' : 'start from the effect, not the jargon'}</span></div>
          <div className="cinema-recipe-grid">{recipes.map((recipe) => <article key={recipe.en}><strong>{es ? recipe.es : recipe.en}</strong><code>{recipe.recipe}</code></article>)}</div>
        </div>
      </>}
    </section>
  );
}
