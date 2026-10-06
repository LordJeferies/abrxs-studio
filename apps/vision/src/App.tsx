import {
  Boxes,
  Camera,
  ChevronDown,
  CircleDot,
  Clapperboard,
  Copy,
  Download,
  Film,
  Focus,
  Frame,
  GalleryHorizontalEnd,
  Image as ImageIcon,
  Layers3,
  Lightbulb,
  Maximize2,
  Move3d,
  Palette,
  PanelLeftClose,
  Play,
  Plus,
  RefreshCw,
  Save,
  ScanSearch,
  Settings2,
  Sparkles,
  SquareStack,
  Upload,
  WandSparkles,
  Workflow,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnalyzerPanel } from './AnalyzerPanel';
import {
  brandPresets,
  compileCarouselPrompt,
  compilePrompt,
  defaults,
  parseCarouselCopy,
  type DirectorState,
} from './promptEngine';
import { saveVisionProject, validateVisionProject, type VisionStoredProject } from './projectStore';
import { StoryboardStudio } from './StoryboardStudio';

type ViewId =
  | 'quick'
  | 'director'
  | 'carousel'
  | 'scene'
  | 'layers'
  | 'assets'
  | 'flow'
  | 'providers';

type Toast = { id: number; text: string };
type RefItem = { id: string; name: string; role: string };

const NAV: Array<{ id: ViewId; label: string; icon: typeof Sparkles }> = [
  { id: 'quick', label: 'Quick', icon: Sparkles },
  { id: 'director', label: 'Director', icon: Clapperboard },
  { id: 'carousel', label: 'Carousel', icon: GalleryHorizontalEnd },
  { id: 'scene', label: 'Storyboard', icon: Film },
  { id: 'layers', label: 'Layers', icon: Layers3 },
  { id: 'assets', label: 'Analyze', icon: ScanSearch },
  { id: 'flow', label: 'Vision Space', icon: Workflow },
  { id: 'providers', label: 'Providers', icon: Boxes },
];

const SELECTS = {
  camera: ['Digital cinema', '35mm film', '65mm cinema', 'Documentary digital', 'Vintage digital'],
  lens: ['Spherical', 'Anamorphic', 'Vintage spherical', 'Macro', 'Telephoto compression'],
  focal: ['24mm', '35mm', '50mm', '85mm', '135mm'],
  aperture: ['f/1.4', 'f/2', 'f/2.8', 'f/4', 'f/8'],
  framing: ['Extreme close-up', 'Close-up', 'Medium close-up', 'Medium', 'Full', 'Wide'],
  angle: ['Eye level', 'Low angle', 'High angle', 'Overhead', 'Profile', 'Dutch angle'],
  movement: ['Static', 'Slow dolly in', 'Dolly out', 'Tracking', 'Orbit', 'Slider right', 'Handheld restrained', 'Crane'],
  lighting: [
    'Soft motivated window key + practical lamp',
    'Soft studio key + subtle rim',
    'Hard directional sunlight',
    'Low-key practical lighting',
    'Overcast natural light',
    'High-key commercial lighting',
  ],
};

const DEFAULT_CAROUSEL = `Slide 1: El cliente no compra tareas
La actividad visible no siempre demuestra criterio.

Slide 2: Dos proveedores pueden ofrecer lo mismo
La diferencia aparece cuando uno entiende qué frena la decisión.

Slide 3: Convierte servicios en criterio
Explica para qué sirve cada acción y qué señal estás observando.

Slide 4: Menos lista. Más dirección.
Haz visible cómo decides, no sólo lo que haces.`;

function safeLoad<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function downloadText(filename: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <div className="select-wrap">
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
        <ChevronDown size={14} />
      </div>
    </Field>
  );
}

function PromptCard({ title, value, onCopy }: { title: string; value: string; onCopy: () => void }) {
  return (
    <article className="prompt-card">
      <div className="card-head">
        <div><span className="micro">OUTPUT</span><h3>{title}</h3></div>
        <button className="icon-button" type="button" onClick={onCopy} aria-label={`Copy ${title}`}><Copy size={16} /></button>
      </div>
      <p>{value}</p>
    </article>
  );
}

