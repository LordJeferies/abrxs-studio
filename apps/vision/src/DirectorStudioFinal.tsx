import { Check, ChevronRight, Copy, Eye, EyeOff, HelpCircle, Image as ImageIcon, Layers3, MessageCircle, Save, Sparkles, Trash2, Video, WandSparkles } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import {
  DIRECTOR_CATEGORIES,
  DIRECTOR_OPTIONS,
  DIRECTOR_PRESETS,
  anatomizePrompt,
  auditDirectorPrompt,
  compileDirectorPrompt,
  optionById,
  optionsFor,
  recommendPresets,
  selectionsFromPreset,
  type DirectorCategory,
  type DirectorMode,
  type DirectorOption,
  type DirectorPreset,
  type DirectorSelections,
} from './directorFinal';

type Props = {
  language: 'es' | 'en';
  onOpenCopilot?: () => void;
  onOpenStudio?: () => void;
};

type SavedPreset = { id: string; label: string; selections: DirectorSelections };

const BASE_ES = 'Un decisor compara tres propuestas visualmente equivalentes sobre una mesa real. El video debe mostrar que la indecisión no viene de tener pocas opciones, sino de no tener un criterio claro para compararlas.';
const BASE_EN = 'A decision-maker compares three visually equivalent proposals on a real work table. The video should show that indecision does not come from having too few options, but from lacking a clear criterion for comparing them.';

const ANATOMY_COLORS: Record<string, string> = {
  intent: '#c49aee', subject: '#75d7e7', action: '#f0a66d', scene: '#70c9b4', shot: '#8bb6ff', camera: '#8bb6ff', lens: '#8ed29a', angle: '#8bb6ff', aperture: '#8ed29a', focus: '#8ed29a', shutter: '#7bbbd5', frameRate: '#7bbbd5', whiteBalance: '#efc36f', composition: '#80a9ef', lighting: '#efc36f', movement: '#ee9b64', subjectMotion: '#ee9b64', environmentMotion: '#d59e72', look: '#d79cd0', atmosphere: '#78b8b0', material: '#c5a27a', fx: '#e48b9c', output: '#aab4c5',
};

function loadJson<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}

function Preview({ option, selected = false }: { option: DirectorOption; selected?: boolean }) {
  const p = option.preview;
  const style = {
    '--v-subject-scale': String(p.subjectScale ?? 1),
    '--v-subject-x': `${p.subjectX ?? 0}%`,
    '--v-subject-y': `${p.subjectY ?? 0}%`,
    '--v-bg-scale': String(p.backgroundScale ?? 1),
    '--v-blur': `${Math.round((p.blur ?? 0) * 12)}px`,
    '--v-contrast': String(p.contrast ?? 1),
    '--v-warmth': String(p.warmth ?? 0),
    '--v-vignette': String(p.vignette ?? 0),
    '--v-haze': String(p.haze ?? 0),
    '--v-grain': String(p.grain ?? 0),
    '--v-bloom': String(p.bloom ?? 0),
  } as React.CSSProperties;
  return <div className={`v25f-preview ${selected ? 'selected' : ''}`} style={style} data-light={p.light ?? 'front'} data-motion={p.motion ?? 'none'}>
    <div className="v25f-bg"/><div className="v25f-window"/><div className="v25f-practical"/><div className="v25f-table"><i/><i/><i/></div><div className="v25f-person"><span/><b/></div><div className="v25f-air"/><div className="v25f-bloom"/><div className="v25f-grain"/><div className="v25f-vignette"/>
    {p.motion && p.motion !== 'none' ? <div className={`v25f-motion ${p.motion}`}>→</div> : null}
    {selected ? <span className="v25f-selected"><Check size={11}/></span> : null}
  </div>;
}

function OptionCard({ option, selected, onApply, onHelp }: { option: DirectorOption; selected: boolean; onApply: () => void; onHelp: () => void }) {
  return <article className={`v25f-option ${selected ? 'selected' : ''}`}>
    <button type="button" className="v25f-option-main" onClick={onApply}><Preview option={option} selected={selected}/><div><strong>{option.label}</strong><span>{option.short}</span></div></button>
    <button type="button" className="v25f-help" onClick={onHelp} aria-label={`Explain ${option.label}`}><HelpCircle size={14}/></button>
  </article>;
}

