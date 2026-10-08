import { useMemo, useState } from 'react';
import {
  Aperture, Camera, Check, ChevronLeft, ChevronRight, Copy, Eye, Film,
  Gauge, Layers3, Lightbulb, Move, PanelRightOpen, RotateCcw, Sparkles,
  Sun, WandSparkles, X
} from 'lucide-react';

type ViewMode = 'guided' | 'camera' | 'studio';
type PreviewMode = 'reference' | 'camera' | 'compare' | 'explain';
type Category = 'shot' | 'lens' | 'aperture' | 'angle' | 'light' | 'movement' | 'look';
type DirectionState = Record<Category, string>;

type Option = {
  id: string;
  label: string;
  sub: string;
  prompt: string;
  why: string;
  tradeoff: string;
  image?: string;
};

type Group = {
  id: Category;
  label: string;
  question: string;
  help: string;
  options: Option[];
};

type DirectionPreset = {
  id: string;
  name: string;
  description: string;
  selections: Partial<DirectionState>;
};

const images = {
  portrait: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1600&q=88',
  portrait2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=88',
  portrait3: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1600&q=88',
  office: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=88',
  cinema: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=88'
};

const GROUPS: Group[] = [
  {
    id: 'shot', label: 'Plano', question: '¿Qué tan cerca debe sentirse el espectador?',
    help: 'El plano decide intimidad frente a contexto.',
    options: [
      { id: 'wide', label: 'Wide', sub: 'Contexto primero', prompt: 'wide shot with clear environmental context', why: 'Explica dónde ocurre la acción.', tradeoff: 'Reduce intimidad.', image: images.office },
      { id: 'medium', label: 'Medium', sub: 'Equilibrado', prompt: 'balanced medium shot', why: 'Conserva cuerpo y entorno sin perder expresión.', tradeoff: 'Menos intensidad facial.', image: images.portrait },
      { id: 'mcu', label: 'Medium close', sub: 'Humano y cercano', prompt: 'medium close-up with readable expression', why: 'Acerca emoción sin destruir el contexto.', tradeoff: 'Oculta parte del entorno.', image: images.portrait2 },
      { id: 'close', label: 'Close-up', sub: 'Intimidad', prompt: 'intimate close-up portrait', why: 'Hace dominante el rostro.', tradeoff: 'Pierde información espacial.', image: images.portrait3 }
    ]
  },
  {
    id: 'lens', label: 'Lente', question: '¿Qué relación espacial quieres entre sujeto y mundo?',
    help: 'La focal controla campo de visión, compresión y sensación espacial.',
    options: [
      { id: '24', label: '24 mm', sub: 'Expansivo', prompt: '24mm wide-angle perspective with pronounced spatial depth', why: 'Hace visibles foreground y entorno.', tradeoff: 'Puede exagerar perspectiva.', image: images.office },
      { id: '35', label: '35 mm', sub: 'Natural con contexto', prompt: '35mm contextual perspective', why: 'Se siente cercano sin comprimir demasiado.', tradeoff: 'Aísla menos.', image: images.portrait },
      { id: '50', label: '50 mm', sub: 'Neutral', prompt: '50mm normal lens with balanced perspective', why: 'Punto medio estable para narrativa.', tradeoff: 'Menos carácter espacial.', image: images.portrait2 },
      { id: '65', label: '65 mm', sub: 'Íntimo equilibrado', prompt: '65mm short-telephoto perspective with gentle compression', why: 'Aísla el sujeto sin comprimir tanto como 85 mm.', tradeoff: 'Reduce algo de contexto frente a 50 mm.', image: images.portrait2 },
      { id: '85', label: '85 mm', sub: 'Comprimido e íntimo', prompt: '85mm portrait lens with compressed background', why: 'Aísla el sujeto y calma el fondo.', tradeoff: 'Reduce contexto.', image: images.portrait3 },
      { id: '135', label: '135 mm', sub: 'Telefoto', prompt: '135mm telephoto compression with strong isolation', why: 'Comprime planos de forma marcada.', tradeoff: 'Necesita más distancia.', image: images.cinema }
    ]
  },
  {
    id: 'aperture', label: 'Apertura', question: '¿Cuánto del mundo debe permanecer legible?',
    help: 'La apertura cambia la profundidad de campo y la jerarquía por planos.',
    options: [
      { id: '1.4', label: 'f/1.4', sub: 'DOF mínima', prompt: 'f/1.4 shallow depth of field', why: 'Aísla fuertemente.', tradeoff: 'Oculta evidencia de otros planos.' },
      { id: '2.8', label: 'f/2.8', sub: 'Selectiva', prompt: 'f/2.8 selective depth of field', why: 'Separa sin desaparecer el mundo.', tradeoff: 'Requiere foco preciso.' },
      { id: '4', label: 'f/4', sub: 'Equilibrada', prompt: 'f/4 balanced depth of field', why: 'Protege sujeto y contexto.', tradeoff: 'Menos separación.' },
      { id: '8', label: 'f/8', sub: 'Profunda', prompt: 'f/8 deep focus', why: 'Mantiene varios planos legibles.', tradeoff: 'Menos aislamiento.' }
    ]
  },
  {
    id: 'angle', label: 'Ángulo', question: '¿Desde qué relación de poder quieres mirar al sujeto?',
    help: 'La altura y el pitch cambian la lectura psicológica.',
    options: [
      { id: 'low', label: 'Low', sub: 'Presencia', prompt: 'low camera angle', why: 'Aumenta presencia y escala.', tradeoff: 'Puede sentirse dominante.' },
      { id: 'eye', label: 'Eye level', sub: 'Neutral humano', prompt: 'eye-level camera', why: 'Reduce comentario visual.', tradeoff: 'Menos dramatismo.' },
      { id: 'high', label: 'High', sub: 'Observación', prompt: 'high camera angle', why: 'Hace visible vulnerabilidad o contexto.', tradeoff: 'Reduce autoridad.' },
      { id: 'overhead', label: 'Overhead', sub: 'Gráfico', prompt: 'overhead camera', why: 'Prioriza estructura y relaciones.', tradeoff: 'Pierde conexión facial.' }
    ]
  },
  {
    id: 'light', label: 'Luz', question: '¿Cómo debe sentirse la escena antes de aplicar color?',
    help: 'La luz debe tener dirección, fuente y función narrativa.',
    options: [
      { id: 'window', label: 'Soft window', sub: 'Natural', prompt: 'large soft window key from camera left', why: 'Se siente motivada y humana.', tradeoff: 'Menos tensión.' },
      { id: 'rembrandt', label: 'Rembrandt', sub: 'Esculpida', prompt: 'soft Rembrandt key with controlled negative fill', why: 'Modela el rostro con volumen.', tradeoff: 'Más estilizada.' },
      { id: 'split', label: 'Split', sub: 'Tensión', prompt: 'dramatic split lighting across the face', why: 'Divide visualmente y crea conflicto.', tradeoff: 'Puede sentirse demasiado dramática.' },
      { id: 'back', label: 'Backlight', sub: 'Separación', prompt: 'motivated backlight with restrained rim', why: 'Separa silueta y profundidad.', tradeoff: 'Necesita exposición controlada.' },
      { id: 'overcast', label: 'Overcast', sub: 'Documental', prompt: 'soft overcast ambient light', why: 'Reduce teatralidad.', tradeoff: 'Menos modelado.' }
    ]
  },
  {
    id: 'movement', label: 'Movimiento', question: '¿La cámara debe observar o intervenir?',
    help: 'El movimiento tiene que aportar intención, no decoración.',
    options: [
      { id: 'static', label: 'Static', sub: 'Autoridad', prompt: 'locked-off camera', why: 'Deja que la acción cargue el peso.', tradeoff: 'Menos energía.' },
      { id: 'push', label: 'Slow push', sub: 'Presión', prompt: 'slow controlled push-in', why: 'Incrementa atención gradualmente.', tradeoff: 'Puede subrayar demasiado.' },
      { id: 'truck', label: 'Truck', sub: 'Revela espacio', prompt: 'slow lateral truck move', why: 'Conecta sujeto y entorno.', tradeoff: 'Puede distraer.' },
      { id: 'handheld', label: 'Handheld', sub: 'Observacional', prompt: 'restrained documentary handheld camera', why: 'Añade presencia humana.', tradeoff: 'Reduce pulcritud.' }
    ]
  },
  {
    id: 'look', label: 'Look', question: '¿Qué acabado debe unir todas las decisiones?',
    help: 'El look termina la imagen; no sustituye cámara ni iluminación.',
    options: [
      { id: 'neutral', label: 'Neutral cinema', sub: 'Natural', prompt: 'neutral cinematic color with realistic skin', why: 'Protege información y piel.', tradeoff: 'Menos estilización.' },
      { id: 'cool', label: 'Cool editorial', sub: 'Controlado', prompt: 'cool restrained editorial grade', why: 'Se siente preciso y moderno.', tradeoff: 'Puede enfriar piel.' },
      { id: 'warm', label: 'Warm documentary', sub: 'Humano', prompt: 'warm documentary color response', why: 'Añade cercanía.', tradeoff: 'Puede suavizar tensión.' },
      { id: 'noir', label: 'Modern noir', sub: 'Contrastado', prompt: 'modern noir contrast with protected skin detail', why: 'Aumenta separación y tensión.', tradeoff: 'Pierde neutralidad.' }
    ]
  }
];

