import { useMemo, useState } from 'react';
import { Aperture, Camera, Check, ChevronLeft, ChevronRight, CircleHelp, Copy, Eye, Menu, Move, Sparkles, Sun, X } from 'lucide-react';

type ViewMode = 'guided'|'camera'|'studio';
type PreviewMode = 'reference'|'camera'|'explain';
type Category = 'shot'|'lens'|'aperture'|'angle'|'light'|'movement'|'look';

type Option = { id:string; label:string; sub:string; prompt:string; photo?:string };

type Group = { id:Category; label:string; help:string; options:Option[] };

const portraitA='https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1400&q=86';
const portraitB='https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1400&q=86';
const portraitC='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1400&q=86';
const office='https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=86';
const cinematic='https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1400&q=86';

const GROUPS:Group[]=[
  {id:'shot',label:'Plano',help:'Decide cuánto contexto conserva la imagen.',options:[
    {id:'wide',label:'Wide',sub:'Contexto primero',prompt:'wide shot with clear environmental context',photo:office},
    {id:'medium',label:'Medium',sub:'Equilibrado',prompt:'balanced medium shot',photo:portraitA},
    {id:'mcu',label:'Medium close',sub:'Humano y cercano',prompt:'medium close-up with readable expression',photo:portraitC},
    {id:'close',label:'Close-up',sub:'Intimidad',prompt:'intimate close-up portrait',photo:portraitB}]},
  {id:'lens',label:'Lente',help:'Controla perspectiva, espacio y aislamiento.',options:[
    {id:'24',label:'24 mm',sub:'Expansivo',prompt:'24mm wide-angle perspective, pronounced spatial depth',photo:office},
    {id:'35',label:'35 mm',sub:'Natural con contexto',prompt:'35mm lens, natural contextual perspective',photo:portraitA},
    {id:'50',label:'50 mm',sub:'Neutral',prompt:'50mm normal lens, balanced perspective',photo:portraitC},
    {id:'85',label:'85 mm',sub:'Comprimido e íntimo',prompt:'85mm portrait lens, compressed background and subject isolation',photo:portraitB},
    {id:'135',label:'135 mm',sub:'Muy comprimido',prompt:'135mm telephoto compression, strongly isolated subject',photo:cinematic}]},
  {id:'aperture',label:'Apertura',help:'Decide cuántos planos permanecen legibles.',options:[
    {id:'1.4',label:'f/1.4',sub:'DOF mínima',prompt:'f/1.4 shallow depth of field'},
    {id:'2.8',label:'f/2.8',sub:'Separación controlada',prompt:'f/2.8 selective depth of field'},
    {id:'4',label:'f/4',sub:'Equilibrada',prompt:'f/4 balanced depth of field'},
    {id:'8',label:'f/8',sub:'Profunda',prompt:'f/8 deep focus with readable environment'}]},
  {id:'angle',label:'Ángulo',help:'Cambia la relación psicológica y espacial.',options:[
    {id:'low',label:'Low',sub:'Presencia / poder',prompt:'low camera angle'},
    {id:'eye',label:'Eye level',sub:'Neutral humano',prompt:'eye-level camera'},
    {id:'high',label:'High',sub:'Fragilidad / observación',prompt:'high camera angle'},
    {id:'overhead',label:'Overhead',sub:'Gráfico / espacial',prompt:'overhead camera'}]},
  {id:'light',label:'Luz',help:'Define dirección, contraste y lectura emocional.',options:[
    {id:'window',label:'Soft window',sub:'Natural',prompt:'large soft window key from camera left'},
    {id:'rembrandt',label:'Rembrandt',sub:'Esculpida',prompt:'soft Rembrandt key with controlled negative fill'},
    {id:'split',label:'Split',sub:'Tensión',prompt:'dramatic split lighting across the face'},
    {id:'back',label:'Backlight',sub:'Separación',prompt:'motivated backlight with restrained rim'},
    {id:'overcast',label:'Overcast',sub:'Documental',prompt:'soft overcast ambient light'}]},
  {id:'movement',label:'Movimiento',help:'Sólo añade movimiento cuando cambia la intención.',options:[
    {id:'static',label:'Static',sub:'Autoridad',prompt:'locked-off camera'},
    {id:'push',label:'Slow push',sub:'Presión creciente',prompt:'slow controlled push-in'},
    {id:'truck',label:'Truck',sub:'Revela espacio',prompt:'slow lateral truck move'},
    {id:'handheld',label:'Handheld',sub:'Observacional',prompt:'restrained documentary handheld camera'}]},
  {id:'look',label:'Look',help:'El acabado no debe reemplazar cámara y luz.',options:[
    {id:'neutral',label:'Neutral cinema',sub:'Natural',prompt:'neutral cinematic color, realistic skin'},
    {id:'cool',label:'Cool editorial',sub:'Controlado',prompt:'cool restrained editorial grade'},
    {id:'warm',label:'Warm documentary',sub:'Humano',prompt:'warm documentary color response'},
    {id:'noir',label:'Modern noir',sub:'Contrastado',prompt:'modern noir contrast with protected skin detail'}]},
];

