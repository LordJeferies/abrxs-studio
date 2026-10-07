import {
  Check,
  ChevronRight,
  Clipboard,
  Copy,
  HelpCircle,
  Image as ImageIcon,
  Layers3,
  MessageCircle,
  RefreshCcw,
  Sparkles,
  Video,
  WandSparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  DIRECTOR_CATEGORIES,
  DIRECTOR_PRESETS,
  optionById,
  optionsFor,
  type DirectorCategory,
  type DirectorOption,
} from './directorCatalog';
import {
  compileDirectedPrompt,
  recommendDirectorPresets,
  selectionsFromPreset,
  selectedOptionSummary,
  type DirectorOutputMode,
  type DirectorSelections,
} from './directorCompiler';

type Props = {
  language: 'es' | 'en';
  onOpenCopilot?: () => void;
  onOpenStudio?: () => void;
};

const BASE_ES = `Una persona debe decidir entre tres propuestas visualmente equivalentes. El video tiene que mostrar que el problema no es tener pocas opciones, sino no tener un criterio claro para compararlas.`;
const BASE_EN = `A person must decide between three visually equivalent proposals. The video should show that the problem is not a lack of options, but the absence of a clear criterion for comparing them.`;

function safeJson<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}

function SceneCard({ option, active, onClick, onExplain }: { option: DirectorOption; active: boolean; onClick: () => void; onExplain: () => void }) {
  const p = option.preview;
  const style = {
    '--subject-scale': String(p.subjectScale ?? 1),
    '--subject-x': `${p.subjectX ?? 0}%`,
    '--subject-y': `${p.subjectY ?? 0}%`,
    '--scene-contrast': String(p.contrast ?? 1),
    '--scene-haze': String(p.haze ?? 0),
    '--scene-vignette': String(p.vignette ?? 0),
  } as React.CSSProperties;
  return <article className={`v25b-visual-card ${active ? 'active' : ''}`} style={style}>
    <button type="button" className="v25b-visual-preview" onClick={onClick} data-light={p.light ?? 'front'} data-motion={p.motion ?? 'none'}>
      <div className="v25b-room"/>
      <div className="v25b-window"/>
      <div className="v25b-table"><i/><i/><i/></div>
      <div className="v25b-person"><i/><b/></div>
      <div className="v25b-haze"/>
      <div className="v25b-vignette"/>
      {active ? <span className="v25b-check"><Check size={12}/></span> : null}
    </button>
    <div className="v25b-visual-copy"><button type="button" onClick={onClick}><strong>{option.label}</strong><span>{option.short}</span></button><button type="button" className="v25b-question" onClick={onExplain}><HelpCircle size={14}/></button></div>
  </article>;
}

