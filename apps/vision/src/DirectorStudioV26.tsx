import {
  AlertTriangle,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Layers3,
  MessageCircle,
  MonitorUp,
  Search,
  SlidersHorizontal,
  Sparkles,
  Video,
  WandSparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  DIRECTOR_CATEGORIES,
  compileDirectorPrompt,
  optionById,
  optionsFor,
  recommendPresets,
  type DirectorCategory,
  type DirectorMode,
  type DirectorOption,
  type DirectorSelections,
} from './directorFinal';
import { anatomizePromptV25 } from './promptAnatomyV25';
import { analyzeDirectorSource, detectDirectionConflicts, recommendDirectorOptions } from './v26Core';
import { sceneForOption } from './referenceMediaV26';
import { CameraSceneV26 } from './CameraSceneV26';
import { CinemaColumnsV26 } from './CinemaColumnsV26';
import { PromptMonitorV26 } from './PromptMonitorV26';

type Props = {
  language: 'es' | 'en';
  onOpenCopilot?: () => void;
  onOpenStudio?: () => void;
};

type DirectorView = 'guided' | 'cinema' | 'studio';
type VisualView = 'camera' | 'photo';

const DEFAULT_ES = 'Un decisor compara tres propuestas visualmente equivalentes sobre una mesa real. Mira una, luego otra, duda y retira la mano sin elegir. La escena debe mostrar que el problema no es tener pocas opciones, sino no tener un criterio claro.';
const DEFAULT_EN = 'A decision-maker compares three visually equivalent proposals on a real work table. They look from one to another, hesitate, then withdraw their hand without choosing. The scene should show that the problem is not too few options but the lack of a clear criterion.';

const DEFAULT_SELECTIONS: DirectorSelections = {
  shot: 'mcu',
  camera: 'super35',
  lens: '50mm',
  angle: 'eye',
  aperture: 'f28',
  focus: 'subject',
  shutter: '180',
  frameRate: '24fps',
  whiteBalance: '5600k',
  composition: 'thirds',
  lighting: 'soft-side',
  movement: 'static',
  subjectMotion: 'still',
  environmentMotion: 'none',
  look: 'clean',
  atmosphere: 'clean',
  material: 'natural-skin',
  fx: 'none',
};

const GROUPS: Array<{ id: 'camera' | 'light' | 'motion' | 'look'; es: string; en: string }> = [
  { id: 'camera', es: 'Cámara', en: 'Camera' },
  { id: 'light', es: 'Luz y color', en: 'Light & color' },
  { id: 'motion', es: 'Movimiento', en: 'Motion' },
  { id: 'look', es: 'Look y FX', en: 'Look & FX' },
];

function loadSelections(): DirectorSelections {
  try {
    const raw = localStorage.getItem('abrxsVisionV26Selections');
    return { ...DEFAULT_SELECTIONS, ...(raw ? JSON.parse(raw) as DirectorSelections : {}) };
  } catch {
    return { ...DEFAULT_SELECTIONS };
  }
}

function PhotoReference({ option, compact = false }: { option: DirectorOption; compact?: boolean }) {
  const scene = sceneForOption(option);
  return <figure className={`v26-real-reference ${compact ? 'compact' : ''}`}>
    <img src={scene.url} alt={`${option.label} visual reference`} loading="lazy" style={{ objectPosition: scene.objectPosition }}/>
    <figcaption>
      <span>{scene.fidelity === 'curated-effect-reference' ? 'CURATED EFFECT REF' : 'PHOTO EXAMPLE'}</span>
      {!compact && <small>{scene.credit}</small>}
    </figcaption>
  </figure>;
}

function ModeSwitch({ mode, onChange, language }: { mode: DirectorMode; onChange: (mode: DirectorMode) => void; language: 'es' | 'en' }) {
  const es = language === 'es';
  return <div className="v26-mode-switch">
    <button className={mode === 'image' ? 'active' : ''} onClick={() => onChange('image')}><ImageIcon size={15}/><span>{es ? 'Imagen' : 'Image'}</span></button>
    <button className={mode === 'video' ? 'active' : ''} onClick={() => onChange('video')}><Video size={15}/><span>Video</span></button>
    <button className={mode === 'xroll' ? 'active' : ''} onClick={() => onChange('xroll')}><Layers3 size={15}/><span>XRoll</span></button>
  </div>;
}

