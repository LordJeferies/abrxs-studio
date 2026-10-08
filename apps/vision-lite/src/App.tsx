import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check, ChevronDown, Copy, Download, FileJson, MessageSquareText,
  PanelRightOpen, RotateCcw, Send, Sparkles, WandSparkles, X
} from 'lucide-react';
import {
  DEFAULTS, GROUPS, analyzeSource, buildHiggsfieldExport, compilePrompt,
  compileSegments, optionFor, type Category, type DirectionState,
  type Recommendation, type Target
} from './engine';
import PromptAnatomy, { type AnatomyMode } from './PromptAnatomy';
import VisualPicker from './VisualPicker';

type Message = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  recommendations?: Recommendation[];
};

type OutputMode = 'prompt' | 'json';

const initialMessages: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    text: 'Pégame una idea o un prompt. Mantengo tu Source Truth y te propongo decisiones visuales concretas. Puedes aplicar sólo las que quieras.'
  }
];

function downloadFile(name: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  a.click();
  URL.revokeObjectURL(href);
}

function categoryLabel(category: Category) {
  return GROUPS.find(g => g.id === category)?.label ?? category;
}

export default function App() {
  const [source, setSource] = useState(() => localStorage.getItem('vision-lite-source') ?? '');
  const [draft, setDraft] = useState('');
  const [direction, setDirection] = useState<DirectionState>(() => {
    const saved = localStorage.getItem('vision-lite-direction');
    if (!saved) return DEFAULTS;
    try { return { ...DEFAULTS, ...JSON.parse(saved) } as DirectionState; }
    catch { return DEFAULTS; }
  });
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [activeCategory, setActiveCategory] = useState<Category>('shot');
  const [target, setTarget] = useState<Target>('generic');
  const [outputMode, setOutputMode] = useState<OutputMode>('prompt');
  const [anatomyMode, setAnatomyMode] = useState<AnatomyMode>('underline');
  const [promptOpen, setPromptOpen] = useState(true);
  const [controlsOpen, setControlsOpen] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  const segments = useMemo(() => compileSegments(source, direction), [source, direction]);
  const compiledPrompt = useMemo(() => compilePrompt(source, direction), [source, direction]);
  const higgsfield = useMemo(() => buildHiggsfieldExport(source, direction), [source, direction]);

  useEffect(() => {
    localStorage.setItem('vision-lite-source', source);
    localStorage.setItem('vision-lite-direction', JSON.stringify(direction));
  }, [source, direction]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  function sendPrompt() {
    const value = draft.trim();
    if (!value) return;
    const analysis = analyzeSource(value);
    setSource(value);
    setMessages(prev => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', text: value },
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: `${analysis.summary} No aplico nada automáticamente: tú decides qué entra al prompt.`,
        recommendations: analysis.recommendations
      }
    ]);
    setDraft('');
  }

  function applyRecommendation(rec: Recommendation) {
    setDirection(prev => ({ ...prev, [rec.category]: rec.optionId }));
    openCategory(rec.category);
  }

  function applyAll(recommendations: Recommendation[]) {
    setDirection(prev => {
      const next = { ...prev };
      recommendations.forEach(rec => { next[rec.category] = rec.optionId; });
      return next;
    });
  }

  function selectOption(category: Category, optionId: string) {
    setDirection(prev => ({ ...prev, [category]: optionId }));
    setActiveCategory(category);
  }

  function openCategory(category: Category) {
    setActiveCategory(category);
    setControlsOpen(true);
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches) {
      setPromptOpen(false);
    }
  }

  function resetDirection() {
    setDirection(DEFAULTS);
    setMessages(initialMessages);
    setSource('');
    setDraft('');
    setActiveCategory('shot');
    setAnatomyMode('underline');
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
  }

  const outputText = outputMode === 'json'
    ? JSON.stringify(target === 'higgsfield' ? higgsfield : { prompt: compiledPrompt, direction }, null, 2)
    : compiledPrompt;

  return (
    <div className="lite-app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><WandSparkles size={17} /></div>
          <div>
            <strong>Vision Lite</strong>
            <span>Conversational Prompt Director</span>
          </div>
        </div>

        <div className="topbar-actions">
          <div className="target-switch" aria-label="Output target">
            <button className={target === 'generic' ? 'active' : ''} onClick={() => setTarget('generic')}>Generic</button>
            <button className={target === 'higgsfield' ? 'active' : ''} onClick={() => setTarget('higgsfield')}>Higgsfield</button>
          </div>
          <button className="icon-button desktop-only" onClick={() => setPromptOpen(v => !v)} title="Mostrar/ocultar prompt">
            <PanelRightOpen size={18} />
          </button>
          <button className="icon-button" onClick={resetDirection} title="Nuevo"><RotateCcw size={17} /></button>
        </div>
      </header>

      <main className={`workspace ${promptOpen ? '' : 'prompt-closed'}`}>
        <section className="chat-column">
          <div className="chat-scroll">
            <div className="chat-intro">
              <span className="eyebrow">SOURCE → DIRECTION → PROMPT</span>
              <h1>Describe lo que quieres crear.</h1>
              <p>Vision conserva tu idea, propone decisiones visuales y te deja elegirlas viendo una referencia y entendiendo qué cambia.</p>
            </div>

            <div className="messages">
              {messages.map(message => (
                <article key={message.id} className={`message ${message.role}`}>
                  <div className="message-avatar">
                    {message.role === 'assistant' ? <Sparkles size={15} /> : <MessageSquareText size={15} />}
                  </div>
                  <div className="message-body">
                    <p>{message.text}</p>
                    {message.recommendations && message.recommendations.length > 0 && (
                      <div className="recommendation-block">
                        <div className="recommendation-heading">
                          <span>Sugerencias</span>
                          <button onClick={() => applyAll(message.recommendations!)}><Check size={14} /> Aplicar todas</button>
                        </div>
                        <div className="recommendations">
                          {message.recommendations.map(rec => {
                            const opt = optionFor(rec.category, rec.optionId);
                            const applied = direction[rec.category] === rec.optionId;
                            return (
                              <button
                                key={`${message.id}-${rec.category}`}
                                className={`recommendation ${applied ? 'applied' : ''}`}
                                onClick={() => applyRecommendation(rec)}
                              >
                                <span className="rec-category">{categoryLabel(rec.category)}</span>
                                <strong>{opt.label}</strong>
                                <small>{rec.reason}</small>
                                <span className="rec-action">{applied ? 'Ver selección' : 'Aplicar y ver'}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))}
              <div ref={endRef} />
            </div>
          </div>

          <div className="director-controls visual-director-controls">
            <button className="controls-toggle mobile-only" onClick={() => setControlsOpen(v => !v)}>
              Selector visual · {categoryLabel(activeCategory)} <ChevronDown size={16} className={controlsOpen ? 'rotated' : ''} />
            </button>
            <div className={`controls-inner visual-controls-inner ${controlsOpen ? 'open' : ''}`}>
              <VisualPicker
                direction={direction}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                onSelect={selectOption}
              />
            </div>
          </div>

          <div className="composer-wrap">
            <div className="composer">
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendPrompt();
                  }
                }}
                rows={2}
                placeholder="Ej.: CEO revisando tres propuestas, duda antes de decidir, oficina moderna..."
              />
              <button className="send-button" onClick={sendPrompt} disabled={!draft.trim()} aria-label="Enviar">
                <Send size={18} />
              </button>
            </div>
            <span className="composer-hint">Enter para dirigir · Shift+Enter para nueva línea · Vision propone, tú aplicas.</span>
          </div>
        </section>

        <aside className={`prompt-panel ${promptOpen ? 'open' : ''}`}>
          <div className="panel-header">
            <div>
              <span className="eyebrow">LIVE OUTPUT</span>
              <h2>Prompt Monitor</h2>
            </div>
            <button className="icon-button mobile-only" onClick={() => setPromptOpen(false)}><X size={18} /></button>
          </div>

          <div className="output-tabs">
            <button className={outputMode === 'prompt' ? 'active' : ''} onClick={() => setOutputMode('prompt')}>Prompt</button>
            <button className={outputMode === 'json' ? 'active' : ''} onClick={() => setOutputMode('json')}><FileJson size={14} /> JSON</button>
          </div>

          {outputMode === 'prompt' ? (
            <PromptAnatomy
              segments={segments}
              mode={anatomyMode}
              onModeChange={setAnatomyMode}
              onOpenCategory={openCategory}
            />
          ) : (
            <pre className="json-output">{outputText}</pre>
          )}

          <div className="panel-actions">
            <button className="primary-action" onClick={() => copyText(outputText)}><Copy size={15} /> Copiar</button>
            <button onClick={() => downloadFile(
              outputMode === 'json' ? 'vision-lite.json' : 'vision-lite-prompt.txt',
              outputText,
              outputMode === 'json' ? 'application/json' : 'text/plain'
            )}><Download size={15} /> Exportar</button>
          </div>

          <div className="before-after">
            <span className="eyebrow">SOURCE TRUTH</span>
            <p>{source || 'Tu texto original aparecerá aquí sin ser sustituido por las decisiones de dirección.'}</p>
          </div>

          {target === 'higgsfield' && (
            <div className="provider-note">
              <strong>Higgsfield public-schema draft</strong>
              <p>El JSON usa campos públicos del CLI y conserva las decisiones ABRAXAS como metadata. No afirma revelar prompts internos privados de Higgsfield.</p>
            </div>
          )}
        </aside>
      </main>

      {!promptOpen && (
        <button className="floating-prompt-button" onClick={() => setPromptOpen(true)}>
          <PanelRightOpen size={17} /> Prompt
        </button>
      )}
    </div>
  );
}
