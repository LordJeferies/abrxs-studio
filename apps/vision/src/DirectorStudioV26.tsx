import {
  AlertTriangle,
  Check,
  ChevronRight,
  Columns2,
  Copy,
  Eye,
  EyeOff,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Layers3,
  MessageCircle,
  Sparkles,
  Video,
  WandSparkles,
  X,
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

type Props = {
  language: 'es' | 'en';
  onOpenCopilot?: () => void;
  onOpenStudio?: () => void;
};

const DEFAULT_ES = 'Un decisor compara tres propuestas visualmente equivalentes sobre una mesa real. Mira una, luego otra, duda y retira la mano sin elegir. La escena debe mostrar que el problema no es tener pocas opciones, sino no tener un criterio claro.';
const DEFAULT_EN = 'A decision-maker compares three visually equivalent proposals on a real work table. They look from one to another, hesitate, then withdraw their hand without choosing. The scene should show that the problem is not too few options but the lack of a clear criterion.';

const COLORS: Record<string, string> = {
  intent:'#c49aee', subject:'#75d7e7', action:'#f0a66d', scene:'#70c9b4',
  shot:'#8bb6ff', camera:'#8bb6ff', angle:'#8bb6ff', lens:'#8ed29a', aperture:'#8ed29a', focus:'#8ed29a',
  shutter:'#7bbbd5', frameRate:'#7bbbd5', whiteBalance:'#efc36f', lighting:'#efc36f', composition:'#80a9ef',
  movement:'#ee9b64', subjectMotion:'#ee9b64', environmentMotion:'#d59e72', look:'#d79cd0', atmosphere:'#78b8b0',
  material:'#c5a27a', fx:'#e48b9c', continuity:'#b9a6db', constraints:'#e58f8f', text:'#df9fcf', output:'#aab4c5',
};

const GROUPS: Array<{ id: 'camera' | 'light' | 'motion' | 'look'; es: string; en: string }> = [
  { id:'camera', es:'Cámara', en:'Camera' },
  { id:'light', es:'Luz / color', en:'Light / color' },
  { id:'motion', es:'Movimiento', en:'Motion' },
  { id:'look', es:'Look / FX', en:'Look / FX' },
];

function loadSelections(): DirectorSelections {
  try {
    const raw = localStorage.getItem('abrxsVisionV26Selections');
    return raw ? JSON.parse(raw) as DirectorSelections : {};
  } catch {
    return {};
  }
}

function saveSelections(value: DirectorSelections) {
  localStorage.setItem('abrxsVisionV26Selections', JSON.stringify(value));
}

function Preview({ option, large = false }: { option: DirectorOption; large?: boolean }) {
  const p = option.preview;
  const style = {
    '--v26-subject-scale': String(p.subjectScale ?? 1),
    '--v26-subject-x': `${p.subjectX ?? 0}%`,
    '--v26-subject-y': `${p.subjectY ?? 0}%`,
    '--v26-bg-scale': String(p.backgroundScale ?? 1),
    '--v26-blur': `${Math.round((p.blur ?? 0) * 18)}px`,
    '--v26-contrast': String(p.contrast ?? 1),
    '--v26-warmth': String(p.warmth ?? 0),
    '--v26-haze': String(p.haze ?? 0),
    '--v26-grain': String(p.grain ?? 0),
    '--v26-bloom': String(p.bloom ?? 0),
  } as CSSProperties;

  return <div
    className={`v26-preview ${large ? 'large' : ''}`}
    style={style}
    data-category={option.category}
    data-light={p.light ?? 'front'}
    data-motion={p.motion ?? 'none'}
  >
    <div className="v26-room back"/>
    <div className="v26-room side"/>
    <div className="v26-window"/>
    <div className="v26-desk"><i/><i/><i/></div>
    <div className="v26-person"><i/><b/></div>
    <div className="v26-focus-plane"/>
    <div className="v26-grid-lines"/>
    <div className="v26-light-field"/>
    <div className="v26-motion-arrow">→</div>
    <div className="v26-atmosphere"/>
    <div className="v26-film-grain"/>
    <div className="v26-bloom"/>
  </div>;
}

function HelpSheet({ es, onClose }: { es: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'do' | 'like' | 'example'>('do');
  return <div className="v26-help-overlay" role="dialog" aria-modal="true">
    <button className="v26-help-backdrop" type="button" onClick={onClose} aria-label="Close"/>
    <article className="v26-help-sheet">
      <header>
        <div><span className="micro">VISION V2.6 · GUIDE</span><h2>{es ? '¿Qué hago aquí?' : 'What do I do here?'}</h2></div>
        <button type="button" onClick={onClose}><X size={18}/></button>
      </header>
      <nav>
        <button className={tab === 'do' ? 'active' : ''} onClick={() => setTab('do')}>{es ? 'Qué hacer' : 'What to do'}</button>
        <button className={tab === 'like' ? 'active' : ''} onClick={() => setTab('like')}>{es ? 'A qué se parece' : 'What it resembles'}</button>
        <button className={tab === 'example' ? 'active' : ''} onClick={() => setTab('example')}>{es ? 'Ejemplo' : 'Example'}</button>
      </nav>
      {tab === 'do' && <section>
        <ol>
          <li>{es ? 'Pega una idea, guion, escena o prompt normal.' : 'Paste a normal idea, script, scene or prompt.'}</li>
          <li>{es ? 'Revisa qué entendió Vision del Source Truth.' : 'Review what Vision understood from Source Truth.'}</li>
          <li>{es ? 'Mira las recomendaciones y sus tradeoffs.' : 'Inspect recommendations and their tradeoffs.'}</li>
          <li>{es ? 'Compara visualmente antes de aplicar.' : 'Compare visually before applying.'}</li>
          <li>{es ? 'Revisa Prompt Anatomy y compila para tu target.' : 'Review Prompt Anatomy and compile for your target.'}</li>
        </ol>
        <p>{es ? 'Vision propone. Tú decides. Nada debe cambiar silenciosamente.' : 'Vision proposes. You decide. Nothing should change silently.'}</p>
      </section>}
      {tab === 'like' && <section className="v26-like-list">
        <div><strong>Higgsfield Cinema Studio</strong><span>{es ? 'Decisiones de cámara, focal y estilo.' : 'Camera, focal length and style decisions.'}</span></div>
        <div><strong>Magnific</strong><span>{es ? 'Selección visual y comparaciones.' : 'Visual selection and comparisons.'}</span></div>
        <div><strong>Creativly</strong><span>{es ? 'Referencias con roles y flujo visual.' : 'Role-based references and visual workflow.'}</span></div>
        <div><strong>OpenChatCut</strong><span>{es ? 'Comparación consistente de efectos.' : 'Consistent effect comparison.'}</span></div>
        <div className="abrxs"><strong>ABRAXAS</strong><span>{es ? 'Añade Source Truth, trazabilidad, aprobación humana y compilación multi-target.' : 'Adds Source Truth, traceability, human approval and multi-target compilation.'}</span></div>
      </section>}
      {tab === 'example' && <section>
        <code>{es ? '“Un decisor compara tres propuestas y no logra elegir.”' : '“A decision-maker compares three proposals and cannot choose.”'}</code>
        <p>{es ? 'Vision detecta conflicto de decisión, protege rostro + manos + propuestas, y te deja comparar focal, encuadre, luz y movimiento antes de aplicar.' : 'Vision detects decision conflict, protects face + hands + proposals, and lets you compare focal length, framing, light and motion before applying.'}</p>
      </section>}
    </article>
  </div>;
}

export function DirectorStudioV26({ language, onOpenCopilot, onOpenStudio }: Props) {
  const es = language === 'es';
  const [mode, setMode] = useState<DirectorMode>(() => (localStorage.getItem('abrxsVisionV26Mode') as DirectorMode) || 'video');
  const [source, setSource] = useState(() => localStorage.getItem('abrxsVisionV26Source') || (es ? DEFAULT_ES : DEFAULT_EN));
  const [selections, setSelections] = useState<DirectorSelections>(loadSelections);
  const [group, setGroup] = useState<'camera' | 'light' | 'motion' | 'look'>('camera');
  const [category, setCategory] = useState<DirectorCategory>('lens');
  const [anatomy, setAnatomy] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const [compareId, setCompareId] = useState<string>('');

  const analysis = useMemo(() => analyzeDirectorSource(source, mode), [source, mode]);
  const recommendations = useMemo(() => recommendDirectorOptions(source, mode, analysis), [source, mode, analysis]);
  const recipes = useMemo(() => recommendPresets(source, mode, 3), [source, mode]);
  const conflicts = useMemo(() => detectDirectionConflicts(analysis, mode, selections), [analysis, mode, selections]);
  const compiled = useMemo(() => compileDirectorPrompt({ sourceText: source, mode, selections }), [source, mode, selections]);
  const anatomySegments = useMemo(() => anatomizePromptV25(compiled.prompt), [compiled.prompt]);

  const categories = DIRECTOR_CATEGORIES.filter((item) => item.group === group);
  const options = optionsFor(category);
  const resolvedId = compiled.selections[category];
  const selected = optionById(resolvedId) ?? options[0];
  const categoryRecommendation = recommendations.find((item) => item.category === category);
  const compare = optionById(compareId) ?? categoryRecommendation?.alternatives[0] ?? options.find((item) => item.id !== selected?.id) ?? selected;

  const applyOption = (option: DirectorOption) => {
    const next = { ...selections, [option.category]: option.id };
    setSelections(next);
    saveSelections(next);
  };

  const applyRecipe = (values: DirectorSelections) => {
    const next = { ...selections, ...values };
    setSelections(next);
    saveSelections(next);
  };

  const selectMode = (next: DirectorMode) => {
    setMode(next);
    localStorage.setItem('abrxsVisionV26Mode', next);
  };

  const updateSource = (value: string) => {
    setSource(value);
    localStorage.setItem('abrxsVisionV26Source', value);
  };

  const goToAnatomy = (segmentCategory: string) => {
    const found = DIRECTOR_CATEGORIES.find((item) => item.id === segmentCategory);
    if (!found) return;
    setGroup(found.group);
    setCategory(found.id);
  };

  return <section className="v26-shell">
    <header className="v26-head">
      <div>
        <span className="micro">ABRAXS VISION V2.6 · DIRECTOR INTELLIGENCE</span>
        <h1>{es ? 'Entiende → mira → compara → decide → compila.' : 'Understand → see → compare → decide → compile.'}</h1>
        <p>{es ? 'Pega Source Truth. Vision analiza la intención, propone decisiones explicadas y te enseña qué cambia antes de aplicarlas.' : 'Paste Source Truth. Vision analyses intent, proposes explainable decisions and shows what changes before you apply them.'}</p>
      </div>
      <div className="v26-head-actions">
        <button className="v26-help-trigger" type="button" onClick={() => setHelpOpen(true)}><HelpCircle size={15}/>{es ? '¿Qué hago aquí?' : 'What do I do here?'}</button>
        <div className="v26-mode">
          <button className={mode === 'image' ? 'active' : ''} onClick={() => selectMode('image')}><ImageIcon size={14}/>{es ? 'Imagen' : 'Image'}</button>
          <button className={mode === 'video' ? 'active' : ''} onClick={() => selectMode('video')}><Video size={14}/>Video</button>
          <button className={mode === 'xroll' ? 'active' : ''} onClick={() => selectMode('xroll')}><Layers3 size={14}/>XRoll</button>
        </div>
      </div>
    </header>

    <div className="v26-source-grid">
      <section className="v26-source-panel">
        <div className="v26-panel-title"><span className="micro">01 · SOURCE TRUTH</span><strong>{es ? 'Escribe qué debe ocurrir' : 'Write what must happen'}</strong></div>
        <textarea value={source} onChange={(event) => updateSource(event.target.value)} placeholder={es ? 'Idea, guion, escena, prompt débil o texto de una ficha…' : 'Idea, script, scene, weak prompt or ficha text…'}/>
        <footer>
          <span>{source.length} chars</span>
          <div>
            <button onClick={() => updateSource(es ? DEFAULT_ES : DEFAULT_EN)}>{es ? 'Ejemplo' : 'Example'}</button>
            {onOpenCopilot && <button onClick={onOpenCopilot}><MessageCircle size={13}/>{es ? 'Copilot' : 'Copilot'}</button>}
          </div>
        </footer>
      </section>

      <section className="v26-understanding-panel">
        <div className="v26-panel-title"><span className="micro">02 · VISION UNDERSTANDING</span><strong>{analysis.intent}</strong></div>
        <dl>
          <div><dt>{es ? 'Sujeto' : 'Subject'}</dt><dd>{analysis.subjects.join(' · ')}</dd></div>
          <div><dt>{es ? 'Acción' : 'Action'}</dt><dd>{analysis.actions.join(' → ')}</dd></div>
          <div><dt>{es ? 'Prioridad visual' : 'Visual priority'}</dt><dd>{analysis.visualPriorities.join(' · ')}</dd></div>
          <div><dt>{es ? 'Tono' : 'Tone'}</dt><dd>{analysis.tone.join(' · ')}</dd></div>
        </dl>
        <div className="v26-tags">{analysis.semanticTags.slice(0, 8).map((tag) => <span key={tag}>{tag}</span>)}</div>
        <p className="v26-proposal-note"><Sparkles size={13}/>{es ? 'Esto es una interpretación. Source Truth no se modifica.' : 'This is an interpretation. Source Truth is not modified.'}</p>
      </section>
    </div>

    <section className="v26-recommendations">
      <header>
        <div><span className="micro">03 · SUGGESTED DIRECTION</span><h2>{es ? 'Sugerencias para este texto' : 'Suggestions for this text'}</h2></div>
        <small>{es ? 'Razón + tradeoff + alternativa. Tú aplicas.' : 'Reason + tradeoff + alternative. You apply.'}</small>
      </header>
      <div className="v26-recommendation-row">
        {recommendations.filter((item) => ['shot','lens','composition','lighting','movement','look'].includes(item.category)).map((item) => <button key={item.category} onClick={() => { const found = DIRECTOR_CATEGORIES.find((c) => c.id === item.category); if (found) { setGroup(found.group); setCategory(found.id); } }}>
          <span>{DIRECTOR_CATEGORIES.find((c) => c.id === item.category)?.label}</span>
          <strong>{item.primary.label}</strong>
          <b>{item.confidence}%</b>
          <small>{item.reason}</small>
          <i>{item.tradeoff}</i>
          <ChevronRight size={13}/>
        </button>)}
      </div>
      <div className="v26-recipe-row">
        {recipes.map((recipe) => <button key={recipe.id} onClick={() => applyRecipe(recipe.values)}><WandSparkles size={13}/><span><strong>{recipe.label}</strong><small>{recipe.description}</small></span></button>)}
      </div>
    </section>

    {conflicts.length > 0 && <section className="v26-conflicts">
      {conflicts.map((conflict) => <div key={conflict.id}><AlertTriangle size={15}/><span><strong>{conflict.title}</strong><small>{conflict.explanation}</small></span>{conflict.suggested && <button onClick={() => applyRecipe(conflict.suggested!)}>{es ? 'Aplicar sugerencia' : 'Apply suggestion'}</button>}</div>)}
    </section>}

    <section className="v26-director">
      <header>
        <div><span className="micro">04 · VISUAL DIRECTOR</span><h2>{es ? 'Selecciona viendo qué cambia.' : 'Choose by seeing what changes.'}</h2></div>
        <span className="v26-fidelity"><Info size={12}/>EDUCATIONAL APPROXIMATION</span>
      </header>

      <div className="v26-group-tabs">{GROUPS.map((item) => <button key={item.id} className={group === item.id ? 'active' : ''} onClick={() => { setGroup(item.id); const first = DIRECTOR_CATEGORIES.find((entry) => entry.group === item.id); if (first) setCategory(first.id); }}>{es ? item.es : item.en}</button>)}</div>
      <div className="v26-category-tabs">{categories.map((item) => <button key={item.id} className={category === item.id ? 'active' : ''} onClick={() => setCategory(item.id)}><strong>{item.label}</strong><span>{item.description}</span></button>)}</div>

      {selected && compare && <div className="v26-stage">
        <article className="v26-stage-card selected">
          <div className="v26-stage-label"><span>{es ? 'Actual' : 'Current'}</span><strong>{selected.label}</strong></div>
          <Preview option={selected} large/>
          <div className="v26-stage-explain"><p>{selected.effect}</p><small>{selected.feel}</small></div>
        </article>
        <div className="v26-vs"><Columns2 size={15}/><span>VS</span></div>
        <article className="v26-stage-card">
          <div className="v26-stage-label"><span>{es ? 'Comparar' : 'Compare'}</span><strong>{compare.label}</strong></div>
          <Preview option={compare} large/>
          <div className="v26-stage-explain"><p>{compare.effect}</p><small>{compare.feel}</small></div>
          <button className="v26-apply" onClick={() => applyOption(compare)}>{es ? 'Aplicar' : 'Apply'} {compare.label}</button>
        </article>
      </div>}

      {categoryRecommendation && <div className="v26-why">
        <div><span className="micro">VISION SUGGESTS</span><strong>{categoryRecommendation.primary.label}</strong><p>{categoryRecommendation.reason}</p></div>
        <div><span className="micro">TRADEOFF</span><p>{categoryRecommendation.tradeoff}</p></div>
        <button onClick={() => applyOption(categoryRecommendation.primary)}><Sparkles size={13}/>{es ? 'Aplicar sugerencia' : 'Apply suggestion'}</button>
      </div>}

      <div className="v26-option-rail">
        {options.map((option) => <button key={option.id} className={resolvedId === option.id ? 'selected' : ''} onClick={() => { if (option.id === resolvedId) return; setCompareId(option.id); }}>
          <Preview option={option}/>
          <strong>{option.label}</strong>
          <span>{option.short}</span>
          {categoryRecommendation?.primary.id === option.id && <i>VISION</i>}
        </button>)}
      </div>

      {compare && <section className="v26-learn-card">
        <div><span className="micro">{category}</span><h3>{compare.label}</h3><p>{compare.effect}</p></div>
        <dl>
          <div><dt>{es ? 'Sensación' : 'Feel'}</dt><dd>{compare.feel}</dd></div>
          <div><dt>{es ? 'Úsalo' : 'Use for'}</dt><dd>{compare.useFor}</dd></div>
          <div><dt>{es ? 'Evita' : 'Avoid when'}</dt><dd>{compare.avoidWhen}</dd></div>
          <div><dt>{es ? 'Prompt' : 'Prompt'}</dt><dd><code>{compare.prompt}</code></dd></div>
        </dl>
      </section>}
    </section>

    <section className="v26-output">
      <header>
        <div><span className="micro">05 · ABRAXAS OUTPUT</span><h2>{es ? 'Prompt dirigido' : 'Directed prompt'}</h2></div>
        <div className="v26-output-actions">
          <button onClick={() => setAnatomy((value) => !value)}>{anatomy ? <EyeOff size={13}/> : <Eye size={13}/>}Anatomy</button>
          <button onClick={() => navigator.clipboard.writeText(compiled.prompt)}><Copy size={13}/>{es ? 'Copiar' : 'Copy'}</button>
          {onOpenStudio && <button className="primary" onClick={onOpenStudio}><Sparkles size={13}/>{es ? 'Producción' : 'Production'}</button>}
        </div>
      </header>

      <details className="v26-anatomy-legend" open>
        <summary>{es ? 'Leyenda de colores' : 'Color legend'}</summary>
        <div>{Object.entries(COLORS).map(([key, color]) => <span key={key}><i style={{ background: color }}/>{anatomyGroup(key)}</span>)}</div>
      </details>

      {anatomy ? <div className="v26-anatomy-text">{anatomySegments.map((segment, index) => <span key={`${index}-${segment.text.slice(0, 8)}`} style={{ textDecorationColor: COLORS[segment.category] ?? '#8d94a0' }} title={anatomyGroup(segment.category)} onClick={() => goToAnatomy(segment.category)}>{segment.text}</span>)}</div> : <textarea readOnly value={compiled.prompt}/>} 
    </section>

    {helpOpen && <HelpSheet es={es} onClose={() => setHelpOpen(false)}/>} 
  </section>;
}