function VisualStage({ visual, selections, selected, language }: {
  visual: VisualView;
  selections: DirectorSelections;
  selected: DirectorOption;
  language: 'es' | 'en';
}) {
  const es = language === 'es';
  return <section className="v26-main-stage">
    <header>
      <div><span className="micro">{visual === 'camera' ? 'CAMERA VIEW' : 'PHOTO REFERENCE'}</span><strong>{selected.label}</strong></div>
      <small>{visual === 'camera' ? (es ? 'Simulación técnica controlada' : 'Controlled technical simulation') : (es ? 'Ejemplo visual curado' : 'Curated visual example')}</small>
    </header>
    {visual === 'camera'
      ? <CameraSceneV26 selections={selections} label={selected.label}/>
      : <PhotoReference option={selected}/>} 
  </section>;
}

function GuidedView({
  language,
  category,
  setCategory,
  selections,
  selected,
  options,
  recommendation,
  applyOption,
  visual,
  setVisual,
}: {
  language: 'es' | 'en';
  category: DirectorCategory;
  setCategory: (category: DirectorCategory) => void;
  selections: DirectorSelections;
  selected: DirectorOption;
  options: DirectorOption[];
  recommendation?: ReturnType<typeof recommendDirectorOptions>[number];
  applyOption: (option: DirectorOption) => void;
  visual: VisualView;
  setVisual: (view: VisualView) => void;
}) {
  const es = language === 'es';
  const index = DIRECTOR_CATEGORIES.findIndex((item) => item.id === category);
  const prev = DIRECTOR_CATEGORIES[Math.max(0, index - 1)];
  const next = DIRECTOR_CATEGORIES[Math.min(DIRECTOR_CATEGORIES.length - 1, index + 1)];
  const group = DIRECTOR_CATEGORIES[index]?.group;

  return <div className="v26-guided-layout">
    <aside className="v26-guided-roadmap">
      <div className="v26-guided-roadmap-head"><span className="micro">GUIDED DIRECTOR</span><strong>{es ? 'Una decisión a la vez' : 'One decision at a time'}</strong></div>
      {GROUPS.map((section) => {
        const groupCategories = DIRECTOR_CATEGORIES.filter((item) => item.group === section.id);
        return <details key={section.id} open={group === section.id}>
          <summary><span>{es ? section.es : section.en}</span><ChevronDown size={13}/></summary>
          <div>{groupCategories.map((item) => <button key={item.id} className={item.id === category ? 'active' : ''} onClick={() => setCategory(item.id)}><span>{item.label}</span><small>{selections[item.id] ? optionById(selections[item.id])?.label : '—'}</small></button>)}</div>
        </details>;
      })}
    </aside>

    <main className="v26-guided-main">
      <div className="v26-guided-step-head">
        <div><span className="micro">{String(index + 1).padStart(2, '0')} / {DIRECTOR_CATEGORIES.length}</span><h2>{DIRECTOR_CATEGORIES[index]?.label}</h2><p>{DIRECTOR_CATEGORIES[index]?.description}</p></div>
        <div className="v26-visual-toggle"><button className={visual === 'camera' ? 'active' : ''} onClick={() => setVisual('camera')}><Camera size={14}/>{es ? 'Vista cámara' : 'Camera view'}</button><button className={visual === 'photo' ? 'active' : ''} onClick={() => setVisual('photo')}><ImageIcon size={14}/>{es ? 'Foto referencia' : 'Photo reference'}</button></div>
      </div>

      <VisualStage visual={visual} selections={selections} selected={selected} language={language}/>

      {recommendation && <section className="v26-guided-advice"><Sparkles size={15}/><div><span>{recommendation.confidence}% {es ? 'coincidencia' : 'match'}</span><strong>{es ? 'Vision sugiere' : 'Vision suggests'} {recommendation.primary.label}</strong><p>{recommendation.reason}</p><small>{recommendation.tradeoff}</small></div>{recommendation.primary.id !== selected.id && <button onClick={() => applyOption(recommendation.primary)}>{es ? 'Aplicar' : 'Apply'}</button>}</section>}

      <section className="v26-guided-options">
        <header><strong>{es ? 'Elige el efecto' : 'Choose the effect'}</strong><span>{es ? 'La selección actualiza el Camera View y el prompt en tiempo real.' : 'Selection updates Camera View and the prompt in real time.'}</span></header>
        <div>{options.map((option) => <button key={option.id} className={selected.id === option.id ? 'active' : ''} onClick={() => applyOption(option)}>
          <PhotoReference option={option} compact/>
          <span><strong>{option.label}</strong><small>{option.short}</small></span>
          {selected.id === option.id && <i><Check size={11}/></i>}
        </button>)}</div>
      </section>

      <section className="v26-guided-explainer">
        <div><span className="micro">QUÉ CAMBIA</span><p>{selected.effect}</p></div>
        <div><span className="micro">SENSACIÓN</span><p>{selected.feel}</p></div>
        <div><span className="micro">ÚSALO PARA</span><p>{selected.useFor}</p></div>
        <div><span className="micro">EVITA CUANDO</span><p>{selected.avoidWhen}</p></div>
      </section>

      <footer className="v26-guided-nav">
        <button disabled={index === 0} onClick={() => setCategory(prev.id)}><ChevronLeft size={15}/>{es ? 'Anterior' : 'Previous'}</button>
        <div><span>{selected.category}</span><strong>{selected.label}</strong></div>
        <button disabled={index === DIRECTOR_CATEGORIES.length - 1} onClick={() => setCategory(next.id)}>{es ? 'Siguiente' : 'Next'}<ChevronRight size={15}/></button>
      </footer>
    </main>
  </div>;
}

