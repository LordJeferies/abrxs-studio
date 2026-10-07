import { HelpCircle, Pause, Play, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';

type Props = { language: 'es' | 'en' };

type Lens = 24 | 35 | 50 | 85 | 135;
type Light = 'soft-side' | 'hard-side' | 'backlight' | 'top' | 'warm-practical';
type Move = 'static' | 'push' | 'truck' | 'orbit-lite';

const lensInfo: Record<Lens, { feelEs: string; feelEn: string; useEs: string; useEn: string; scale: number; bgScale: number; perspective: number }> = {
  24: { feelEs: 'Amplio · dinámico', feelEn: 'Wide · dynamic', useEs: 'Entorno, energía, proximidad espacial.', useEn: 'Environment, energy, spatial proximity.', scale: .76, bgScale: .9, perspective: -8 },
  35: { feelEs: 'Natural · contextual', feelEn: 'Natural · contextual', useEs: 'Diálogo, documental, sujeto + entorno.', useEn: 'Dialogue, documentary, subject + environment.', scale: .86, bgScale: .94, perspective: -4 },
  50: { feelEs: 'Neutral · equilibrado', feelEn: 'Neutral · balanced', useEs: 'Uso general, editorial, perspectiva estable.', useEn: 'General use, editorial, stable perspective.', scale: 1, bgScale: 1, perspective: 0 },
  85: { feelEs: 'Íntimo · comprimido', feelEn: 'Intimate · compressed', useEs: 'Retrato, reacción, emoción, separación.', useEn: 'Portrait, reaction, emotion, isolation.', scale: 1.14, bgScale: 1.08, perspective: 4 },
  135: { feelEs: 'Muy comprimido · aislado', feelEn: 'Highly compressed · isolated', useEs: 'Detalle emocional y fondos muy comprimidos.', useEn: 'Emotional detail and strongly compressed backgrounds.', scale: 1.24, bgScale: 1.15, perspective: 7 },
};

const lightInfo: Record<Light, { es: string; en: string; descEs: string; descEn: string }> = {
  'soft-side': { es: 'Lateral suave', en: 'Soft side', descEs: 'Gradiente amplio, piel/materiales suaves, separación controlada.', descEn: 'Broad gradient, soft skin/material response, controlled separation.' },
  'hard-side': { es: 'Lateral dura', en: 'Hard side', descEs: 'Sombras definidas y contraste; útil para tensión o gráfica fuerte.', descEn: 'Defined shadows and contrast; useful for tension or strong graphic shape.' },
  backlight: { es: 'Contraluz', en: 'Backlight', descEs: 'Separa silueta/fondo. Necesita suficiente exposición frontal para no perder identidad.', descEn: 'Separates silhouette/background. Needs enough front exposure to preserve identity.' },
  top: { es: 'Cenital', en: 'Top light', descEs: 'Esculpe superficies y puede endurecer ojos/rostro; mejor para objetos o tensión.', descEn: 'Sculpts surfaces and can deepen facial shadows; useful for objects or tension.' },
  'warm-practical': { es: 'Práctica cálida', en: 'Warm practical', descEs: 'Una lámpara visible motiva la luz y añade temperatura sin neón arbitrario.', descEn: 'A visible practical motivates the light and adds warmth without arbitrary neon.' },
};

const moveInfo: Record<Move, { es: string; en: string; descEs: string; descEn: string }> = {
  static: { es: 'Estática', en: 'Static', descEs: 'No añade énfasis temporal. Útil cuando la acción interna ya es suficiente.', descEn: 'Adds no temporal emphasis. Useful when internal action already carries the beat.' },
  push: { es: 'Push-in', en: 'Push-in', descEs: 'Acerca gradualmente la atención al sujeto/idea. Debe tener una razón narrativa.', descEn: 'Gradually focuses attention on the subject/idea. It should have a narrative reason.' },
  truck: { es: 'Truck', en: 'Truck', descEs: 'Desplaza cámara lateralmente y revela relación/espacio.', descEn: 'Moves the camera laterally and reveals relationships/space.' },
  'orbit-lite': { es: 'Orbit ligero', en: 'Light orbit', descEs: 'Sugiere volumen. Con una imagen 2D es sólo una demostración aproximada.', descEn: 'Suggests volume. With a 2D image this is only an approximate demonstration.' },
};

export function CinemaPlayground({ language }: Props) {
  const es = language === 'es';
  const [lens, setLens] = useState<Lens>(50);
  const [light, setLight] = useState<Light>('soft-side');
  const [move, setMove] = useState<Move>('static');
  const [playing, setPlaying] = useState(false);
  const [help, setHelp] = useState<'lens' | 'light' | 'move' | null>(null);
  const info = useMemo(() => lensInfo[lens], [lens]);

  return <section className="cinema-playground-v2">
    <div className="playground-head"><div><span className="micro">LEARN · CINEMA PLAYGROUND</span><h2>{es ? 'Misma escena. Decisiones diferentes.' : 'Same scene. Different decisions.'}</h2><p>{es ? 'Una referencia visual rápida para entender focal, luz y movimiento sin memorizar jerga. Las focales sobre una imagen 2D son una aproximación educativa, no una simulación óptica física.' : 'A quick visual reference for focal length, light and movement without memorizing jargon. Focal changes on one 2D image are an educational approximation, not a physical optical simulation.'}</p></div><button className="subtle-button" type="button" onClick={() => { setLens(50); setLight('soft-side'); setMove('static'); setPlaying(false); }}><RotateCcw size={14}/>{es ? 'Reset' : 'Reset'}</button></div>

    <div className="playground-layout">
      <div className="playground-viewer">
        <div className={`demo-frame light-${light} move-${move} ${playing ? 'playing' : ''}`}>
          <div className="demo-background" style={{ transform: `scale(${info.bgScale}) translateX(${info.perspective}px)` }}><span className="demo-window"/><span className="demo-lamp"/><span className="demo-wall-line"/></div>
          <div className="demo-table"/>
          <div className="demo-subject" style={{ transform: `translateX(-14%) scale(${info.scale})` }}><span className="demo-head"/><span className="demo-body"/></div>
          <div className="demo-cards"><span/><span/><span/><b/></div>
          <div className="demo-light-overlay"/>
          <div className="demo-safe-zone">TEXT SAFE</div>
        </div>
        <div className="viewer-meta"><strong>{lens}mm · {es ? lightInfo[light].es : lightInfo[light].en}</strong><span>{es ? moveInfo[move].es : moveInfo[move].en}</span></div>
        <button className="play-button" type="button" onClick={() => setPlaying((value) => !value)}>{playing ? <Pause size={16}/> : <Play size={16}/>} {playing ? (es ? 'Pausar movimiento' : 'Pause movement') : (es ? 'Ver movimiento' : 'Preview movement')}</button>
      </div>

      <aside className="playground-controls">
        <section><div className="control-title"><div><span className="micro">LENS</span><strong>{es ? 'Focal' : 'Focal length'}</strong></div><button type="button" onClick={() => setHelp(help === 'lens' ? null : 'lens')}><HelpCircle size={15}/></button></div><div className="visual-choice-row">{([24,35,50,85,135] as Lens[]).map((value) => <button type="button" className={lens === value ? 'active' : ''} key={value} onClick={() => setLens(value)}><span className={`lens-glyph lens-${value}`}/><strong>{value}mm</strong><small>{es ? lensInfo[value].feelEs : lensInfo[value].feelEn}</small></button>)}</div>{help === 'lens' && <div className="playground-help"><strong>{lens}mm · {es ? info.feelEs : info.feelEn}</strong><p>{es ? info.useEs : info.useEn}</p><code>{lens}mm {lens >= 85 ? 'portrait compression, strong subject isolation' : lens <= 35 ? 'environmental perspective, visible spatial context' : 'natural neutral perspective'}</code></div>}</section>

        <section><div className="control-title"><div><span className="micro">LIGHT</span><strong>{es ? 'Iluminación' : 'Lighting'}</strong></div><button type="button" onClick={() => setHelp(help === 'light' ? null : 'light')}><HelpCircle size={15}/></button></div><div className="light-choice-row">{(Object.keys(lightInfo) as Light[]).map((value) => <button type="button" className={light === value ? 'active' : ''} key={value} onClick={() => setLight(value)}><span className={`light-glyph light-glyph-${value}`}/><small>{es ? lightInfo[value].es : lightInfo[value].en}</small></button>)}</div>{help === 'light' && <div className="playground-help"><strong>{es ? lightInfo[light].es : lightInfo[light].en}</strong><p>{es ? lightInfo[light].descEs : lightInfo[light].descEn}</p></div>}</section>

        <section><div className="control-title"><div><span className="micro">MOTION</span><strong>{es ? 'Movimiento de cámara' : 'Camera movement'}</strong></div><button type="button" onClick={() => setHelp(help === 'move' ? null : 'move')}><HelpCircle size={15}/></button></div><div className="motion-choice-row">{(Object.keys(moveInfo) as Move[]).map((value) => <button type="button" className={move === value ? 'active' : ''} key={value} onClick={() => { setMove(value); setPlaying(value !== 'static'); }}><span className={`motion-glyph motion-${value}`}/><small>{es ? moveInfo[value].es : moveInfo[value].en}</small></button>)}</div>{help === 'move' && <div className="playground-help"><strong>{es ? moveInfo[move].es : moveInfo[move].en}</strong><p>{es ? moveInfo[move].descEs : moveInfo[move].descEn}</p></div>}</section>
      </aside>
    </div>
  </section>;
}