const DEFAULTS: DirectionState = { shot: 'medium', lens: '50', aperture: '2.8', angle: 'eye', light: 'window', movement: 'static', look: 'neutral' };

const PRESETS: DirectionPreset[] = [
  { id: 'pressure', name: 'Controlled Pressure', description: 'Tensión ejecutiva contenida.', selections: { shot: 'mcu', lens: '65', aperture: '2.8', angle: 'eye', light: 'rembrandt', movement: 'push', look: 'cool' } },
  { id: 'observational', name: 'Observational', description: 'Realismo documental y espacio legible.', selections: { shot: 'medium', lens: '35', aperture: '4', angle: 'eye', light: 'overcast', movement: 'handheld', look: 'warm' } },
  { id: 'authority', name: 'Quiet Authority', description: 'Imagen estable, controlada y limpia.', selections: { shot: 'mcu', lens: '85', aperture: '4', angle: 'eye', light: 'window', movement: 'static', look: 'neutral' } }
];

function optionFor(category: Category, id: string) {
  const group = GROUPS.find(g => g.id === category)!;
  return group.options.find(o => o.id === id) ?? group.options[0];
}

function DirectionScene({ sel, compact = false }: { sel: DirectionState; compact?: boolean }) {
  const focal = Number(sel.lens) || 50;
  const aperture = Number(sel.aperture) || 2.8;
  const shotScale = ({ wide: .72, medium: 1, mcu: 1.22, close: 1.52 } as Record<string, number>)[sel.shot] ?? 1;
  const cameraDistance = Math.max(1.3, 4.8 * (focal / 50) / shotScale);
  const backgroundScale = Math.max(.48, Math.min(.92, cameraDistance / (cameraDistance + 4.5)));
  const blur = Math.max(0, Math.min(16, (focal / 50) * (2.8 / aperture) * 5.5));
  const horizon = ({ low: 390, eye: 310, high: 245, overhead: 178 } as Record<string, number>)[sel.angle] ?? 310;
  const lightX = ({ window: 220, rembrandt: 340, split: 760, back: 500, overcast: 500 } as Record<string, number>)[sel.light] ?? 220;
  const movement = sel.movement === 'push' ? 'PUSH' : sel.movement === 'truck' ? 'TRUCK' : sel.movement === 'handheld' ? 'HANDHELD' : 'LOCKED';
  const color = sel.look === 'cool' ? '#9cb8d8' : sel.look === 'warm' ? '#e8b98e' : sel.look === 'noir' ? '#e2e2e2' : '#c9d2dc';
  const key = `${focal}-${aperture}-${sel.angle}-${sel.light}-${sel.look}`;

  return <div className={compact ? 'scene compact' : 'scene'}>
    <svg viewBox="0 0 1000 620" role="img" aria-label="Camera simulation">
      <defs>
        <linearGradient id={`wall-${key}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#313946"/><stop offset="1" stopColor="#12161d"/></linearGradient>
        <radialGradient id={`light-${key}`} cx={`${lightX / 10}%`} cy="34%" r="48%"><stop offset="0" stopColor={color} stopOpacity={sel.light === 'overcast' ? .3 : .82}/><stop offset="1" stopColor={color} stopOpacity="0"/></radialGradient>
        <filter id={`bg-${key}`}><feGaussianBlur stdDeviation={blur}/></filter>
        <filter id={`shadow-${key}`}><feDropShadow dx="0" dy="18" stdDeviation="14" floodColor="#000" floodOpacity=".55"/></filter>
      </defs>
      <rect width="1000" height="620" fill="#080a0e"/>
      <rect width="1000" height={horizon + 120} fill={`url(#wall-${key})`}/>
      <path d={`M0 ${horizon + 82}H1000V620H0Z`} fill="#080a0e"/>
      {[70, 205, 345, 655, 795, 930].map(x => <line key={x} x1={x} y1="620" x2="500" y2={horizon + 82} stroke="#ffffff12"/>)}
      <g filter={`url(#bg-${key})`} transform={`translate(${500 - 310 * backgroundScale} ${horizon - 130}) scale(${backgroundScale})`}>
        <rect width="620" height="300" rx="24" fill="#1d2630" stroke="#ffffff18"/>
        <rect x="44" y="28" width="160" height="210" rx="8" fill="#7890a7" opacity=".4"/>
        <path d="M124 28v210M44 132h160" stroke="#dbe9f655" strokeWidth="4"/>
        <rect x="352" y="65" width="160" height="178" rx="12" fill="#10151c"/>
        <circle cx="430" cy="122" r="36" fill="#334455"/>
        <rect x="238" y="205" width="240" height="22" rx="8" fill="#443a34"/>
      </g>
      <g transform={`translate(500 400) scale(${shotScale})`} filter={`url(#shadow-${key})`}>
        <ellipse cx="0" cy="138" rx="90" ry="20" fill="#0008"/>
        <path d="M-54-36 Q0-79 54-36 L64 97 Q34 123 0 124 Q-34 123-64 97Z" fill="#343a44"/>
        <rect x="-16" y="-78" width="32" height="31" rx="12" fill="#a97964"/>
        <ellipse cx="0" cy="-112" rx="39" ry="47" fill="#b88770"/>
        <path d="M-36-128 Q0-160 36-128 Q18-164-8-163 Q-31-159-36-128Z" fill="#211c1c"/>
        <circle cx="-13" cy="-111" r="3" fill="#171719"/><circle cx="13" cy="-111" r="3" fill="#171719"/>
        <path d="M-12-92 Q0-85 12-92" fill="none" stroke="#5e4036" strokeWidth="2"/>
        <path d="M-48-28 Q-94 17-80 74" fill="none" stroke="#343a44" strokeWidth="23" strokeLinecap="round"/>
        <path d="M48-28 Q94 17 80 74" fill="none" stroke="#343a44" strokeWidth="23" strokeLinecap="round"/>
        <circle cx="-80" cy="75" r="11" fill="#b88770"/><circle cx="80" cy="75" r="11" fill="#b88770"/>
        <path d="M-31 96 L-38 214" stroke="#262b32" strokeWidth="31" strokeLinecap="round"/>
        <path d="M31 96 L38 214" stroke="#262b32" strokeWidth="31" strokeLinecap="round"/>
        <path d="M-53 217h38M18 217h39" stroke="#111319" strokeWidth="17" strokeLinecap="round"/>
      </g>
      <rect width="1000" height="620" fill={`url(#light-${key})`} style={{ mixBlendMode: 'screen' }}/>
      {sel.light === 'split' && <rect width="500" height="620" fill="#000" opacity=".36"/>}
      {sel.light === 'back' && <ellipse cx="500" cy="350" rx="124" ry="188" fill="none" stroke="#ffe0a988" strokeWidth="10"/>}
      {!compact && <g className="camera-hud">
        <rect x="22" y="22" width="520" height="54" rx="15"/>
        <text x="42" y="56">ALEXA 35 · {focal}MM · T{aperture} · 1/48 · ISO800 · 24FPS · {movement}</text>
        <rect x="752" y="22" width="226" height="54" rx="15"/>
        <text x="774" y="56">DIST {cameraDistance.toFixed(1)}M</text>
      </g>}
    </svg>
  </div>;
}

function PromptMonitor({ source, sel, close }: { source: string; sel: DirectionState; close: () => void }) {
  const camera = `${optionFor('shot', sel.shot).prompt}, ${optionFor('lens', sel.lens).prompt}, ${optionFor('angle', sel.angle).prompt}`;
  const optics = optionFor('aperture', sel.aperture).prompt;
  const light = optionFor('light', sel.light).prompt;
  const motion = optionFor('movement', sel.movement).prompt;
  const look = optionFor('look', sel.look).prompt;
  const full = `${source} ${camera}, ${optics}, ${light}, ${motion}, ${look}. Physically motivated lighting, coherent spatial relationships, realistic materials, preserve source truth, no decorative AI artifacts.`;
  return <aside className="prompt-monitor-v3">
    <header><div><span>PRODUCTION PROMPT</span><strong>Live Direction Compiler</strong></div><div><button onClick={() => navigator.clipboard?.writeText(full)}><Copy size={15}/></button><button onClick={close}><X size={15}/></button></div></header>
    <div className="prompt-sections">
      <section><b className="tone-source">SOURCE</b><p>{source}</p></section>
      <section><b className="tone-camera">CAMERA</b><p>{camera}</p></section>
      <section><b className="tone-optics">OPTICS</b><p>{optics}</p></section>
      <section><b className="tone-light">LIGHT</b><p>{light}</p></section>
      <section><b className="tone-motion">MOTION</b><p>{motion}</p></section>
      <section><b className="tone-look">LOOK</b><p>{look}</p></section>
      <section><b className="tone-output">CONSTRAINTS / OUTPUT</b><p>Physically coherent, realistic materials, preserve source truth, no decorative AI artifacts.</p></section>
    </div>
    <footer>{[['source','Source'],['camera','Camera'],['optics','Optics'],['light','Light'],['motion','Motion'],['look','Look']].map(([c,l]) => <span key={c}><i className={`legend ${c}`}/>{l}</span>)}</footer>
  </aside>;
}

export function App() {
  const [view, setView] = useState<ViewMode>('guided');
  const [preview, setPreview] = useState<PreviewMode>('camera');
  const [active, setActive] = useState(0);
  const [sel, setSel] = useState<DirectionState>(DEFAULTS);
  const [compare, setCompare] = useState<DirectionState>({ ...DEFAULTS, lens: '85', aperture: '4', light: 'rembrandt' });
  const [source, setSource] = useState('Una ejecutiva compara tres propuestas sobre la mesa. Duda antes de tomar una decisión. La escena debe sentirse contenida, profesional y real.');
  const [promptOpen, setPromptOpen] = useState(true);
  const [projectName, setProjectName] = useState('Executive Decision');
  const group = GROUPS[active];
  const current = optionFor(group.id, sel[group.id]);
  const cameraSummary = useMemo(() => `${sel.lens}mm · f/${sel.aperture} · ${optionFor('shot', sel.shot).label} · ${optionFor('light', sel.light).label}`, [sel]);

  const apply = (category: Category, id: string) => setSel(s => ({ ...s, [category]: id }));
  const applyPreset = (preset: DirectionPreset) => setSel(s => ({ ...s, ...preset.selections }));
  const reset = () => setSel(DEFAULTS);

  return <div className="vision-v3-app">
    <header className="v3-topbar">
      <div className="v3-brand"><span>V3</span><div><strong>Abrxs Vision</strong><small>Visual Direction Engine · Beta</small></div></div>
      <div className="project-pill"><Film size={14}/><input value={projectName} onChange={e => setProjectName(e.target.value)}/><em>Scene 01</em></div>
      <nav>{(['guided','camera','studio'] as ViewMode[]).map(mode => <button key={mode} onClick={() => setView(mode)} className={view === mode ? 'active' : ''}>{mode === 'guided' ? 'Guided' : mode === 'camera' ? 'Camera' : 'Studio'}</button>)}</nav>
      <button className="round-button" onClick={() => setPromptOpen(v => !v)}><PanelRightOpen size={16}/></button>
    </header>

    <main className={`v3-workspace ${view}`}>
      <aside className="v3-left">
        <div className="source-box"><label>SOURCE TRUTH</label><textarea value={source} onChange={e => setSource(e.target.value)}/></div>
        <div className="preset-block"><div className="section-label"><Sparkles size={13}/> Vision directions</div>{PRESETS.map(p => <button key={p.id} onClick={() => applyPreset(p)}><strong>{p.name}</strong><small>{p.description}</small></button>)}</div>
        <div className="category-list">{GROUPS.map((g, i) => <button key={g.id} className={i === active ? 'active' : ''} onClick={() => setActive(i)}><span>{String(i + 1).padStart(2,'0')}</span><div><strong>{g.label}</strong><small>{optionFor(g.id, sel[g.id]).label}</small></div><Check size={13}/></button>)}</div>
      </aside>

      <section className="v3-center">
        <div className="v3-stage-head">
          <div><span className="eyebrow">{view.toUpperCase()} · {String(active + 1).padStart(2,'0')}/{GROUPS.length}</span><h1>{view === 'guided' ? group.question : group.label}</h1><p>{group.help}</p></div>
          <div className="stage-actions"><button onClick={reset}><RotateCcw size={14}/> Reset</button><strong>{cameraSummary}</strong></div>
        </div>

        <div className="preview-mode-tabs">
          <button className={preview === 'camera' ? 'active' : ''} onClick={() => setPreview('camera')}><Camera size={14}/> Camera</button>
          <button className={preview === 'reference' ? 'active' : ''} onClick={() => setPreview('reference')}><Eye size={14}/> Reference</button>
          <button className={preview === 'compare' ? 'active' : ''} onClick={() => setPreview('compare')}><Layers3 size={14}/> Compare</button>
          <button className={preview === 'explain' ? 'active' : ''} onClick={() => setPreview('explain')}><Lightbulb size={14}/> Explain</button>
        </div>

        <div className="v3-stage">
          {preview === 'camera' && <DirectionScene sel={sel}/>} 
          {preview === 'reference' && <figure className="photo-reference-v3"><img src={current.image ?? images.portrait2} alt="Visual reference"/><div><span>PHOTO REFERENCE</span><strong>{current.label}</strong><small>Referencia creativa. Usa Camera para la comparación técnica.</small></div></figure>}
          {preview === 'compare' && <div className="compare-grid"><article><header><span>A · CURRENT</span><strong>{cameraSummary}</strong></header><DirectionScene sel={sel} compact/></article><article><header><span>B · COMPARE</span><strong>{compare.lens}mm · f/{compare.aperture}</strong></header><DirectionScene sel={compare} compact/></article></div>}
          {preview === 'explain' && <div className="explain-v3"><div className="explain-graphic"><Camera size={48}/><i/><b>SUBJECT</b><em>BACKGROUND</em></div><div><span className="eyebrow">WHAT CHANGES</span><h2>{current.label}</h2><p>{current.why}</p><hr/><span className="eyebrow">TRADEOFF</span><p>{current.tradeoff}</p></div></div>}
        </div>

        {view === 'guided' ? <div className="guided-options">
          {group.options.map(o => <button key={o.id} className={o.id === sel[group.id] ? 'active' : ''} onClick={() => apply(group.id, o.id)}>{o.image && <img src={o.image} alt=""/>}<span><strong>{o.label}</strong><small>{o.sub}</small></span>{o.id === sel[group.id] && <Check size={16}/>}</button>)}
        </div> : <div className="pro-controls">
          <div className="dial-strip">{group.options.map(o => <button key={o.id} className={o.id === sel[group.id] ? 'active' : ''} onClick={() => apply(group.id, o.id)}><strong>{o.label}</strong><small>{o.sub}</small></button>)}</div>
          {view === 'camera' && <div className="camera-console"><div><Gauge size={14}/><span>CAMERA</span><b>ALEXA 35 / S35</b></div><div><Aperture size={14}/><span>OPTICS</span><b>{sel.lens}mm · T{sel.aperture}</b></div><div><Sun size={14}/><span>LIGHT</span><b>{optionFor('light', sel.light).label}</b></div><div><Move size={14}/><span>MOTION</span><b>{optionFor('movement', sel.movement).label}</b></div></div>}
        </div>}

        <div className="decision-row"><article><span>WHY</span><p>{current.why}</p></article><article><span>TRADEOFF</span><p>{current.tradeoff}</p></article><article><span>PROMPT LANGUAGE</span><p>{current.prompt}</p></article></div>

        <div className="step-footer"><button disabled={active === 0} onClick={() => setActive(i => Math.max(0, i - 1))}><ChevronLeft size={15}/> Previous</button><div><small>{group.label}</small><strong>{current.label}</strong></div><button disabled={active === GROUPS.length - 1} onClick={() => setActive(i => Math.min(GROUPS.length - 1, i + 1))}>Next <ChevronRight size={15}/></button></div>
      </section>

      <aside className="v3-right">
        <div className="inspector-title"><span>CURRENT DIRECTION</span><strong>{current.label}</strong><small>{current.sub}</small></div>
        <DirectionScene sel={sel} compact/>
        <div className="spec-list"><div><span>Shot</span><b>{optionFor('shot', sel.shot).label}</b></div><div><span>Lens</span><b>{sel.lens} mm</b></div><div><span>Aperture</span><b>f/{sel.aperture}</b></div><div><span>Angle</span><b>{optionFor('angle', sel.angle).label}</b></div><div><span>Light</span><b>{optionFor('light', sel.light).label}</b></div><div><span>Motion</span><b>{optionFor('movement', sel.movement).label}</b></div><div><span>Look</span><b>{optionFor('look', sel.look).label}</b></div></div>
        <button className="prompt-cta" onClick={() => setPromptOpen(true)}><WandSparkles size={15}/> Open Prompt Monitor</button>
        <div className="compare-preset"><span>COMPARE WITH</span><button onClick={() => setCompare({ ...sel, lens: sel.lens === '85' ? '35' : '85' })}>Toggle 35 / 85 mm</button><button onClick={() => setCompare({ ...sel, aperture: sel.aperture === '1.4' ? '8' : '1.4' })}>Toggle f/1.4 / f/8</button></div>
      </aside>
    </main>

    {promptOpen && <PromptMonitor source={source} sel={sel} close={() => setPromptOpen(false)}/>} 
  </div>;
}
