import {
  AlertTriangle,
  Check,
  ChevronDown,
  Copy,
  Image as ImageIcon,
  Info,
  Layers3,
  MessageCircle,
  Search,
  Sparkles,
  Video,
  WandSparkles,
} from 'lucide-react';
import { useMemo, useState, type CSSProperties } from 'react';
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
import {
  analyzeDirectorSource,
  anatomyGroup,
  detectDirectionConflicts,
  recommendDirectorOptions,
} from './v26Core';
import {
  isDepthCategory,
  isMotionCategory,
  photographicStyle,
  sceneForCategory,
} from './referenceMediaV26';

type Props = {
  language: 'es' | 'en';
  onOpenCopilot?: () => void;
  onOpenStudio?: () => void;
};

const DEFAULT_ES = 'Un decisor compara tres propuestas visualmente equivalentes sobre una mesa real. Mira una, luego otra, duda y retira la mano sin elegir. La escena debe mostrar que el problema no es tener pocas opciones, sino no tener un criterio claro.';
const DEFAULT_EN = 'A decision-maker compares three visually equivalent proposals on a real work table. They look from one to another, hesitate, then withdraw their hand without choosing. The scene should show that the problem is not too few options but the lack of a clear criterion.';

const GROUPS: Array<{ id: 'camera' | 'light' | 'motion' | 'look'; es: string; en: string }> = [
  { id: 'camera', es: 'Cámara', en: 'Camera' },
  { id: 'light', es: 'Luz y color', en: 'Light & color' },
  { id: 'motion', es: 'Movimiento', en: 'Motion' },
  { id: 'look', es: 'Look y FX', en: 'Look & FX' },
];

const ANATOMY_COLORS: Record<string, string> = {
  intent:'#c49aee', subject:'#75d7e7', action:'#f0a66d', scene:'#70c9b4', shot:'#8bb6ff', camera:'#8bb6ff',
  angle:'#8bb6ff', lens:'#8ed29a', aperture:'#8ed29a', focus:'#8ed29a', shutter:'#7bbbd5', frameRate:'#7bbbd5',
  whiteBalance:'#efc36f', lighting:'#efc36f', composition:'#80a9ef', movement:'#ee9b64', subjectMotion:'#ee9b64',
  environmentMotion:'#d59e72', look:'#d79cd0', atmosphere:'#78b8b0', material:'#c5a27a', fx:'#e48b9c', output:'#aab4c5',
};

function loadSelections(): DirectorSelections {
  try {
    const raw = localStorage.getItem('abrxsVisionV26Selections');
    return raw ? JSON.parse(raw) as DirectorSelections : {};
  } catch {
    return {};
  }
}

function PhotoReference({ option, compact = false }: { option: DirectorOption; compact?: boolean }) {
  const scene = sceneForCategory(option.category);
  const style = photographicStyle(option) as CSSProperties;
  const depth = isDepthCategory(option.category);
  const motion = isMotionCategory(option.category);
  const light = option.preview.light ?? 'front';
  const position = scene.objectPosition ?? '50% 50%';

  return <div className={`v26-photo-ref ${compact ? 'compact' : ''}`} style={style} data-category={option.category} data-light={light}>
    <img className={`v26-photo-base ${depth ? 'depth' : ''}`} src={scene.url} alt={`${option.label} photographic reference`} style={{ objectPosition: position }}/>
    {depth && <img className="v26-photo-focus" src={scene.url} alt="" aria-hidden="true" style={{ objectPosition: position }}/>} 
    <div className="v26-photo-temperature"/>
    <div className="v26-photo-light"/>
    <div className="v26-photo-haze"/>
    <div className="v26-photo-grain"/>
    <div className="v26-photo-bloom"/>
    {option.category === 'composition' && <div className="v26-photo-grid"/>}
    {motion && <div className="v26-photo-motion"><span>→</span></div>}
    {!compact && <div className="v26-photo-meta"><span>PHOTO REF</span><small>{scene.credit}</small></div>}
  </div>;
}

function StageCard({ option, selected, es, onApply }: { option: DirectorOption; selected?: boolean; es: boolean; onApply?: () => void }) {
  return <article className={`v26-stage-card ${selected ? 'selected' : ''}`}>
    <PhotoReference option={option}/>
    <div className="v26-stage-copy">
      <div><span>{selected ? (es ? 'Dirección actual' : 'Current direction') : (es ? 'Comparar con' : 'Compare with')}</span><strong>{option.label}</strong></div>
      <p>{option.effect}</p>
      <small>{option.feel}</small>
      {onApply && <button className="v26-primary" type="button" onClick={onApply}><Check size={14}/>{es ? 'Aplicar esta opción' : 'Apply this option'}</button>}
    </div>
  </article>;
}