function modeDefaults(mode: DirectorMode) {
  return mode === 'image' ? { aspect: '4:5', duration: 'single frame' } : mode === 'xroll' ? { aspect: '9:16', duration: '6 seconds' } : { aspect: '9:16', duration: '8 seconds' };
}

export function DirectorStudioFinal({ language, onOpenCopilot, onOpenStudio }: Props) {
  const es = language === 'es';
  const [mode, setMode] = useState<DirectorMode>(() => loadJson('abrxsVisionV25FinalMode', 'video'));
  const [source, setSource] = useState(() => localStorage.getItem('abrxsVisionV25FinalSource') || (es ? BASE_ES : BASE_EN));
  const [selections, setSelections] = useState<DirectorSelections>(() => loadJson('abrxsVisionV25FinalSelections', {}));
  const [activeCategory, setActiveCategory] = useState<DirectorCategory>('lens');
  const [activeGroup, setActiveGroup] = useState<'camera' | 'light' | 'motion' | 'look'>('camera');
  const [aspect, setAspect] = useState(() => localStorage.getItem('abrxsVisionV25FinalAspect') || '9:16');
  const [duration, setDuration] = useState(() => localStorage.getItem('abrxsVisionV25FinalDuration') || '8 seconds');
  const [preserveText, setPreserveText] = useState(false);
  const [anatomy, setAnatomy] = useState(true);
  const [help, setHelp] = useState<DirectorOption | null>(null);
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>(() => loadJson('abrxsVisionV25UserPresets', []));
  const sourceRef = useRef<HTMLTextAreaElement>(null);

  const recommended = useMemo(() => recommendPresets(source, mode, 6), [source, mode]);
  const compiled = useMemo(() => compileDirectorPrompt({ sourceText: source, mode, selections, aspect, duration, preserveText }), [source, mode, selections, aspect, duration, preserveText]);
  const audit = useMemo(() => auditDirectorPrompt(compiled.prompt, mode), [compiled.prompt, mode]);
  const anatomySegments = useMemo(() => anatomizePrompt(compiled.prompt), [compiled.prompt]);
  const visibleCategories = DIRECTOR_CATEGORIES.filter((item) => item.group === activeGroup);
  const options = optionsFor(activeCategory);
  const activeOption = optionById(selections[activeCategory]);

  const persistSource = (value: string) => { setSource(value); localStorage.setItem('abrxsVisionV25FinalSource', value); };
  const persistSelections = (value: DirectorSelections) => { setSelections(value); localStorage.setItem('abrxsVisionV25FinalSelections', JSON.stringify(value)); };
  const selectMode = (next: DirectorMode) => {
    setMode(next); localStorage.setItem('abrxsVisionV25FinalMode', JSON.stringify(next));
    const d = modeDefaults(next); setAspect(d.aspect); setDuration(d.duration); localStorage.setItem('abrxsVisionV25FinalAspect', d.aspect); localStorage.setItem('abrxsVisionV25FinalDuration', d.duration);
  };
  const choose = (option: DirectorOption) => persistSelections({ ...selections, [option.category]: option.id });
  const applyPreset = (preset: DirectorPreset | SavedPreset) => persistSelections({ ...selections, ...('values' in preset ? preset.values : preset.selections) });
  const savePreset = () => {
    const name = window.prompt(es ? 'Nombre del preset' : 'Preset name');
    if (!name?.trim()) return;
    const next = [...savedPresets, { id: `user-${Date.now()}`, label: name.trim(), selections: { ...selections } }];
    setSavedPresets(next); localStorage.setItem('abrxsVisionV25UserPresets', JSON.stringify(next));
  };
  const removePreset = (id: string) => {
    const next = savedPresets.filter((item) => item.id !== id); setSavedPresets(next); localStorage.setItem('abrxsVisionV25UserPresets', JSON.stringify(next));
  };
  const autoDirect = () => {
    const top = recommended[0];
    if (top) applyPreset(top);
  };
  const captureSelectionForCopilot = () => {
    const el = sourceRef.current; if (!el) return;
    const selected = source.slice(el.selectionStart, el.selectionEnd).trim();
    if (selected) localStorage.setItem('abrxsVisionV25SelectedText', selected);
  };

  return <section className="v25f-shell">
    <header className="v25f-head">
      <div><span className="micro">ABRXS VISION V2.5 · DIRECTOR STUDIO</span><h1>{es ? 'Texto base → dirección de cine → prompt de producción.' : 'Base text → cinematic direction → production prompt.'}</h1><p>{es ? 'Escribe qué pasa. Después elige cómo debe verse: cámara, focal, exposición, composición, luz, movimiento, look, materiales y FX. Cada elección tiene referencia y explicación.' : 'Write what happens. Then choose how it should look: camera, focal length, exposure, composition, light, motion, look, materials and FX. Every choice has a reference and explanation.'}</p></div>
      <div className="v25f-mode"><button className={mode === 'image' ? 'active' : ''} onClick={() => selectMode('image')}><ImageIcon size={15}/>{es ? 'Imagen' : 'Image'}</button><button className={mode === 'video' ? 'active' : ''} onClick={() => selectMode('video')}><Video size={15}/>Video</button><button className={mode === 'xroll' ? 'active' : ''} onClick={() => selectMode('xroll')}><Layers3 size={15}/>XRoll</button></div>
    </header>

    <div className="v25f-editor-grid">
      <section className="v25f-panel source"><div className="v25f-panel-head"><div><span className="micro">01 · SOURCE TRUTH</span><h2>{es ? 'Texto base / guion / idea' : 'Base text / script / idea'}</h2></div><button onClick={() => navigator.clipboard.writeText(source)}><Copy size={14}/></button></div><textarea ref={sourceRef} value={source} onChange={(e) => persistSource(e.target.value)} onSelect={captureSelectionForCopilot} placeholder={es ? 'Pega aquí el texto del video, una escena, una idea o un prompt que quieras mejorar…' : 'Paste the video text, a scene, an idea or a prompt you want to improve…'}/><footer><span>{source.length} chars</span><div><button onClick={() => persistSource(es ? BASE_ES : BASE_EN)}>{es ? 'Ejemplo' : 'Example'}</button>{onOpenCopilot ? <button onClick={onOpenCopilot}><MessageCircle size={13}/>{es ? 'Preguntar a Vision' : 'Ask Vision'}</button> : null}</div></footer></section>

      <section className="v25f-panel output"><div className="v25f-panel-head"><div><span className="micro">03 · ABRAXAS OUTPUT</span><h2>{es ? 'Prompt dirigido' : 'Directed prompt'}</h2></div><div className="v25f-score" data-grade={audit.grade}><strong>{audit.grade}</strong><span>{audit.score}</span></div></div>{anatomy ? <div className="v25f-anatomy">{anatomySegments.map((segment,index) => <span key={`${index}-${segment.text.slice(0,5)}`} style={{ textDecorationColor: ANATOMY_COLORS[segment.category] || '#8d94a0' }} title={segment.category}>{segment.text}</span>)}</div> : <textarea readOnly value={compiled.prompt}/>}<footer><div><button onClick={() => setAnatomy((v) => !v)}>{anatomy ? <EyeOff size={13}/> : <Eye size={13}/>}Anatomy</button><button onClick={() => navigator.clipboard.writeText(compiled.prompt)}><Copy size={13}/>{es ? 'Copiar' : 'Copy'}</button></div>{onOpenStudio ? <button className="primary" onClick={onOpenStudio}><Sparkles size={13}/>{es ? 'Preparar producción' : 'Prepare production'}</button> : null}</footer></section>
    </div>

    <section className="v25f-recipes"><div className="v25f-section-head"><div><span className="micro">SUGGESTED RECIPES</span><h2>{es ? 'Vision sugiere combinaciones según el texto.' : 'Vision suggests combinations from the text.'}</h2></div><button className="v25f-auto" onClick={autoDirect}><WandSparkles size={14}/>{es ? 'Dirigir automáticamente' : 'Auto direct'}</button></div><div className="v25f-recipe-row">{recommended.map((preset,index) => <button key={preset.id} onClick={() => applyPreset(preset)}><span>{String(index + 1).padStart(2,'0')}</span><div><strong>{preset.label}</strong><small>{preset.family} · {preset.description}</small></div><ChevronRight size={14}/></button>)}</div></section>

    <section className="v25f-director">
      <main><div className="v25f-section-head"><div><span className="micro">02 · CINEMA DIRECTOR</span><h2>{es ? 'Selecciona viendo el efecto.' : 'Choose by seeing the effect.'}</h2></div><div className="v25f-head-actions"><button onClick={() => persistSelections({})}><Trash2 size={13}/>{es ? 'Limpiar' : 'Clear'}</button><button onClick={savePreset}><Save size={13}/>{es ? 'Guardar preset' : 'Save preset'}</button></div></div>
        <div className="v25f-group-tabs">{(['camera','light','motion','look'] as const).map((group) => <button key={group} className={activeGroup === group ? 'active' : ''} onClick={() => { setActiveGroup(group); const first = DIRECTOR_CATEGORIES.find((item) => item.group === group); if (first) setActiveCategory(first.id); }}>{group === 'camera' ? (es ? 'Cámara' : 'Camera') : group === 'light' ? (es ? 'Luz / color' : 'Light / color') : group === 'motion' ? (es ? 'Movimiento' : 'Motion') : 'Look / FX'}</button>)}</div>
        <div className="v25f-category-tabs">{visibleCategories.map((cat) => <button key={cat.id} className={activeCategory === cat.id ? 'active' : ''} onClick={() => setActiveCategory(cat.id)}><strong>{cat.label}</strong><span>{cat.description}</span></button>)}</div>
        <div className="v25f-option-grid">{options.map((option) => <OptionCard key={option.id} option={option} selected={selections[option.category] === option.id} onApply={() => choose(option)} onHelp={() => setHelp(option)}/>)}</div>
      </main>

      <aside><section className="v25f-inspector"><span className="micro">CURRENT DIRECTION</span><div className="v25f-decisions">{compiled.decisions.map((decision) => <button key={`${decision.category}-${decision.id}`} onClick={() => { setActiveCategory(decision.category); const cat = DIRECTOR_CATEGORIES.find((c) => c.id === decision.category); if (cat) setActiveGroup(cat.group); }}><span>{DIRECTOR_CATEGORIES.find((c) => c.id === decision.category)?.label}</span><strong>{decision.label}</strong></button>)}</div></section>
        <section className="v25f-inspector"><span className="micro">OUTPUT CONTRACT</span><label>Aspect<select value={aspect} onChange={(e) => { setAspect(e.target.value); localStorage.setItem('abrxsVisionV25FinalAspect', e.target.value); }}><option>9:16</option><option>4:5</option><option>1:1</option><option>16:9</option><option>2.39:1</option></select></label>{mode !== 'image' ? <label>{es ? 'Duración' : 'Duration'}<input value={duration} onChange={(e) => { setDuration(e.target.value); localStorage.setItem('abrxsVisionV25FinalDuration', e.target.value); }}/></label> : null}<label className="v25f-checkbox"><input type="checkbox" checked={preserveText} onChange={(e) => setPreserveText(e.target.checked)}/><span>{es ? 'Preservar texto literal' : 'Preserve literal text'}</span></label></section>
        {savedPresets.length ? <section className="v25f-inspector"><span className="micro">MY PRESETS</span>{savedPresets.map((preset) => <div className="v25f-user-preset" key={preset.id}><button onClick={() => applyPreset(preset)}><strong>{preset.label}</strong></button><button onClick={() => removePreset(preset.id)}><Trash2 size={12}/></button></div>)}</section> : null}
        {activeOption ? <section className="v25f-inspector"><Preview option={activeOption} selected/><h3>{activeOption.label}</h3><p>{activeOption.effect}</p><small>{activeOption.feel}</small></section> : null}
      </aside>
    </section>

    {help ? <div className="v25f-help-sheet" role="dialog" aria-modal="true"><button className="v25f-backdrop" onClick={() => setHelp(null)} aria-label="close"/><article><Preview option={help}/><header><div><span className="micro">{DIRECTOR_CATEGORIES.find((c) => c.id === help.category)?.label}</span><h2>{help.label}</h2><p>{help.short}</p></div><button onClick={() => setHelp(null)}>×</button></header><dl><div><dt>{es ? 'Qué hace' : 'What it does'}</dt><dd>{help.effect}</dd></div><div><dt>{es ? 'Cómo se siente' : 'How it feels'}</dt><dd>{help.feel}</dd></div><div><dt>{es ? 'Útil para' : 'Good for'}</dt><dd>{help.useFor}</dd></div><div><dt>{es ? 'Evita si' : 'Avoid when'}</dt><dd>{help.avoidWhen}</dd></div><div><dt>{es ? 'Cómo entra al prompt' : 'Prompt language'}</dt><dd><code>{help.prompt}</code></dd></div></dl><button className="primary" onClick={() => { choose(help); setHelp(null); }}><WandSparkles size={14}/>{es ? `Usar ${help.label}` : `Use ${help.label}`}</button></article></div> : null}
  </section>;
}