export function DirectorPromptStudioV25({ language, onOpenCopilot, onOpenStudio }: Props) {
  const es = language === 'es';
  const [mode, setMode] = useState<DirectorOutputMode>(() => safeJson('abrxsVisionV25Mode', 'video'));
  const [sourceText, setSourceText] = useState(() => localStorage.getItem('abrxsVisionV25Source') || (es ? BASE_ES : BASE_EN));
  const [selections, setSelections] = useState<DirectorSelections>(() => safeJson('abrxsVisionV25Selections', {}));
  const [activeCategory, setActiveCategory] = useState<DirectorCategory>('lens');
  const [duration, setDuration] = useState(() => localStorage.getItem('abrxsVisionV25Duration') || '6–8 seconds');
  const [aspect, setAspect] = useState(() => localStorage.getItem('abrxsVisionV25Aspect') || '9:16');
  const [preserveText, setPreserveText] = useState(false);
  const [help, setHelp] = useState<DirectorOption | null>(null);
  const [directedPrompt, setDirectedPrompt] = useState(() => localStorage.getItem('abrxsVisionV25DirectedPrompt') || '');

  const suggestedPresets = useMemo(() => recommendDirectorPresets(sourceText, mode, 5), [sourceText, mode]);
  const currentOptions = useMemo(() => optionsFor(activeCategory), [activeCategory]);
  const selectedSummary = useMemo(() => selectedOptionSummary(selections), [selections]);
  const compiledPreview = useMemo(() => compileDirectedPrompt(sourceText, mode, selections, { duration, aspect, preserveText }), [sourceText, mode, selections, duration, aspect, preserveText]);

  const saveSource = (value: string) => { setSourceText(value); try { localStorage.setItem('abrxsVisionV25Source', value); } catch { /* noop */ } };
  const setOutputMode = (value: DirectorOutputMode) => { setMode(value); try { localStorage.setItem('abrxsVisionV25Mode', JSON.stringify(value)); } catch { /* noop */ } };
  const updateSelections = (value: DirectorSelections) => { setSelections(value); try { localStorage.setItem('abrxsVisionV25Selections', JSON.stringify(value)); } catch { /* noop */ } };

  const chooseOption = (selected: DirectorOption) => updateSelections({ ...selections, [selected.category]: selected.id });
  const applyPreset = (id: string) => {
    const preset = DIRECTOR_PRESETS.find((item) => item.id === id);
    if (!preset) return;
    updateSelections({ ...selections, ...selectionsFromPreset(preset) });
  };
  const compile = () => {
    const result = compileDirectedPrompt(sourceText, mode, selections, { duration, aspect, preserveText });
    setDirectedPrompt(result.prompt);
    try { localStorage.setItem('abrxsVisionV25DirectedPrompt', result.prompt); } catch { /* noop */ }
  };
  const clearDirection = () => updateSelections({});
  const copy = (value: string) => void navigator.clipboard.writeText(value);

  const selectedForCategory = optionById(selections[activeCategory]);

  return <section className="v25b-director">
    <header className="v25b-hero">
      <div><span className="micro">ABRXS VISION V2.5 · DIRECTOR</span><h1>{es ? 'Pon el texto base. Dirige la imagen.' : 'Start with the base text. Direct the image.'}</h1><p>{es ? 'Escribe lo que debe pasar o lo que quieres comunicar. Luego elige cámara, lente, foco, composición, iluminación, movimiento, look, atmósfera y FX usando referencias visuales. Vision te devuelve un prompt nuevo y mejorado.' : 'Write what must happen or what you want to communicate. Then choose camera, lens, focus, composition, lighting, movement, look, atmosphere and FX using visual references. Vision returns a new, improved prompt.'}</p></div>
      <div className="v25b-mode-switch"><button className={mode === 'image' ? 'active' : ''} onClick={() => setOutputMode('image')} type="button"><ImageIcon size={15}/>{es ? 'Imagen' : 'Image'}</button><button className={mode === 'video' ? 'active' : ''} onClick={() => setOutputMode('video')} type="button"><Video size={15}/>Video</button><button className={mode === 'xroll' ? 'active' : ''} onClick={() => setOutputMode('xroll')} type="button"><Layers3 size={15}/>XRoll</button></div>
    </header>

    <div className="v25b-top-grid">
      <section className="v25b-source-card">
        <div className="v25b-card-head"><div><span className="micro">01 · SOURCE TRUTH</span><h2>{es ? 'Texto base' : 'Base text'}</h2></div><button type="button" onClick={() => copy(sourceText)}><Copy size={14}/></button></div>
        <textarea value={sourceText} onChange={(event) => saveSource(event.target.value)} placeholder={es ? 'Pega un guion, una descripción de escena, una idea o un prompt débil…' : 'Paste a script, scene description, idea or weak prompt…'}/>
        <div className="v25b-source-footer"><span>{sourceText.length} chars</span><button type="button" onClick={() => saveSource(es ? BASE_ES : BASE_EN)}><RefreshCcw size={13}/>{es ? 'Ejemplo' : 'Example'}</button></div>
      </section>

      <section className="v25b-output-card">
        <div className="v25b-card-head"><div><span className="micro">03 · DIRECTED OUTPUT</span><h2>{es ? 'Prompt mejorado' : 'Improved prompt'}</h2></div><button type="button" onClick={() => copy(directedPrompt || compiledPreview.prompt)}><Copy size={14}/></button></div>
        <textarea value={directedPrompt || compiledPreview.prompt} onChange={(event) => setDirectedPrompt(event.target.value)} aria-label="Directed prompt output"/>
        <div className="v25b-output-footer"><span>{selectedSummary.length} {es ? 'decisiones activas' : 'active decisions'}</span><button className="primary" type="button" onClick={compile}><WandSparkles size={14}/>{es ? 'Crear prompt dirigido' : 'Build directed prompt'}</button></div>
      </section>
    </div>

    <section className="v25b-suggested">
      <div className="v25b-section-title"><div><span className="micro">SUGGESTED RECIPES</span><h2>{es ? 'Presets sugeridos según tu texto' : 'Presets suggested from your text'}</h2></div><p>{es ? 'Son combinaciones editables, no prompts cerrados.' : 'They are editable combinations, not locked prompts.'}</p></div>
      <div className="v25b-preset-row">{suggestedPresets.map((preset, index) => <button key={preset.id} type="button" onClick={() => applyPreset(preset.id)}><span>{String(index + 1).padStart(2,'0')}</span><div><strong>{preset.label}</strong><small>{preset.family} · {preset.description}</small></div><ChevronRight size={14}/></button>)}</div>
    </section>

    <section className="v25b-director-grid">
      <main>
        <div className="v25b-section-title"><div><span className="micro">02 · CINEMA DIRECTOR</span><h2>{es ? 'Selecciona viendo el efecto.' : 'Choose by seeing the effect.'}</h2></div><button className="v25b-reset" type="button" onClick={clearDirection}>{es ? 'Limpiar dirección' : 'Clear direction'}</button></div>
        <div className="v25b-category-strip">{DIRECTOR_CATEGORIES.map((category) => <button key={category.id} className={activeCategory === category.id ? 'active' : ''} type="button" onClick={() => setActiveCategory(category.id)}><strong>{category.label}</strong><span>{category.description}</span></button>)}</div>
        <div className="v25b-visual-grid">{currentOptions.map((option) => <SceneCard key={option.id} option={option} active={selections[activeCategory] === option.id} onClick={() => chooseOption(option)} onExplain={() => setHelp(option)}/>)}</div>
      </main>

      <aside className="v25b-side">
        <section className="v25b-side-card">
          <span className="micro">CURRENT DIRECTION</span>
          <div className="v25b-current-list">{selectedSummary.length ? selectedSummary.map((item) => <button type="button" key={`${item.category}-${item.id}`} onClick={() => setActiveCategory(item.category)}><span>{DIRECTOR_CATEGORIES.find((category) => category.id === item.category)?.label}</span><strong>{item.label}</strong></button>) : <p>{es ? 'Todavía no has elegido decisiones manuales. Vision puede usar defaults sugeridos al compilar.' : 'No manual decisions yet. Vision can use suggested defaults when compiling.'}</p>}</div>
        </section>
        <section className="v25b-side-card">
          <span className="micro">OUTPUT CONTRACT</span>
          <label><span>Aspect</span><select value={aspect} onChange={(event) => { setAspect(event.target.value); localStorage.setItem('abrxsVisionV25Aspect', event.target.value); }}><option>9:16</option><option>4:5</option><option>1:1</option><option>16:9</option><option>2.39:1</option></select></label>
          {mode !== 'image' ? <label><span>{es ? 'Duración' : 'Duration'}</span><input value={duration} onChange={(event) => { setDuration(event.target.value); localStorage.setItem('abrxsVisionV25Duration', event.target.value); }}/></label> : null}
          <label className="v25b-check-row"><input type="checkbox" checked={preserveText} onChange={(event) => setPreserveText(event.target.checked)}/><span>{es ? 'Preservar texto literal suministrado' : 'Preserve supplied literal text'}</span></label>
        </section>
        <section className="v25b-side-card v25b-bridge-card">
          <span className="micro">AI + PRODUCTION</span>
          {onOpenCopilot ? <button type="button" onClick={onOpenCopilot}><MessageCircle size={15}/><div><strong>Vision Copilot</strong><small>{es ? 'Pide alternativas, crítica o una mejora semántica.' : 'Ask for alternatives, critique or semantic improvement.'}</small></div></button> : null}
          {onOpenStudio ? <button type="button" onClick={onOpenStudio}><Sparkles size={15}/><div><strong>{es ? 'Abrir Studio' : 'Open Studio'}</strong><small>{es ? 'Compilar al provider y preparar generación.' : 'Compile for provider and prepare generation.'}</small></div></button> : null}
        </section>
      </aside>
    </section>

    {selectedForCategory ? <section className="v25b-active-explainer"><div><span className="micro">{DIRECTOR_CATEGORIES.find((item) => item.id === activeCategory)?.label}</span><h3>{selectedForCategory.label}</h3></div><p><strong>{es ? 'Qué hace:' : 'Effect:'}</strong> {selectedForCategory.effect}</p><p><strong>{es ? 'Se siente:' : 'Feels:'}</strong> {selectedForCategory.feel}</p><p><strong>{es ? 'Útil para:' : 'Good for:'}</strong> {selectedForCategory.useFor}</p></section> : null}

    {help ? <div className="v25b-help-sheet" role="dialog" aria-modal="true"><button className="v25b-help-backdrop" type="button" onClick={() => setHelp(null)} aria-label="close"/><article><div className="v25b-help-visual"><SceneCard option={help} active={false} onClick={() => undefined} onExplain={() => undefined}/></div><header><div><span className="micro">{DIRECTOR_CATEGORIES.find((item) => item.id === help.category)?.label}</span><h2>{help.label}</h2></div><button type="button" onClick={() => setHelp(null)}>×</button></header><dl><div><dt>{es ? 'Qué hace' : 'What it does'}</dt><dd>{help.effect}</dd></div><div><dt>{es ? 'Cómo se siente' : 'How it feels'}</dt><dd>{help.feel}</dd></div><div><dt>{es ? 'Bueno para' : 'Good for'}</dt><dd>{help.useFor}</dd></div><div><dt>{es ? 'Evita si' : 'Avoid when'}</dt><dd>{help.avoidWhen}</dd></div><div><dt>{es ? 'Lenguaje de prompt' : 'Prompt language'}</dt><dd><code>{help.prompt}</code></dd></div></dl><button className="v25b-use" type="button" onClick={() => { chooseOption(help); setHelp(null); }}><WandSparkles size={15}/>{es ? `Usar ${help.label}` : `Use ${help.label}`}</button></article></div> : null}
  </section>;
}