const defaults:Record<Category,string>={shot:'medium',lens:'50',aperture:'2.8',angle:'eye',light:'window',movement:'static',look:'neutral'};

function pick(group:Group,id:string){return group.options.find(o=>o.id===id)??group.options[0]}

function CameraScene({sel}:{sel:Record<Category,string>}){
  const focal=Number(sel.lens); const aperture=Number(sel.aperture);
  const shotScale={wide:.72,medium:1,mcu:1.22,close:1.5}[sel.shot]??1;
  const distance=Math.max(1.7,4.7*(focal/50)/shotScale);
  const bgScale=Math.max(.42,Math.min(.86,distance/(distance+5.4)));
  const blur=Math.max(0,Math.min(12,(focal/50)*(2.8/aperture)*5.5));
  const horizon={low:360,eye:300,high:245,overhead:180}[sel.angle]??300;
  const lightX={window:250,rembrandt:360,split:690,back:500,overcast:500}[sel.light]??250;
  const subjectScale=shotScale;
  return <div className="camera-scene">
    <svg viewBox="0 0 1000 620" role="img" aria-label="Simulación técnica de cámara">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#303540"/><stop offset="1" stopColor="#11141a"/></linearGradient>
        <radialGradient id="light" cx={`${lightX/10}%`} cy="34%" r="45%"><stop offset="0" stopColor="#ffe8c5" stopOpacity={sel.light==='overcast'?.36:.8}/><stop offset="1" stopColor="#ffe8c5" stopOpacity="0"/></radialGradient>
        <filter id="bgblur"><feGaussianBlur stdDeviation={blur}/></filter>
        <filter id="shadow"><feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#000" floodOpacity=".55"/></filter>
      </defs>
      <rect width="1000" height="620" fill="#080a0e"/>
      <rect width="1000" height={horizon+110} fill="url(#wall)"/>
      <path d={`M0 ${horizon+85}H1000V620H0Z`} fill="#090b0f"/>
      {[80,210,350,650,790,920].map(x=><line key={x} x1={x} y1="620" x2="500" y2={horizon+85} stroke="#ffffff12"/>)}
      <g filter="url(#bgblur)" transform={`translate(${500-280*bgScale} ${horizon-110}) scale(${bgScale})`}>
        <rect width="560" height="290" rx="22" fill="#1e2630" stroke="#ffffff18"/>
        <rect x="42" y="34" width="150" height="198" rx="8" fill="#7890a7" opacity=".42"/>
        <path d="M117 34v198M42 132h150" stroke="#dbe9f655" strokeWidth="4"/>
        <rect x="350" y="58" width="132" height="176" rx="10" fill="#12171e"/>
        <circle cx="416" cy="112" r="34" fill="#314252"/>
      </g>
      <g transform={`translate(500 415) scale(${subjectScale})`} filter="url(#shadow)">
        <ellipse cx="0" cy="118" rx="84" ry="18" fill="#0008"/>
        <path d="M-45-48 Q0-78 45-48 L58 88 Q28 113 0 111 Q-28 113-58 88Z" fill="#343a44"/>
        <rect x="-15" y="-78" width="30" height="29" rx="11" fill="#a67b66"/>
        <ellipse cx="0" cy="-111" rx="37" ry="45" fill="#b88770"/>
        <path d="M-34-125 Q0-158 34-125 Q22-158-4-158 Q-29-156-34-125Z" fill="#201b1b"/>
        <circle cx="-12" cy="-110" r="3" fill="#171719"/><circle cx="12" cy="-110" r="3" fill="#171719"/>
        <path d="M-11-92 Q0-86 11-92" fill="none" stroke="#5e4036" strokeWidth="2"/>
        <path d="M-48-33 Q-88 10-77 66" fill="none" stroke="#343a44" strokeWidth="22" strokeLinecap="round"/>
        <path d="M48-33 Q88 10 77 66" fill="none" stroke="#343a44" strokeWidth="22" strokeLinecap="round"/>
        <circle cx="-77" cy="68" r="11" fill="#b88770"/><circle cx="77" cy="68" r="11" fill="#b88770"/>
        <path d="M-31 90 L-38 202" stroke="#262b32" strokeWidth="30" strokeLinecap="round"/>
        <path d="M31 90 L38 202" stroke="#262b32" strokeWidth="30" strokeLinecap="round"/>
        <path d="M-52 207h36" stroke="#111319" strokeWidth="16" strokeLinecap="round"/><path d="M18 207h38" stroke="#111319" strokeWidth="16" strokeLinecap="round"/>
      </g>
      <rect width="1000" height="620" fill="url(#light)" style={{mixBlendMode:'screen'}}/>
      {sel.light==='split'&&<rect width="500" height="620" fill="#000" opacity=".34"/>}
      {sel.light==='back'&&<ellipse cx="500" cy="350" rx="118" ry="178" fill="none" stroke="#ffe2a988" strokeWidth="10"/>}
      <g className="hud"><rect x="24" y="24" width="390" height="46" rx="14"/><text x="42" y="53">{focal}mm   f/{aperture}   DIST {distance.toFixed(1)}m</text></g>
    </svg>
  </div>
}