export function DirectorStudioV26({ language, onOpenCopilot, onOpenStudio }: Props) {
  const es = language === 'es';
  const [mode, setMode] = useState<DirectorMode>(() => (localStorage.getItem('abrxsVisionV26Mode') as DirectorMode) || 'video');
  const [source, setSource] = useState(() => localStorage.getItem('abrxsVisionV26Source') || (es ? DEFAULT_ES : DEFAULT_EN));
  const [selections, setSelections] = useState<DirectorSelections>(loadSelections);
  const [group, setGroup] = useState<'camera' | 'light' | 'motion' | 'look'>('camera');
  const [category, setCategory] = useState<DirectorCategory>('lens');
  const [compareId, setCompareId] = useState('');
  const [query, setQuery] = useState('');
  const [showSource, setShowSource] = useState(true);
  const [showOutput, setShowOutput] = useState(false);

  const analysis = useMemo(() => analyzeDirectorSource(source, mode), [source, mode]);
  const recommendations = useMemo(() => recommendDirectorOptions(source, mode, analysis), [source, mode, analysis]);
  const recipes = useMemo(() => recommendPresets(source, mode, 4), [source, mode]);
  const conflicts = useMemo(() => detectDirectionConflicts(analysis, mode, selections), [analysis, mode, selections]);
  const compiled = useMemo(() => compileDirectorPrompt({ sourceText: source, mode, selections }), [source, mode, selections]);
  const anatomySegments = useMemo(() => anatomizePromptV25(compiled.prompt), [compiled.prompt]);

  const categories = DIRECTOR_CATEGORIES.filter((item) => item.group === group);
  const options = optionsFor(category).filter((option) => !query.trim() || `${option.label} ${option.short} ${option.effect}`.toLowerCase().includes(query.toLowerCase()));
  const categoryRecommendation = recommendations.find((item) => item.category === category);
  const selected = optionById(selections[category]) ?? categoryRecommendation?.primary ?? optionsFor(category)[0];
  const compare = optionById(compareId) ?? categoryRecommendation?.alternatives[0] ?? optionsFor(category).find((item) => item.id !== selected?.id) ?? selected;

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

  const updateSource = (value: string) => {
    setSource(value);
    localStorage.setItem('abrxsVisionV26Source', value);
  };

  return <section className="v26-director-app">
    <aside className="v26-director-menu">
      <div className="v26-menu-head"><span className="micro">VISION DIRECTOR</span><strong>{es ? 'Dirección' : 'Direction'}</strong></div>

      <div className="v26-mode-switch">
        <button className={mode === 'image' ? 'active' : ''} onClick={() => selectMode('image')}><ImageIcon size={15}/><span>{es ? 'Imagen' : 'Image'}</span></button>
        <button className={mode === 'video' ? 'active' : ''} onClick={() => selectMode('video')}><Video size={15}/><span>Video</span></button>
        <button className={mode === 'xroll' ? 'active' : ''} onClick={() => selectMode('xroll')}><Layers3 size={15}/><span>XRoll</span></button>
      </div>

      <label className="v26-search"><Search size={14}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={es ? 'Buscar opción…' : 'Search option…'}/></label>

      <nav className="v26-category-menu">
        {GROUPS.map((item) => <section key={item.id} className={group === item.id ? 'open' : ''}>
          <button className="v26-group-button" type="button" onClick={() => {
            setGroup(item.id);
            const first = DIRECTOR_CATEGORIES.find((entry) => entry.group === item.id);
            if (first) setCategory(first.id);
          }}><span>{es ? item.es : item.en}</span><ChevronDown size={14}/></button>
          {group === item.id && <div>{categories.map((entry) => <button key={entry.id} className={category === entry.id ? 'active' : ''} type="button" onClick={() => { setCategory(entry.id); setCompareId(''); }}><strong>{entry.label}</strong><small>{entry.description}</small></button>)}</div>}
        </section>)}
      </nav>

      <div className="v26-menu-foot">
        {onOpenCopilot && <button onClick={onOpenCopilot}><MessageCircle size={15}/><span>Copilot</span></button>}
        {onOpenStudio && <button onClick={onOpenStudio}><Sparkles size={15}/><span>{es ? 'Producción' : 'Production'}</span></button>}
      </div>
    </aside>

    <main className="v26-creative-canvas">
      <header className="v26-canvas-topbar">
        <div><span className="micro">{category}</span><h1>{DIRECTOR_CATEGORIES.find((entry) => entry.id === category)?.label}</h1></div>
        <div className="v26-canvas-actions"><button type="button" onClick={() => setShowSource((value) => !value)}>Source</button><button type="button" onClick={() => setShowOutput((value) => !value)}>Prompt</button></div>
      </header>

      {showSource && <section className="v26-source-composer">
        <div className="v26-source-main">
          <textarea value={source} onChange={(event) => updateSource(event.target.value)} rows={3} placeholder={es ? 'Describe la escena o pega el guion…' : 'Describe the scene or paste the script…'}/>
          <div className="v26-source-actions"><button onClick={() => updateSource(es ? DEFAULT_ES : DEFAULT_EN)}>{es ? 'Ejemplo' : 'Example'}</button>{onOpenCopilot && <button onClick={onOpenCopilot}><WandSparkles size={14}/>{es ? 'Ayúdame' : 'Help me'}</button>}</div>
        </div>
        <div className="v26-source-readout"><span className="micro">VISION UNDERSTOOD</span><strong>{analysis.intent}</strong><small>{analysis.visualPriorities.join(' · ')}</small><div>{analysis.semanticTags.slice(0, 5).map((tag) => <span key={tag}>{tag}</span>)}</div></div>
      </section>}

      <section className="v26-recipe-strip">
        <div><span className="micro">SUGGESTED LOOKS</span><strong>{es ? 'Empieza con una receta' : 'Start with a recipe'}</strong></div>
        <div className="v26-recipe-scroll">{recipes.map((recipe) => <button key={recipe.id} type="button" onClick={() => applyRecipe(recipe.values)}><Sparkles size={13}/><span><strong>{recipe.label}</strong><small>{recipe.description}</small></span></button>)}</div>
      </section>

      {selected && compare && <section className="v26-reference-stage">
        <header><div><span className="micro">REAL VISUAL REFERENCES</span><h2>{es ? 'Compara antes de aplicar' : 'Compare before applying'}</h2></div><span className="v26-fidelity"><Info size={12}/>{es ? 'Foto real + aproximación del efecto' : 'Real photo + effect approximation'}</span></header>
        <div className="v26-stage-grid"><StageCard option={selected} selected es={es}/><div className="v26-vs">VS</div><StageCard option={compare} es={es} onApply={() => applyOption(compare)}/></div>
      </section>}

      <section className="v26-options-area">
        <header><div><span className="micro">{categoryRecommendation ? `${categoryRecommendation.confidence}% MATCH` : 'OPTIONS'}</span><h2>{es ? 'Elige viendo el resultado' : 'Choose by seeing the result'}</h2></div>{categoryRecommendation && <p>{categoryRecommendation.reason}</p>}</header>
        <div className="v26-option-gallery">{options.map((option) => <button key={option.id} className={selected?.id === option.id ? 'selected' : ''} type="button" onClick={() => setCompareId(option.id)}>
          <PhotoReference option={option} compact/>
          <span><strong>{option.label}</strong><small>{option.short}</small></span>
          {selected?.id === option.id && <i><Check size={11}/></i>}
        </button>)}</div>
      </section>

      {showOutput && <section className="v26-output-drawer">
        <header><div><span className="micro">ABRAXAS PRODUCTION PROMPT</span><strong>{es ? 'Prompt compilado' : 'Compiled prompt'}</strong></div><button onClick={() => navigator.clipboard.writeText(compiled.prompt)}><Copy size={14}/>{es ? 'Copiar' : 'Copy'}</button></header>
        <div className="v26-anatomy-text">{anatomySegments.map((segment, index) => <span key={`${index}-${segment.category}`} style={{ textDecorationColor: ANATOMY_COLORS[segment.category] ?? '#7c8490' }} title={anatomyGroup(segment.category)}>{segment.text}</span>)}</div>
      </section>}
    </main>

    <aside className="v26-inspector">
      {selected && <>
        <div className="v26-inspector-head"><span className="micro">CURRENT</span><h2>{selected.label}</h2><p>{selected.short}</p></div>
        <PhotoReference option={selected} compact/>
        <dl className="v26-inspector-facts"><div><dt>{es ? 'Qué cambia' : 'What changes'}</dt><dd>{selected.effect}</dd></div><div><dt>{es ? 'Sensación' : 'Feel'}</dt><dd>{selected.feel}</dd></div><div><dt>{es ? 'Úsalo para' : 'Use for'}</dt><dd>{selected.useFor}</dd></div><div><dt>{es ? 'Evítalo cuando' : 'Avoid when'}</dt><dd>{selected.avoidWhen}</dd></div></dl>
        {categoryRecommendation && <div className="v26-inspector-advice"><Sparkles size={14}/><div><strong>{es ? 'Por qué Vision lo sugiere' : 'Why Vision suggests it'}</strong><p>{categoryRecommendation.reason}</p><small>{categoryRecommendation.tradeoff}</small></div></div>}
        <button className="v26-primary v26-apply-current" type="button" onClick={() => applyOption(selected)}><Check size={15}/>{es ? 'Aplicar dirección' : 'Apply direction'}</button>
        <div className="v26-prompt-language"><span className="micro">PROMPT LANGUAGE</span><code>{selected.prompt}</code></div>
      </>}

      {conflicts.length > 0 && <section className="v26-conflict-list"><span className="micro">CONFLICTS</span>{conflicts.map((conflict) => <div key={conflict.id}><AlertTriangle size={14}/><span><strong>{conflict.title}</strong><small>{conflict.explanation}</small></span>{conflict.suggested && <button onClick={() => applyRecipe(conflict.suggested!)}>{es ? 'Corregir' : 'Fix'}</button>}</div>)}</section>}
    </aside>
  </section>;
}