function StudioView({
  language,
  category,
  setCategory,
  group,
  setGroup,
  query,
  setQuery,
  selections,
  selected,
  options,
  recommendation,
  conflicts,
  applyOption,
  applyRecipe,
  visual,
  setVisual,
  onOpenCopilot,
  onOpenStudio,
}: {
  language: 'es' | 'en'; category: DirectorCategory; setCategory: (value: DirectorCategory) => void;
  group: 'camera' | 'light' | 'motion' | 'look'; setGroup: (value: 'camera' | 'light' | 'motion' | 'look') => void;
  query: string; setQuery: (value: string) => void; selections: DirectorSelections; selected: DirectorOption; options: DirectorOption[];
  recommendation?: ReturnType<typeof recommendDirectorOptions>[number]; conflicts: ReturnType<typeof detectDirectionConflicts>;
  applyOption: (option: DirectorOption) => void; applyRecipe: (values: DirectorSelections) => void; visual: VisualView; setVisual: (view: VisualView) => void;
  onOpenCopilot?: () => void; onOpenStudio?: () => void;
}) {
  const es = language === 'es';
  const categories = DIRECTOR_CATEGORIES.filter((item) => item.group === group);
  return <div className="v26-studio-layout">
    <aside className="v26-director-menu">
      <div className="v26-menu-head"><span className="micro">EXPERT STUDIO</span><strong>{es ? 'Dirección completa' : 'Full direction'}</strong></div>
      <label className="v26-search"><Search size={14}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={es ? 'Buscar opción…' : 'Search option…'}/></label>
      <nav className="v26-category-menu">{GROUPS.map((item) => <section key={item.id} className={group === item.id ? 'open' : ''}>
        <button className="v26-group-button" onClick={() => { setGroup(item.id); const first = DIRECTOR_CATEGORIES.find((entry) => entry.group === item.id); if (first) setCategory(first.id); }}><span>{es ? item.es : item.en}</span><ChevronDown size={14}/></button>
        {group === item.id && <div>{categories.map((entry) => <button key={entry.id} className={category === entry.id ? 'active' : ''} onClick={() => setCategory(entry.id)}><strong>{entry.label}</strong><small>{entry.description}</small></button>)}</div>}
      </section>)}</nav>
      <div className="v26-menu-foot">{onOpenCopilot && <button onClick={onOpenCopilot}><MessageCircle size={15}/><span>Copilot</span></button>}{onOpenStudio && <button onClick={onOpenStudio}><Sparkles size={15}/><span>Studio</span></button>}</div>
    </aside>

    <main className="v26-studio-canvas">
      <div className="v26-studio-stage-head"><div><span className="micro">{category}</span><h2>{DIRECTOR_CATEGORIES.find((item) => item.id === category)?.label}</h2></div><div className="v26-visual-toggle"><button className={visual === 'camera' ? 'active' : ''} onClick={() => setVisual('camera')}><Camera size={14}/>Camera</button><button className={visual === 'photo' ? 'active' : ''} onClick={() => setVisual('photo')}><ImageIcon size={14}/>Photo</button></div></div>
      <VisualStage visual={visual} selections={selections} selected={selected} language={language}/>
      <div className="v26-option-gallery">{options.map((option) => <button key={option.id} className={selected.id === option.id ? 'selected' : ''} onClick={() => applyOption(option)}><PhotoReference option={option} compact/><span><strong>{option.label}</strong><small>{option.short}</small></span>{selected.id === option.id && <i><Check size={11}/></i>}</button>)}</div>
    </main>

    <aside className="v26-inspector">
      <div className="v26-inspector-head"><span className="micro">CURRENT</span><h2>{selected.label}</h2><p>{selected.short}</p></div>
      <PhotoReference option={selected} compact/>
      <dl className="v26-inspector-facts"><div><dt>{es ? 'Qué cambia' : 'What changes'}</dt><dd>{selected.effect}</dd></div><div><dt>{es ? 'Sensación' : 'Feel'}</dt><dd>{selected.feel}</dd></div><div><dt>{es ? 'Úsalo para' : 'Use for'}</dt><dd>{selected.useFor}</dd></div><div><dt>{es ? 'Evítalo cuando' : 'Avoid when'}</dt><dd>{selected.avoidWhen}</dd></div></dl>
      {recommendation && <div className="v26-inspector-advice"><Sparkles size={14}/><div><strong>{es ? 'Por qué Vision lo sugiere' : 'Why Vision suggests it'}</strong><p>{recommendation.reason}</p><small>{recommendation.tradeoff}</small></div></div>}
      {conflicts.length > 0 && <section className="v26-conflict-list"><span className="micro">CONFLICTS</span>{conflicts.map((conflict) => <div key={conflict.id}><AlertTriangle size={14}/><span><strong>{conflict.title}</strong><small>{conflict.explanation}</small></span>{conflict.suggested && <button onClick={() => applyRecipe(conflict.suggested!)}>{es ? 'Corregir' : 'Fix'}</button>}</div>)}</section>}
    </aside>
  </div>;
}