export function App() {
  const [view, setView] = useState<ViewId>('quick');
  const [director, setDirector] = useState<DirectorState>(() => safeLoad('abrxsVisionDirectorV1', defaults));
  const [carouselRaw, setCarouselRaw] = useState(() => safeLoad('abrxsVisionCarouselCopyV1', DEFAULT_CAROUSEL));
  const [carouselStyle, setCarouselStyle] = useState(() => safeLoad('abrxsVisionCarouselStyleV1', 'Premium cinematic editorial design'));
  const [textMode, setTextMode] = useState<'integrated' | 'separate' | 'clean'>(() => safeLoad('abrxsVisionTextModeV1', 'separate'));
  const [references, setReferences] = useState<RefItem[]>(() => safeLoad('abrxsVisionRefsV1', []));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [online, setOnline] = useState(() => navigator.onLine);
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const prompt = useMemo(() => compilePrompt(director), [director]);
  const slides = useMemo(() => parseCarouselCopy(carouselRaw), [carouselRaw]);
  const carouselPrompts = useMemo(
    () => slides.map((slide) => ({ ...slide, prompt: compileCarouselPrompt(slide, carouselStyle, textMode, director.brandPreset, director.aspect) })),
    [slides, carouselStyle, textMode, director.brandPreset, director.aspect],
  );

  const projectPayload = useMemo(() => ({
    director,
    references,
    carousel: { source: carouselRaw, style: carouselStyle, textMode, prompts: carouselPrompts },
    prompts: prompt,
  }), [director, references, carouselRaw, carouselStyle, textMode, carouselPrompts, prompt]);

  useEffect(() => localStorage.setItem('abrxsVisionDirectorV1', JSON.stringify(director)), [director]);
  useEffect(() => localStorage.setItem('abrxsVisionCarouselCopyV1', JSON.stringify(carouselRaw)), [carouselRaw]);
  useEffect(() => localStorage.setItem('abrxsVisionCarouselStyleV1', JSON.stringify(carouselStyle)), [carouselStyle]);
  useEffect(() => localStorage.setItem('abrxsVisionTextModeV1', JSON.stringify(textMode)), [textMode]);
  useEffect(() => localStorage.setItem('abrxsVisionRefsV1', JSON.stringify(references)), [references]);
  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const now = new Date().toISOString();
      void saveVisionProject({ id: 'default', name: 'Vision Project', schema: 'abrxs.vision-project.v2', createdAt: now, updatedAt: now, payload: projectPayload }).catch(() => undefined);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [projectPayload]);

  const toast = (text: string) => {
    const id = Date.now();
    setToasts((current) => [...current, { id, text }]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 1800);
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast('Copied to clipboard');
  };

  const update = <K extends keyof DirectorState>(key: K, value: DirectorState[K]) => setDirector((current) => ({ ...current, [key]: value }));

  const makeStoredProject = (): VisionStoredProject => {
    const now = new Date().toISOString();
    return { id: 'default', name: 'Vision Project', schema: 'abrxs.vision-project.v2', createdAt: now, updatedAt: now, payload: projectPayload };
  };

  const exportProject = () => {
    downloadText('Abrxs-Vision-Project.json', JSON.stringify(makeStoredProject(), null, 2), 'application/json');
    toast('Project exported');
  };

  const importProject = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as VisionStoredProject;
      if (!validateVisionProject(parsed)) throw new Error('This is not an Abrxs Vision V2 project.');
      const payload = parsed.payload as typeof projectPayload;
      if (!payload?.director || !payload?.carousel) throw new Error('Vision project payload is incomplete.');
      setDirector(payload.director);
      setReferences(Array.isArray(payload.references) ? payload.references : []);
      setCarouselRaw(payload.carousel.source ?? DEFAULT_CAROUSEL);
      setCarouselStyle(payload.carousel.style ?? 'Premium cinematic editorial design');
      setTextMode(payload.carousel.textMode ?? 'separate');
      await saveVisionProject({ ...parsed, updatedAt: new Date().toISOString() });
      toast('Project imported');
    } catch (reason) {
      toast(reason instanceof Error ? reason.message : 'Could not import project');
    }
  };

  const exportPromptPack = () => {
    const content = [
      '# ABRXS VISION PROMPT PACK', '', '## IMAGE PROMPT', prompt.imagePrompt, '', '## MOTION PROMPT', prompt.motionPrompt,
      '', '## NEGATIVE / AVOID', prompt.negativePrompt, '', '## CAROUSEL',
      ...carouselPrompts.flatMap((slide) => ['', `### SLIDE ${slide.number} · ${slide.title}`, slide.prompt]),
    ].join('\n');
    downloadText('Abrxs-Vision-Prompt-Pack.md', content, 'text/markdown');
    toast('Prompt pack exported');
  };

  const activePreset = brandPresets.find((item) => item.id === director.brandPreset) ?? brandPresets[0];

  return (
    <div className="vision-app">
      <aside className="rail" aria-label="Vision navigation">
        <button className="brand-orb" type="button" onClick={() => setView('quick')} aria-label="Abrxs Vision home"><span>V</span></button>
        <nav>
          {NAV.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} className={view === item.id ? 'rail-button active' : 'rail-button'} type="button" onClick={() => setView(item.id)} aria-label={item.label} title={item.label}><Icon size={18} strokeWidth={1.8} /></button>;
          })}
        </nav>
        <button className="rail-button" type="button" onClick={exportProject} aria-label="Export project" title="Export project"><Download size={18} /></button>
      </aside>

      <section className="workspace-shell">
        <header className="titlebar" data-tauri-drag-region>
          <div className="title-copy">
            <span className="micro">ABRXS</span><strong>Vision Art Creator</strong>
            <span className={online ? 'status-dot' : 'status-dot offline'}><i /> {online ? 'Online · Local core ready' : 'Offline · Local core ready'}</span>
          </div>
          <div className="title-actions">
            <input ref={importRef} hidden type="file" accept="application/json,.json" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) void importProject(file); event.currentTarget.value = ''; }} />
            <button className="subtle-button" type="button" onClick={() => importRef.current?.click()}><Upload size={15} /> Import</button>
            <button className="subtle-button" type="button" onClick={() => { window.location.href = './guide.html'; }}><Film size={15} /> Guide</button>
            <button className="subtle-button" type="button" onClick={exportPromptPack}><Download size={15} /> Prompt Pack</button>
            <button className="primary-button" type="button" onClick={() => setView('director')}><WandSparkles size={15} /> Open Director</button>
          </div>
        </header>

        <div className="main-grid">
          <aside className="navigator">
            <div className="nav-section"><span className="micro">WORKSPACE</span><h2>{NAV.find((item) => item.id === view)?.label}</h2></div>
            <div className="brand-preset-card"><div className="preset-icon"><Palette size={17} /></div><div><span className="micro">VISION DNA</span><strong>{activePreset.name}</strong><p>{activePreset.description}</p></div></div>
            <Field label="Brand vision preset"><div className="select-wrap"><select value={director.brandPreset} onChange={(event) => update('brandPreset', event.target.value)}>{brandPresets.map((preset) => <option value={preset.id} key={preset.id}>{preset.name}</option>)}</select><ChevronDown size={14} /></div></Field>
            <div className="nav-divider" />
            <span className="micro">REFERENCES</span>
            <div className="reference-list">
              {references.map((ref) => <div className="reference-row" key={ref.id}><div className="ref-thumb"><ImageIcon size={15} /></div><div><strong>{ref.name}</strong><span>{ref.role}</span></div></div>)}
              {!references.length && <p className="empty-note">Attach image references and assign their role in the shot.</p>}
            </div>
            <input ref={fileRef} hidden type="file" accept="image/*" multiple onChange={(event) => { const files = Array.from(event.target.files ?? []); setReferences((current) => [...current, ...files.map((file, index) => ({ id: `${Date.now()}-${index}`, name: file.name, role: 'Look / Reference' }))]); event.currentTarget.value = ''; }} />
            <button className="wide-button" type="button" onClick={() => fileRef.current?.click()}><Upload size={15} /> Add reference</button>
          </aside>

          <main className="stage">
            {view === 'quick' && (
              <section className="quick-view">
                <div className="hero-copy"><span className="micro">QUICK CREATOR · OFFLINE READY</span><h1>Direct the image.<br />Keep control of the intent.</h1><p>Start with one sentence. Vision expands production quality without rewriting your direction.</p></div>
                <div className="composer glass-surface">
                  <textarea value={director.idea} onChange={(event) => update('idea', event.target.value)} aria-label="Visual idea" placeholder="Describe the image, XRoll, carousel or shot you need…" />
                  <div className="composer-footer"><div className="composer-pills"><button type="button" onClick={() => setView('director')}><Camera size={14} /> {director.focal}</button><button type="button" onClick={() => setView('director')}><Lightbulb size={14} /> Lighting</button><button type="button" onClick={() => setView('director')}><Frame size={14} /> {director.aspect}</button></div><button className="generate-button" type="button" onClick={() => toast('Prompt compiler refreshed without changing director intent')}><Sparkles size={17} /> Enhance</button></div>
                </div>
                <div className="output-grid"><PromptCard title="Hero Frame Prompt" value={prompt.imagePrompt} onCopy={() => void copy(prompt.imagePrompt)} /><PromptCard title="Motion Prompt" value={prompt.motionPrompt} onCopy={() => void copy(prompt.motionPrompt)} /></div>
              </section>
            )}

            {view === 'director' && (
              <section className="director-view">
                <div className="section-heading"><div><span className="micro">CINEMA DIRECTOR</span><h1>Build the shot as decisions, not prompt noise.</h1></div><div className="mode-pill"><CircleDot size={13} /> Director Lock on</div></div>
                <div className="director-console">
                  <div className="console-section"><div className="console-title"><Camera size={17} /><strong>Camera setup</strong></div><div className="control-grid four"><SelectField label="Camera" value={director.camera} options={SELECTS.camera} onChange={(value) => update('camera', value)} /><SelectField label="Lens" value={director.lens} options={SELECTS.lens} onChange={(value) => update('lens', value)} /><SelectField label="Focal" value={director.focal} options={SELECTS.focal} onChange={(value) => update('focal', value)} /><SelectField label="Aperture" value={director.aperture} options={SELECTS.aperture} onChange={(value) => update('aperture', value)} /></div></div>
                  <div className="console-section"><div className="console-title"><Focus size={17} /><strong>Composition & movement</strong></div><div className="control-grid four"><SelectField label="Framing" value={director.framing} options={SELECTS.framing} onChange={(value) => update('framing', value)} /><SelectField label="Angle" value={director.angle} options={SELECTS.angle} onChange={(value) => update('angle', value)} /><SelectField label="Movement" value={director.movement} options={SELECTS.movement} onChange={(value) => update('movement', value)} /><Field label="Aspect"><input value={director.aspect} onChange={(event) => update('aspect', event.target.value)} /></Field></div></div>
                  <div className="console-section"><div className="console-title"><Lightbulb size={17} /><strong>Lighting & look</strong></div><div className="control-grid two"><SelectField label="Lighting" value={director.lighting} options={SELECTS.lighting} onChange={(value) => update('lighting', value)} /><Field label="Palette"><input value={director.palette} onChange={(event) => update('palette', event.target.value)} /></Field><Field label="Atmosphere"><input value={director.atmosphere} onChange={(event) => update('atmosphere', event.target.value)} /></Field><Field label="Style"><input value={director.style} onChange={(event) => update('style', event.target.value)} /></Field></div></div>
                </div>
              </section>
            )}

            {view === 'carousel' && (
              <section className="carousel-view">
                <div className="section-heading"><div><span className="micro">CAROUSEL STUDIO · OFFLINE READY</span><h1>Copy, visual direction and layers stay connected.</h1></div><button className="subtle-button" type="button" onClick={exportPromptPack}><Download size={15} /> Export pack</button></div>
                <div className="carousel-layout"><div className="copy-editor"><Field label="Slides · blank line separates slides"><textarea value={carouselRaw} onChange={(event) => setCarouselRaw(event.target.value)} /></Field><Field label="Design style"><input value={carouselStyle} onChange={(event) => setCarouselStyle(event.target.value)} /></Field><div className="segmented">{(['integrated', 'separate', 'clean'] as const).map((mode) => <button key={mode} className={textMode === mode ? 'active' : ''} type="button" onClick={() => setTextMode(mode)}>{mode === 'integrated' ? 'Text in image' : mode === 'separate' ? 'Text layer' : 'Clean image'}</button>)}</div></div><div className="slide-stack">{carouselPrompts.map((slide) => <article className="slide-card" key={slide.id}><div className="slide-preview"><span>{String(slide.number).padStart(2, '0')}</span><div><strong>{slide.title}</strong><p>{slide.body}</p></div></div><div className="slide-prompt"><span className="micro">PROMPT</span><p>{slide.prompt}</p></div><button className="icon-button" type="button" onClick={() => void copy(slide.prompt)}><Copy size={15} /></button></article>)}</div></div>
              </section>
            )}

            {view === 'scene' && <StoryboardStudio idea={director.idea} director={director} onCopy={(value) => void copy(value)} />}

            {view === 'layers' && (
              <section className="layers-view"><div className="section-heading"><div><span className="micro">LAYER LAB</span><h1>Build XRolls as depth, not flattened pixels.</h1></div><button className="subtle-button"><SquareStack size={15}/> Export layer plan</button></div><div className="layer-composer"><div className="layer-preview"><div className="depth-frame back"/><div className="depth-frame middle"/><div className="depth-frame front"/><span>Composite preview</span></div><div className="layer-list">{[['06','Text / Graphics','transparent · SVG/PNG'],['05','Foreground','transparent · parallax 1.8×'],['04','Subject','transparent · identity locked'],['03','Midground','depth · parallax 0.7×'],['02','Background','clean plate'],['01','Depth / Masks','metadata']].map(([n,label,info]) => <div className="layer-row" key={n}><span>{n}</span><div><strong>{label}</strong><small>{info}</small></div><Settings2 size={14}/></div>)}</div></div></section>
            )}

            {view === 'assets' && (
              <section className="asset-view"><div className="section-heading"><div><span className="micro">ASSET & ANALYSIS LAB</span><h1>Analyze locally first. Escalate to AI only when useful.</h1></div></div><AnalyzerPanel/><div className="tool-grid">{[[WandSparkles,'Improve','Provider-backed quality refinement'],[Maximize2,'Upscale','Provider-backed resolution increase'],[Lightbulb,'Relight','Provider-backed lighting change'],[Frame,'Reframe','Adapt composition to a new aspect'],[ScanSearch,'Semantic Analyze','Use NVIDIA/Gemini when connected'],[Move3d,'New Take','Keep identity, change camera or action']].map(([Icon,label,description]) => { const ToolIcon = Icon as typeof WandSparkles; return <button className="tool-card" type="button" key={label as string} onClick={() => toast(`${label} requires an enabled provider in this build`)}><ToolIcon size={20}/><strong>{label as string}</strong><span>{description as string}</span></button>; })}</div></section>
            )}

            {view === 'flow' && (
              <section className="flow-view"><div className="flow-toolbar glass-surface"><span>Prompt Only</span><span>{director.aspect}</span><span>Offline core</span><button type="button" onClick={() => toast('Vision Space preview executed locally')}><Play size={14}/> Run</button></div><div className="node node-a"><span className="micro">TEXT / DIRECTOR</span><strong>{director.idea}</strong><div className="node-port out"/></div><svg className="connector" viewBox="0 0 500 220" preserveAspectRatio="none"><path d="M 110 110 C 220 110, 260 165, 390 165"/></svg><div className="node node-b"><span className="micro">IMAGE PROMPT</span><p>{prompt.imagePrompt.slice(0,220)}…</p><div className="node-port in"/></div><button className="canvas-add" type="button"><Plus size={18}/></button></section>
            )}

            {view === 'providers' && (
              <section className="providers-view"><div className="section-heading"><div><span className="micro">PROVIDER REGISTRY</span><h1>The local core works without a provider.</h1><p>Cloud providers add semantic analysis and generation; they never own the project format.</p></div></div><div className="provider-list">{[
                ['Prompt Only','Ready','Local prompt compiler, carousel and storyboard · no API key required',true],
                ['NVIDIA NIM','Next','Multimodal analysis and supported image/video generation via capability registry',false],
                ['Gemini','Next','Optional semantic image/story analysis; generation depends on model pricing/capability',false],
                ['Higgsfield','Prepared','Official API/SDK integration target',false],
                ['ComfyUI','Prepared','Local workflow provider target',false],
              ].map(([name,status,detail,ready]) => <div className="provider-row" key={name as string}><div className={ready ? 'provider-logo ready' : 'provider-logo'}>{(name as string).slice(0,1)}</div><div><strong>{name as string}</strong><span>{detail as string}</span></div><em className={ready ? 'ready' : ''}>{status as string}</em></div>)}</div></section>
            )}
          </main>

          <aside className="inspector">
            <div className="inspector-head"><div><span className="micro">DIRECTOR INTENT</span><strong>Protected decisions</strong></div><PanelLeftClose size={16}/></div>
            <p className="inspector-copy">Prompt enhancement may add craft, but these decisions cannot be silently reinterpreted.</p>
            <div className="lock-list">{Object.entries(director.preserve).map(([key, enabled]) => <button type="button" key={key} className={enabled ? 'lock-row active' : 'lock-row'} onClick={() => update('preserve', { ...director.preserve, [key]: !enabled })}><span>{key.replace(/([A-Z])/g, ' $1')}</span><i>{enabled ? 'Locked' : 'Open'}</i></button>)}</div>
            <div className="inspector-divider" /><span className="micro">SHOT FACTS</span><dl className="facts"><div><dt>Camera</dt><dd>{director.camera}</dd></div><div><dt>Lens</dt><dd>{director.focal} · {director.lens}</dd></div><div><dt>Frame</dt><dd>{director.framing}</dd></div><div><dt>Move</dt><dd>{director.movement}</dd></div><div><dt>Aspect</dt><dd>{director.aspect}</dd></div></dl>
            <button className="wide-button" type="button" onClick={() => { setDirector(defaults); toast('Director settings reset'); }}><RefreshCw size={15}/> Reset director</button>
            <button className="wide-button" type="button" onClick={exportProject}><Save size={15}/> Save / export project</button>
          </aside>
        </div>
      </section>
      <div className="toast-stack" aria-live="polite">{toasts.map((item) => <div className="toast" key={item.id}>{item.text}</div>)}</div>
    </div>
  );
}