function ReferencePhoto({option}:{option:Option}){
  const src=option.photo??portraitA;
  return <figure className="reference-photo"><img src={src} alt="Referencia fotográfica"/><figcaption><span>PHOTO REFERENCE</span><strong>{option.label}</strong><small>Referencia visual · no medición óptica</small></figcaption></figure>
}

function ExplainView({category,option}:{category:Group;option:Option}){
  return <div className="explain-view"><div className="explain-diagram"><Camera size={42}/><div className="ray r1"/><div className="ray r2"/><div className="subject-mark">PERSON</div><div className="plane p1">FG</div><div className="plane p2">BG</div></div><div><span className="eyebrow">WHAT CHANGES</span><h3>{option.label}</h3><p>{category.help}</p><p>{option.sub}. Vision traduce esta decisión a lenguaje de producción en el prompt.</p></div></div>
}

export function App(){
  const [view,setView]=useState<ViewMode>('guided');
  const [preview,setPreview]=useState<PreviewMode>('camera');
  const [active,setActive]=useState(0);
  const [sel,setSel]=useState<Record<Category,string>>(defaults);
  const [source,setSource]=useState('Una ejecutiva compara tres propuestas sobre la mesa. Duda antes de tomar una decisión. La escena debe sentirse contenida, profesional y real.');
  const [promptOpen,setPromptOpen]=useState(true);
  const [dock,setDock]=useState<'float'|'bottom'>('float');
  const group=GROUPS[active]; const option=pick(group,sel[group.id]);
  const prompt=useMemo(()=>{
    const parts=GROUPS.map(g=>pick(g,sel[g.id]).prompt);
    return `${source.trim()} ${parts.join(', ')}. Physically motivated lighting, coherent spatial relationships, realistic materials, cinematic but restrained finish, preserve source truth and avoid decorative AI artifacts.`;
  },[source,sel]);
  const apply=(g:Group,id:string)=>setSel(s=>({...s,[g.id]:id}));
  const copy=()=>navigator.clipboard?.writeText(prompt);
  return <div className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">V3</span><div><strong>Abrxs Vision</strong><small>Visual Direction Engine</small></div></div><nav className="view-tabs">{(['guided','camera','studio'] as ViewMode[]).map(v=><button key={v} className={view===v?'active':''} onClick={()=>setView(v)}>{v==='guided'?'Guided':v==='camera'?'Camera':'Studio'}</button>)}</nav><button className="icon-btn mobile-menu"><Menu size={17}/></button></header>

    <main className={`workspace ${view}`}>
      <aside className="left-panel">
        <div className="panel-title"><span className="eyebrow">DIRECTION</span><strong>{view==='guided'?'Paso a paso':view==='camera'?'Camera setup':'Studio controls'}</strong></div>
        <div className="source-compact"><label>Source truth</label><textarea value={source} onChange={e=>setSource(e.target.value)}/></div>
        <div className="step-list">{GROUPS.map((g,i)=><button key={g.id} className={active===i?'active':''} onClick={()=>setActive(i)}><span>{String(i+1).padStart(2,'0')}</span><div><strong>{g.label}</strong><small>{pick(g,sel[g.id]).label}</small></div>{sel[g.id]&&<Check size={14}/>}</button>)}</div>
      </aside>

      <section className="canvas">
        <div className="canvas-head"><div><span className="eyebrow">{String(active+1).padStart(2,'0')} / {GROUPS.length}</span><h1>{group.label}</h1><p>{group.help}</p></div><div className="preview-tabs"><button className={preview==='reference'?'active':''} onClick={()=>setPreview('reference')}><Eye size={15}/>Reference</button><button className={preview==='camera'?'active':''} onClick={()=>setPreview('camera')}><Camera size={15}/>Camera</button><button className={preview==='explain'?'active':''} onClick={()=>setPreview('explain')}><CircleHelp size={15}/>Explain</button></div></div>

        <div className="hero-stage">{preview==='camera'?<CameraScene sel={sel}/>:preview==='reference'?<ReferencePhoto option={option}/>:<ExplainView category={group} option={option}/>}</div>

        <div className="choice-head"><div><span className="eyebrow">SELECT</span><strong>{option.label}</strong><small>{option.sub}</small></div><div className="recommend"><Sparkles size={14}/><span>Vision sugiere comparar antes de fijar.</span></div></div>
        <div className="option-strip">{group.options.map(o=><button key={o.id} className={sel[group.id]===o.id?'active':''} onClick={()=>apply(group,o.id)}>{o.photo?<img src={o.photo} alt=""/>:<div className="mini-scene"><span>{o.label}</span></div>}<div><strong>{o.label}</strong><small>{o.sub}</small></div>{sel[group.id]===o.id&&<i><Check size={13}/></i>}</button>)}</div>
        <div className="decision-grid"><article><span>WHAT IT DOES</span><p>{group.help}</p></article><article><span>FEEL</span><p>{option.sub}</p></article><article><span>PROMPT LANGUAGE</span><p>{option.prompt}</p></article></div>
        <div className="step-nav"><button disabled={active===0} onClick={()=>setActive(x=>x-1)}><ChevronLeft size={15}/>Anterior</button><div><span>Current direction</span><strong>{GROUPS.map(g=>pick(g,sel[g.id]).label).slice(0,4).join(' · ')}</strong></div><button disabled={active===GROUPS.length-1} onClick={()=>setActive(x=>x+1)}>Siguiente<ChevronRight size={15}/></button></div>
      </section>

      <aside className="right-panel"><div className="inspector-card"><span className="eyebrow">CURRENT</span><h2>{option.label}</h2><p>{option.sub}</p><div className="spec-row"><span>Lens</span><b>{sel.lens} mm</b></div><div className="spec-row"><span>Aperture</span><b>f/{sel.aperture}</b></div><div className="spec-row"><span>Angle</span><b>{pick(GROUPS[3],sel.angle).label}</b></div><div className="spec-row"><span>Light</span><b>{pick(GROUPS[4],sel.light).label}</b></div></div><div className="inspector-card"><span className="eyebrow">WHY VISION</span><p>La recomendación debe proteger la información necesaria del Source Truth antes de añadir estilo.</p></div><button className="prompt-toggle" onClick={()=>setPromptOpen(true)}><Sparkles size={15}/>Abrir Prompt Monitor</button></aside>
    </main>

    {promptOpen&&<section className={`prompt-monitor ${dock}`}><header><div><span className="eyebrow">LIVE OUTPUT</span><strong>Production Prompt</strong></div><div><button onClick={copy} title="Copiar"><Copy size={14}/></button><button onClick={()=>setDock(dock==='float'?'bottom':'float')} title="Acoplar"><Move size={14}/></button><button onClick={()=>setPromptOpen(false)} title="Cerrar"><X size={14}/></button></div></header><div className="prompt-body"><span className="token source">{source}</span> <span className="token camera">{pick(GROUPS[0],sel.shot).prompt}, {pick(GROUPS[1],sel.lens).prompt}, {pick(GROUPS[2],sel.aperture).prompt}, {pick(GROUPS[3],sel.angle).prompt}</span>, <span className="token light">{pick(GROUPS[4],sel.light).prompt}</span>, <span className="token motion">{pick(GROUPS[5],sel.movement).prompt}</span>, <span className="token look">{pick(GROUPS[6],sel.look).prompt}</span>. <span className="token constraint">Preserve source truth and avoid decorative AI artifacts.</span></div><footer><span><i className="dot source"/>Source</span><span><i className="dot camera"/>Camera</span><span><i className="dot light"/>Light</span><span><i className="dot motion"/>Motion</span><span><i className="dot look"/>Look</span></footer></section>}
  </div>
}
