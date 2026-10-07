import {
  Check,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  HelpCircle,
  Layers3,
  Lock,
  MessageCircle,
  Redo2,
  Sparkles,
  Undo2,
  Video,
  WandSparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import {
  DIRECTOR_CATEGORIES,
  DIRECTOR_PRESETS,
  anatomizePrompt,
  applyDirectorOptionToPrompt,
  applyDirectorPresetToPrompt,
  auditDirectorPrompt,
  improveDirectorPrompt,
  optionById,
  optionsFor,
  type DirectorCategory,
  type DirectorOption,
} from './directorCatalog';

type DirectorMode = 'image' | 'video' | 'xroll';

type Props = {
  language: 'es' | 'en';
  onOpenCopilot?: () => void;
  onOpenStudio?: () => void;
};

const STARTER_ES = `Joc está sentado frente a una mesa real comparando tres propuestas visualmente equivalentes. La escena debe mostrar que el problema no es tener pocas opciones, sino no tener un criterio claro para decidir.`;
const STARTER_EN = `A decision-maker sits at a real table comparing three visually equivalent proposals. The scene should make it clear that the problem is not a lack of options, but the absence of a clear criterion for deciding.`;

const ANATOMY_LABELS: Record<string, string> = {
  intent: 'Intent', subject: 'Subject', action: 'Action', scene: 'Scene', shot: 'Shot', lens: 'Lens', angle: 'Angle', focus: 'Focus', composition: 'Composition', lighting: 'Light', movement: 'Motion', look: 'Look', atmosphere: 'Atmosphere', fx: 'FX', output: 'Output',
};

function storageLoad(key: string, fallback: string) {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

function ScenePreview({ option, active = false }: { option: DirectorOption; active?: boolean }) {
  const p = option.preview;
  const subjectStyle = {
    transform: `translate(${p.subjectX ?? 0}%, ${p.subjectY ?? 0}%) scale(${p.subjectScale ?? 1})`,
  };
  const backgroundStyle = { transform: `scale(${p.backgroundScale ?? 1})` };
  const sceneStyle = {
    filter: `contrast(${p.contrast ?? 1}) sepia(${Math.max(0, p.warmth ?? 0) * 0.35}) hue-rotate(${(p.warmth ?? 0) < 0 ? '190deg' : '0deg'})`,
  };
  return <div className={`v25-scene ${active ? 'active' : ''}`} data-light={p.light ?? 'front'} data-motion={p.motion ?? 'none'} style={sceneStyle}>
    <div className="v25-scene-bg" style={backgroundStyle}/>
    <div className="v25-scene-window"/>
    <div className="v25-scene-practical"/>
    <div className="v25-scene-table"><i/><i/><i/></div>
    <div className="v25-scene-subject" style={subjectStyle}><span/><b/></div>
    <div className="v25-scene-haze" style={{ opacity: p.haze ?? 0 }}/>
    <div className="v25-scene-vignette" style={{ opacity: p.vignette ?? 0 }}/>
    {p.blur ? <div className="v25-scene-blur" style={{ opacity: p.blur }}/> : null}
    {p.motion && p.motion !== 'none' ? <div className={`v25-motion-indicator ${p.motion}`}>→</div> : null}
  </div>;
}

function DirectorOptionCard({ option, selected, onApply, onExplain }: { option: DirectorOption; selected: boolean; onApply: () => void; onExplain: () => void }) {
  return <article className={`v25-option-card ${selected ? 'selected' : ''}`}>
    <button className="v25-preview-button" type="button" onClick={onApply} aria-label={`Apply ${option.label}`}>
      <ScenePreview option={option} active={selected}/>
      {selected ? <span className="v25-selected-mark"><Check size={13}/></span> : null}
    </button>
    <div className="v25-option-copy">
      <div><strong>{option.label}</strong><span>{option.short}</span></div>
      <button type="button" className="v25-help" onClick={onExplain} title="Explain"><HelpCircle size={14}/></button>
    </div>
  </article>;
}

export function DirectorPromptStudio({ language, onOpenCopilot, onOpenStudio }: Props) {
  const es = language === 'es';
  const [mode, setMode] = useState<DirectorMode>('image');
  const [prompt, setPromptRaw] = useState(() => storageLoad('abrxsVisionV25Prompt', es ? STARTER_ES : STARTER_EN));
  const [activeCategory, setActiveCategory] = useState<DirectorCategory>('lens');
  const [selections, setSelections] = useState<Partial<Record<DirectorCategory, string>>>(() => {
    try { return JSON.parse(localStorage.getItem('abrxsVisionV25Selections') || '{}') as Partial<Record<DirectorCategory, string>>; } catch { return {}; }
  });
  const [anatomyVisible, setAnatomyVisible] = useState(true);
  const [explaining, setExplaining] = useState<DirectorOption | null>(null);
  const [selection, setSelection] = useState<{ start: number; end: number; text: string } | null>(null);
  const [history, setHistory] = useState<string[]>([prompt]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const audit = useMemo(() => auditDirectorPrompt(prompt), [prompt]);
  const anatomy = useMemo(() => anatomizePrompt(prompt), [prompt]);
  const categoryOptions = useMemo(() => optionsFor(activeCategory), [activeCategory]);

  const persist = (next: string, record = true) => {
    setPromptRaw(next);
    try { localStorage.setItem('abrxsVisionV25Prompt', next); } catch { /* noop */ }
    if (record) {
      const trimmed = history.slice(0, historyIndex + 1);
      const nextHistory = [...trimmed, next].slice(-60);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    }
  };

  const selectDirectorOption = (selected: DirectorOption) => {
    const next = applyDirectorOptionToPrompt(prompt, selected);
    setSelections((current) => {
      const value = { ...current, [selected.category]: selected.id };
      try { localStorage.setItem('abrxsVisionV25Selections', JSON.stringify(value)); } catch { /* noop */ }
      return value;
    });
    persist(next);
  };

  const applyPreset = (id: string) => {
    const preset = DIRECTOR_PRESETS.find((item) => item.id === id);
    if (!preset) return;
    const next = applyDirectorPresetToPrompt(prompt, preset);
    setSelections((current) => ({ ...current, ...preset.values }));
    persist(next);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const index = historyIndex - 1;
    setHistoryIndex(index);
    persist(history[index], false);
  };
  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const index = historyIndex + 1;
    setHistoryIndex(index);
    persist(history[index], false);
  };

  const captureSelection = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = prompt.slice(start, end).trim();
    setSelection(text ? { start, end, text } : null);
  };

  const replaceSelection = (nextText: string) => {
    if (!selection) return;
    const next = `${prompt.slice(0, selection.start)}${nextText}${prompt.slice(selection.end)}`;
    persist(next);
    setSelection(null);
  };

  const copyPrompt = () => void navigator.clipboard.writeText(prompt);
  const applyAutoImprove = () => persist(improveDirectorPrompt(prompt, mode));

  const modeLabel = mode === 'image' ? (es ? 'Imagen' : 'Image') : mode === 'video' ? 'Video' : 'XRoll';
  const currentSelectedOption = optionById(selections[activeCategory]);

  return <section className="v25-director-studio">
    <header className="v25-director-header">
      <div><span className="micro">ABRXS VISION V2.5</span><h1>{es ? 'Escribe. Vision dirige.' : 'Write. Vision directs.'}</h1><p>{es ? 'El prompt sigue siendo texto normal. Selecciona decisiones visuales, entiende su efecto y deja que Vision las integre sin perder tu intención.' : 'The prompt remains normal text. Choose visual decisions, understand their effect and let Vision integrate them without losing your intent.'}</p></div>
      <div className="v25-mode-switch" aria-label="Output mode">
        <button className={mode === 'image' ? 'active' : ''} type="button" onClick={() => setMode('image')}><ImageIcon size={15}/>{es ? 'Imagen' : 'Image'}</button>
        <button className={mode === 'video' ? 'active' : ''} type="button" onClick={() => setMode('video')}><Video size={15}/>Video</button>
        <button className={mode === 'xroll' ? 'active' : ''} type="button" onClick={() => setMode('xroll')}><Layers3 size={15}/>XRoll</button>
      </div>
    </header>

    <div className="v25-main-grid">
      <main className="v25-editor-column">
        <div className="v25-editor-toolbar">
          <div className="v25-score" data-grade={audit.grade}><strong>{audit.grade}</strong><span>{audit.score}/100</span></div>
          <div className="v25-toolbar-spacer"/>
          <button type="button" disabled={historyIndex <= 0} onClick={undo} title="Undo"><Undo2 size={15}/></button>
          <button type="button" disabled={historyIndex >= history.length - 1} onClick={redo} title="Redo"><Redo2 size={15}/></button>
          <button type="button" onClick={() => setAnatomyVisible((value) => !value)}>{anatomyVisible ? <Eye size={15}/> : <EyeOff size={15}/>}Anatomy</button>
          <button type="button" onClick={copyPrompt}><Copy size={15}/>{es ? 'Copiar' : 'Copy'}</button>
        </div>

        <div className={`v25-rich-editor ${anatomyVisible ? 'anatomy-on' : ''}`}>
          {anatomyVisible ? <div className="v25-anatomy-overlay" aria-hidden="true">{anatomy.map((segment, index) => <span key={`${index}-${segment.text.slice(0,6)}`} className={`anatomy-${segment.category}`} title={ANATOMY_LABELS[segment.category]}>{segment.text}</span>)}</div> : null}
          <textarea
            ref={textareaRef}
            value={prompt}
            spellCheck
            aria-label="Prompt editor"
            onChange={(event) => persist(event.target.value)}
            onSelect={captureSelection}
            onKeyUp={captureSelection}
            onMouseUp={captureSelection}
          />
        </div>

        {selection ? <div className="v25-selection-toolbar">
          <div><span className="micro">{es ? 'SELECCIÓN' : 'SELECTION'}</span><strong>“{selection.text.length > 72 ? `${selection.text.slice(0,72)}…` : selection.text}”</strong></div>
          <button type="button" onClick={() => replaceSelection(`${selection.text}, expressed as precise observable behavior`)}><Sparkles size={14}/>{es ? 'Hacer observable' : 'Make observable'}</button>
          <button type="button" onClick={() => replaceSelection(`${selection.text}, restrained and physically plausible`)}>{es ? 'Más preciso' : 'More precise'}</button>
          <button type="button" onClick={() => setSelection(null)}><Lock size={14}/>{es ? 'Conservar' : 'Preserve'}</button>
          {onOpenCopilot ? <button className="primary" type="button" onClick={onOpenCopilot}><MessageCircle size={14}/>{es ? 'Preguntar a Vision' : 'Ask Vision'}</button> : null}
        </div> : null}

        <div className="v25-anatomy-legend" hidden={!anatomyVisible}>
          {['intent','subject','action','scene','shot','lens','composition','lighting','movement','look','output'].map((key) => <span key={key} className={`anatomy-${key}`}><i/>{ANATOMY_LABELS[key]}</span>)}
        </div>

        <section className="v25-director-actions">
          <button className="v25-improve" type="button" onClick={applyAutoImprove}><WandSparkles size={18}/><div><strong>{es ? 'Dirigir y mejorar' : 'Direct and improve'}</strong><span>{es ? `Completa lo que falta para ${modeLabel}, sin cambiar la tesis.` : `Complete what is missing for ${modeLabel} without changing the thesis.`}</span></div><ChevronRight size={18}/></button>
          {onOpenCopilot ? <button type="button" onClick={onOpenCopilot}><MessageCircle size={17}/><div><strong>Vision Copilot</strong><span>{es ? 'Pide una mejora semántica o alternativas A/B/C.' : 'Ask for semantic improvement or A/B/C alternatives.'}</span></div></button> : null}
          {onOpenStudio ? <button type="button" onClick={onOpenStudio}><Sparkles size={17}/><div><strong>{es ? 'Preparar producción' : 'Prepare production'}</strong><span>{es ? 'Lleva la misma intención al Studio y providers.' : 'Take the same intent to Studio and providers.'}</span></div></button> : null}
        </section>

        <section className="v25-reference-browser">
          <div className="v25-section-head"><div><span className="micro">CINEMA DIRECTOR</span><h2>{es ? 'Elige viendo, no memorizando.' : 'Choose by seeing, not memorizing.'}</h2></div><p>{DIRECTOR_CATEGORIES.find((item) => item.id === activeCategory)?.description}</p></div>
          <div className="v25-category-strip">{DIRECTOR_CATEGORIES.map((category) => <button key={category.id} className={activeCategory === category.id ? 'active' : ''} type="button" onClick={() => { setActiveCategory(category.id); setExplaining(null); }}>{category.label}</button>)}</div>
          <div className="v25-options-grid">{categoryOptions.map((item) => <DirectorOptionCard key={item.id} option={item} selected={selections[item.category] === item.id} onApply={() => selectDirectorOption(item)} onExplain={() => setExplaining(item)}/>)}</div>
        </section>
      </main>

      <aside className="v25-inspector">
        <section className="v25-inspector-card director-status">
          <div className="v25-card-title"><div><span className="micro">VISION DIRECTOR</span><strong>{audit.grade} · {audit.score}</strong></div><Sparkles size={18}/></div>
          {audit.issues.slice(0,4).map((issue) => <div className="v25-issue" key={`${issue.id}-${issue.label}`}><i/><div><strong>{issue.label}</strong><p>{issue.suggestion}</p></div></div>)}
          {!audit.issues.length ? <div className="v25-all-good"><Check size={15}/>{es ? 'Prompt listo para compilar.' : 'Prompt ready to compile.'}</div> : null}
        </section>

        <section className="v25-inspector-card">
          <div className="v25-card-title"><div><span className="micro">RECIPES</span><strong>{es ? 'Dirección rápida' : 'Quick direction'}</strong></div></div>
          <div className="v25-preset-list">{DIRECTOR_PRESETS.map((preset) => <button type="button" key={preset.id} onClick={() => applyPreset(preset.id)}><div><strong>{preset.label}</strong><span>{preset.family} · {preset.description}</span></div><ChevronRight size={14}/></button>)}</div>
        </section>

        <section className="v25-inspector-card current-decision">
          <div className="v25-card-title"><div><span className="micro">CURRENT</span><strong>{DIRECTOR_CATEGORIES.find((item) => item.id === activeCategory)?.label}</strong></div></div>
          {currentSelectedOption ? <><ScenePreview option={currentSelectedOption} active/><h3>{currentSelectedOption.label}</h3><p>{currentSelectedOption.effect}</p><div className="v25-mini-spec"><span>{es ? 'Se siente' : 'Feels'}<strong>{currentSelectedOption.feel}</strong></span><span>{es ? 'Útil para' : 'Good for'}<strong>{currentSelectedOption.useFor}</strong></span></div></> : <p className="v25-muted">{es ? 'Selecciona una referencia visual para incorporarla al prompt.' : 'Select a visual reference to incorporate it into the prompt.'}</p>}
        </section>
      </aside>
    </div>

    {explaining ? <div className="v25-help-sheet" role="dialog" aria-modal="true" aria-label={explaining.label}>
      <button className="v25-sheet-backdrop" type="button" onClick={() => setExplaining(null)} aria-label="Close"/>
      <article>
        <ScenePreview option={explaining}/>
        <div className="v25-sheet-head"><div><span className="micro">{DIRECTOR_CATEGORIES.find((item) => item.id === explaining.category)?.label}</span><h2>{explaining.label}</h2><p>{explaining.short}</p></div><button type="button" onClick={() => setExplaining(null)}>×</button></div>
        <dl><div><dt>{es ? 'Qué hace' : 'What it does'}</dt><dd>{explaining.effect}</dd></div><div><dt>{es ? 'Cómo se siente' : 'How it feels'}</dt><dd>{explaining.feel}</dd></div><div><dt>{es ? 'Bueno para' : 'Good for'}</dt><dd>{explaining.useFor}</dd></div><div><dt>{es ? 'Evita si' : 'Avoid when'}</dt><dd>{explaining.avoidWhen}</dd></div><div><dt>{es ? 'Cómo entra al prompt' : 'Prompt language'}</dt><dd><code>{explaining.prompt}</code></dd></div></dl>
        <button className="v25-sheet-apply" type="button" onClick={() => { selectDirectorOption(explaining); setExplaining(null); }}><WandSparkles size={16}/>{es ? `Usar ${explaining.label}` : `Use ${explaining.label}`}</button>
      </article>
    </div> : null}
  </section>;
}