export function DirectorStudioV26({ language, onOpenCopilot, onOpenStudio }: Props) {
  const es = language === 'es';
  const [mode, setMode] = useState<DirectorMode>(() => (localStorage.getItem('abrxsVisionV26Mode') as DirectorMode) || 'video');
  const [source, setSource] = useState(() => localStorage.getItem('abrxsVisionV26Source') || (es ? DEFAULT_ES : DEFAULT_EN));
  const [selections, setSelections] = useState<DirectorSelections>(loadSelections);
  const [view, setView] = useState<DirectorView>(() => (localStorage.getItem('abrxsVisionV26View') as DirectorView) || 'guided');
  const [visual, setVisual] = useState<VisualView>('camera');
  const [group, setGroup] = useState<'camera' | 'light' | 'motion' | 'look'>('camera');
  const [category, setCategory] = useState<DirectorCategory>('lens');
  const [query, setQuery] = useState('');
  const [showSource, setShowSource] = useState(true);
  const [promptOpen, setPromptOpen] = useState(false);

  const analysis = useMemo(() => analyzeDirectorSource(source, mode), [source, mode]);
  const recommendations = useMemo(() => recommendDirectorOptions(source, mode, analysis), [source, mode, analysis]);
  const recipes = useMemo(() => recommendPresets(source, mode, 4), [source, mode]);
  const conflicts = useMemo(() => detectDirectionConflicts(analysis, mode, selections), [analysis, mode, selections]);
  const compiled = useMemo(() => compileDirectorPrompt({ sourceText: source, mode, selections }), [source, mode, selections]);
  const anatomySegments = useMemo(() => anatomizePromptV25(compiled.prompt), [compiled.prompt]);
  const recommendation = recommendations.find((item) => item.category === category);
  const allOptions = optionsFor(category);
  const options = allOptions.filter((option) => !query.trim() || `${option.label} ${option.short} ${option.effect}`.toLowerCase().includes(query.toLowerCase()));
  const selected = optionById(selections[category]) ?? recommendation?.primary ?? allOptions[0];

  const applyOption = (option: DirectorOption) => {
    const next = { ...selections, [option.category]: option.id };
    setSelections(next);
    localStorage.setItem('abrxsVisionV26Selections', JSON.stringify(next));
  };

  const applyRecipe = (values: DirectorSelections) => {
    const next = { ...selections, ...values };
    setSelections(next);
    localStorage.setItem('abrxsVisionV26Selections', JSON.stringify(next));
  };

  const selectMode = (next: DirectorMode) => {
    setMode(next);
    localStorage.setItem('abrxsVisionV26Mode', next);
  };

  const selectView = (next: DirectorView) => {
    setView(next);
    localStorage.setItem('abrxsVisionV26View', next);
  };

  if (!selected) return null;

  return <section className={`v26-director-root view-${view}`}>
    <header className="v26-director-commandbar">
      <div className="v26-command-left"><ModeSwitch mode={mode} onChange={selectMode} language={language}/></div>
      <div className="v26-view-switch" aria-label={es ? 'Vista del Director' : 'Director view'}>
        <button className={view === 'guided' ? 'active' : ''} onClick={() => selectView('guided')}><WandSparkles size={14}/><span>Guided</span><small>{es ? 'recomendado' : 'recommended'}</small></button>
        <button className={view === 'cinema' ? 'active' : ''} onClick={() => selectView('cinema')}><Camera size={14}/><span>Cinema Columns</span></button>
        <button className={view === 'studio' ? 'active' : ''} onClick={() => selectView('studio')}><SlidersHorizontal size={14}/><span>Studio</span></button>
      </div>
      <div className="v26-command-actions"><button onClick={() => setShowSource((value) => !value)}>Source</button><button className={promptOpen ? 'active' : ''} onClick={() => setPromptOpen((value) => !value)}><MonitorUp size={14}/>Prompt</button></div>
    </header>

    {showSource && <section className="v26-source-composer v26-source-top">
      <div className="v26-source-main"><textarea value={source} onChange={(event) => { setSource(event.target.value); localStorage.setItem('abrxsVisionV26Source', event.target.value); }} rows={3}/><div className="v26-source-actions"><button onClick={() => { const value = es ? DEFAULT_ES : DEFAULT_EN; setSource(value); localStorage.setItem('abrxsVisionV26Source', value); }}>{es ? 'Ejemplo' : 'Example'}</button>{onOpenCopilot && <button onClick={onOpenCopilot}><WandSparkles size={14}/>{es ? 'Ayúdame' : 'Help me'}</button>}</div></div>
      <div className="v26-source-readout"><span className="micro">VISION UNDERSTOOD</span><strong>{analysis.intent}</strong><small>{analysis.visualPriorities.join(' · ')}</small><div>{analysis.semanticTags.slice(0, 6).map((tag) => <span key={tag}>{tag}</span>)}</div></div>
    </section>}

    {view === 'guided' && <>
      <section className="v26-recipe-strip v26-recipe-top"><div><span className="micro">SUGGESTED RECIPES</span><strong>{es ? 'Atajo opcional' : 'Optional shortcut'}</strong></div><div className="v26-recipe-scroll">{recipes.map((recipe) => <button key={recipe.id} onClick={() => applyRecipe(recipe.values)}><Sparkles size={13}/><span><strong>{recipe.label}</strong><small>{recipe.description}</small></span></button>)}</div></section>
      <GuidedView language={language} category={category} setCategory={setCategory} selections={selections} selected={selected} options={options} recommendation={recommendation} applyOption={applyOption} visual={visual} setVisual={setVisual}/>
    </>}

    {view === 'cinema' && <CinemaColumnsV26 language={language} selections={selections} onApply={applyOption} embedded/>}

    {view === 'studio' && <StudioView language={language} category={category} setCategory={setCategory} group={group} setGroup={setGroup} query={query} setQuery={setQuery} selections={selections} selected={selected} options={options} recommendation={recommendation} conflicts={conflicts} applyOption={applyOption} applyRecipe={applyRecipe} visual={visual} setVisual={setVisual} onOpenCopilot={onOpenCopilot} onOpenStudio={onOpenStudio}/>} 

    <PromptMonitorV26 language={language} prompt={compiled.prompt} segments={anatomySegments} open={promptOpen} onClose={() => setPromptOpen(false)}/>
  </section>;
}
