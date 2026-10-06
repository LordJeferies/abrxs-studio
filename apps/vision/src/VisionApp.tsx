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
  Globe2,
  Image as ImageIcon,
  Languages,
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
import { CinemaGuide } from './CinemaGuide';
import { GenerationSkillPanel } from './GenerationSkillPanel';
import { useVisionI18n } from './i18n';
import {
  brandPresets,
  compileCarouselPrompt,
  compilePrompt,
  defaults,
  parseCarouselCopy,
  type DirectorState,
} from './promptEngine';
import { providerRegistry } from './providerRegistry';
import { saveVisionProject, validateVisionProject, type VisionStoredProject } from './projectStore';
import { normalizeReferenceRole, referenceRoleLabel, referenceRoles } from './skillEngine';
import { StoryboardStudio } from './StoryboardStudio';

type ViewId = 'quick' | 'director' | 'carousel' | 'scene' | 'layers' | 'assets' | 'flow' | 'providers' | 'settings';
type Toast = { id: number; text: string };
type RefItem = { id: string; name: string; role: string };
type NavItem = { id: ViewId; labelKey: string; icon: typeof Sparkles };

const NAV: NavItem[] = [
  { id: 'quick', labelKey: 'nav.quick', icon: Sparkles },
  { id: 'director', labelKey: 'nav.director', icon: Clapperboard },
  { id: 'carousel', labelKey: 'nav.carousel', icon: GalleryHorizontalEnd },
  { id: 'scene', labelKey: 'nav.storyboard', icon: Film },
  { id: 'layers', labelKey: 'nav.layers', icon: Layers3 },
  { id: 'assets', labelKey: 'nav.analyze', icon: ScanSearch },
  { id: 'flow', labelKey: 'nav.space', icon: Workflow },
  { id: 'providers', labelKey: 'nav.providers', icon: Boxes },
  { id: 'settings', labelKey: 'nav.settings', icon: Settings2 },
];

const SELECTS = {
  camera: ['Digital cinema', '35mm film', '65mm cinema', 'Documentary digital', 'Vintage digital'],
  lens: ['Spherical', 'Anamorphic', 'Vintage spherical', 'Macro', 'Telephoto compression'],
  focal: ['24mm', '35mm', '50mm', '85mm', '135mm'],
  aperture: ['f/1.4', 'f/2', 'f/2.8', 'f/4', 'f/8'],
  framing: ['Extreme close-up', 'Close-up', 'Medium close-up', 'Medium', 'Full', 'Wide'],
  angle: ['Eye level', 'Low angle', 'High angle', 'Overhead', 'Profile', 'Dutch angle'],
  movement: ['Static', 'Slow dolly in', 'Dolly out', 'Tracking', 'Orbit', 'Slider right', 'Handheld restrained', 'Crane'],
  lighting: ['Soft motivated window key + practical lamp', 'Soft studio key + subtle rim', 'Hard directional sunlight', 'Low-key practical lighting', 'Overcast natural light', 'High-key commercial lighting'],
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
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}

function downloadText(filename: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="field"><span>{label}</span>{children}</label>; }

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  const { option } = useVisionI18n();
  return <Field label={label}><div className="select-wrap"><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((item) => <option value={item} key={item}>{option(item)}</option>)}</select><ChevronDown size={14}/></div></Field>;
}

function PromptCard({ title, value, onCopy }: { title: string; value: string; onCopy: () => void }) {
  const { t } = useVisionI18n();
  return <article className="prompt-card"><div className="card-head"><div><span className="micro">{t('common.output')}</span><h3>{title}</h3></div><button className="icon-button" type="button" onClick={onCopy} aria-label={`${t('common.copy')} ${title}`}><Copy size={16}/></button></div><p>{value}</p></article>;
}

export function VisionApp() {
  const { language, setLanguage, t, option, lockLabel } = useVisionI18n();
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
  const carouselPrompts = useMemo(() => slides.map((slide) => ({ ...slide, prompt: compileCarouselPrompt(slide, carouselStyle, textMode, director.brandPreset, director.aspect) })), [slides, carouselStyle, textMode, director.brandPreset, director.aspect]);
  const projectPayload = useMemo(() => ({ director, references, carousel: { source: carouselRaw, style: carouselStyle, textMode, prompts: carouselPrompts }, prompts: prompt }), [director, references, carouselRaw, carouselStyle, textMode, carouselPrompts, prompt]);

  useEffect(() => localStorage.setItem('abrxsVisionDirectorV1', JSON.stringify(director)), [director]);
  useEffect(() => localStorage.setItem('abrxsVisionCarouselCopyV1', JSON.stringify(carouselRaw)), [carouselRaw]);
  useEffect(() => localStorage.setItem('abrxsVisionCarouselStyleV1', JSON.stringify(carouselStyle)), [carouselStyle]);
  useEffect(() => localStorage.setItem('abrxsVisionTextModeV1', JSON.stringify(textMode)), [textMode]);
  useEffect(() => localStorage.setItem('abrxsVisionRefsV1', JSON.stringify(references)), [references]);
  useEffect(() => {
    const onOnline = () => setOnline(true); const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline); window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => { const now = new Date().toISOString(); void saveVisionProject({ id: 'default', name: 'Vision Project', schema: 'abrxs.vision-project.v2', createdAt: now, updatedAt: now, payload: projectPayload }).catch(() => undefined); }, 450);
    return () => window.clearTimeout(timer);
  }, [projectPayload]);

  const toast = (text: string) => { const id = Date.now(); setToasts((current) => [...current, { id, text }]); window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 1800); };
  const copy = async (text: string) => { await navigator.clipboard.writeText(text); toast(t('common.copied')); };
  const update = <K extends keyof DirectorState>(key: K, value: DirectorState[K]) => setDirector((current) => ({ ...current, [key]: value }));
  const makeStoredProject = (): VisionStoredProject => { const now = new Date().toISOString(); return { id: 'default', name: 'Vision Project', schema: 'abrxs.vision-project.v2', createdAt: now, updatedAt: now, payload: projectPayload }; };
  const exportProject = () => { downloadText('Abrxs-Vision-Project.json', JSON.stringify(makeStoredProject(), null, 2), 'application/json'); toast(t('common.projectExported')); };
  const importProject = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as VisionStoredProject;
      if (!validateVisionProject(parsed)) throw new Error(language === 'es' ? 'Este archivo no es un proyecto Abrxs Vision V2.' : 'This is not an Abrxs Vision V2 project.');
      const payload = parsed.payload as typeof projectPayload;
      if (!payload?.director || !payload?.carousel) throw new Error(language === 'es' ? 'El proyecto Vision está incompleto.' : 'Vision project payload is incomplete.');
      setDirector(payload.director); setReferences(Array.isArray(payload.references) ? payload.references : []); setCarouselRaw(payload.carousel.source ?? DEFAULT_CAROUSEL); setCarouselStyle(payload.carousel.style ?? 'Premium cinematic editorial design'); setTextMode(payload.carousel.textMode ?? 'separate');
      await saveVisionProject({ ...parsed, updatedAt: new Date().toISOString() }); toast(t('common.projectImported'));
    } catch (reason) { toast(reason instanceof Error ? reason.message : (language === 'es' ? 'No se pudo importar el proyecto' : 'Could not import project')); }
  };
  const exportPromptPack = () => {
    const content = ['# ABRXS VISION PROMPT PACK', '', '## IMAGE PROMPT', prompt.imagePrompt, '', '## MOTION PROMPT', prompt.motionPrompt, '', '## NEGATIVE / AVOID', prompt.negativePrompt, '', '## PRODUCTION SPEC', prompt.productionSpec, '', '## CAROUSEL', ...carouselPrompts.flatMap((slide) => ['', `### SLIDE ${slide.number} · ${slide.title}`, slide.prompt])].join('\n');
    downloadText('Abrxs-Vision-Prompt-Pack.md', content, 'text/markdown'); toast(t('common.promptPackExported'));
  };

  const activePreset = brandPresets.find((item) => item.id === director.brandPreset) ?? brandPresets[0];
  const presetName = t(`brand.${activePreset.id}.name`);
  const presetDescription = t(`brand.${activePreset.id}.description`);
  const currentNav = NAV.find((item) => item.id === view) ?? NAV[0];

  return <div className="vision-app">
    <aside className="rail" aria-label="Vision navigation"><button className="brand-orb" type="button" onClick={() => setView('quick')} aria-label="Abrxs Vision"><span>V</span></button><nav>{NAV.map((item) => { const Icon = item.icon; return <button key={item.id} className={view === item.id ? 'rail-button active' : 'rail-button'} type="button" onClick={() => setView(item.id)} aria-label={t(item.labelKey)} title={t(item.labelKey)}><Icon size={18} strokeWidth={1.8}/></button>; })}</nav><button className="rail-button" type="button" onClick={exportProject} aria-label={t('common.exportProject')} title={t('common.exportProject')}><Download size={18}/></button></aside>

    <section className="workspace-shell">
      <header className="titlebar" data-tauri-drag-region><div className="title-copy"><span className="micro">ABRXS</span><strong>Vision Art Creator</strong><span className={online ? 'status-dot' : 'status-dot offline'}><i/>{online ? t('common.onlineReady') : t('common.offlineReady')}</span></div><div className="title-actions"><input ref={importRef} hidden type="file" accept="application/json,.json" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) void importProject(file); event.currentTarget.value = ''; }}/><button className="subtle-button" type="button" onClick={() => importRef.current?.click()}><Upload size={15}/>{t('common.import')}</button><button className="subtle-button" type="button" onClick={() => { window.location.href = './guide.html'; }}><Film size={15}/>{t('common.guide')}</button><button className="subtle-button" type="button" onClick={exportPromptPack}><Download size={15}/>{t('common.promptPack')}</button><button className="primary-button" type="button" onClick={() => setView('director')}><WandSparkles size={15}/>{t('common.openDirector')}</button></div></header>

      <div className="main-grid">
        <aside className="navigator"><div className="nav-section"><span className="micro">{t('common.workspace')}</span><h2>{t(currentNav.labelKey)}</h2></div><div className="brand-preset-card"><div className="preset-icon"><Palette size={17}/></div><div><span className="micro">VISION DNA</span><strong>{presetName}</strong><p>{presetDescription}</p></div></div><Field label={t('nav.brandVisionPreset')}><div className="select-wrap"><select value={director.brandPreset} onChange={(event) => update('brandPreset', event.target.value)}>{brandPresets.map((preset) => <option value={preset.id} key={preset.id}>{t(`brand.${preset.id}.name`)}</option>)}</select><ChevronDown size={14}/></div></Field><div className="nav-divider"/><span className="micro">{t('common.references')}</span><div className="reference-list">{references.map((ref) => <div className="reference-row" key={ref.id}><div className="ref-thumb"><ImageIcon size={15}/></div><div><strong>{ref.name}</strong><select className="reference-role-select" value={normalizeReferenceRole(ref.role)} onChange={(event) => setReferences((current) => current.map((item) => item.id === ref.id ? { ...item, role: event.target.value } : item))}>{referenceRoles.map((role) => <option value={role} key={role}>{referenceRoleLabel(role, language)}</option>)}</select></div></div>)}{!references.length && <p className="empty-note">{t('nav.noReferences')}</p>}</div><input ref={fileRef} hidden type="file" accept="image/*" multiple onChange={(event) => { const files = Array.from(event.target.files ?? []); setReferences((current) => [...current, ...files.map((file, index) => ({ id: `${Date.now()}-${index}`, name: file.name, role: 'look' }))]); event.currentTarget.value = ''; }}/><button className="wide-button" type="button" onClick={() => fileRef.current?.click()}><Upload size={15}/>{t('common.addReference')}</button></aside>

        <main className="stage">
          {view === 'quick' && <section className="quick-view"><div className="hero-copy"><span className="micro">{t('quick.kicker')}</span><h1>{t('quick.title1')}<br/>{t('quick.title2')}</h1><p>{t('quick.body')}</p></div><div className="composer glass-surface"><textarea value={director.idea} onChange={(event) => update('idea', event.target.value)} aria-label="Visual idea" placeholder={t('quick.placeholder')}/><div className="composer-footer"><div className="composer-pills"><button type="button" onClick={() => setView('director')}><Camera size={14}/>{director.focal}</button><button type="button" onClick={() => setView('director')}><Lightbulb size={14}/>{t('quick.lighting')}</button><button type="button" onClick={() => setView('director')}><Frame size={14}/>{director.aspect}</button></div><button className="generate-button" type="button" onClick={() => toast(t('quick.enhanced'))}><Sparkles size={17}/>{t('quick.enhance')}</button></div></div><div className="output-grid"><PromptCard title={t('quick.heroPrompt')} value={prompt.imagePrompt} onCopy={() => void copy(prompt.imagePrompt)}/><PromptCard title={t('quick.motionPrompt')} value={prompt.motionPrompt} onCopy={() => void copy(prompt.motionPrompt)}/></div><GenerationSkillPanel director={director} references={references} language={language} onCopy={(value) => void copy(value)}/><CinemaGuide compact/></section>}

          {view === 'director' && <section className="director-view"><div className="section-heading"><div><span className="micro">{t('director.kicker')}</span><h1>{t('director.title')}</h1></div><div className="mode-pill"><CircleDot size={13}/>{t('director.lockOn')}</div></div><div className="director-console"><div className="console-section"><div className="console-title"><Camera size={17}/><strong>{t('director.cameraSetup')}</strong></div><div className="control-grid four"><SelectField label={t('director.camera')} value={director.camera} options={SELECTS.camera} onChange={(value) => update('camera', value)}/><SelectField label={t('director.lens')} value={director.lens} options={SELECTS.lens} onChange={(value) => update('lens', value)}/><SelectField label={t('director.focal')} value={director.focal} options={SELECTS.focal} onChange={(value) => update('focal', value)}/><SelectField label={t('director.aperture')} value={director.aperture} options={SELECTS.aperture} onChange={(value) => update('aperture', value)}/></div></div><div className="console-section"><div className="console-title"><Focus size={17}/><strong>{t('director.composition')}</strong></div><div className="control-grid four"><SelectField label={t('director.framing')} value={director.framing} options={SELECTS.framing} onChange={(value) => update('framing', value)}/><SelectField label={t('director.angle')} value={director.angle} options={SELECTS.angle} onChange={(value) => update('angle', value)}/><SelectField label={t('director.movement')} value={director.movement} options={SELECTS.movement} onChange={(value) => update('movement', value)}/><Field label={t('common.aspect')}><input value={director.aspect} onChange={(event) => update('aspect', event.target.value)}/></Field></div></div><div className="console-section"><div className="console-title"><Lightbulb size={17}/><strong>{t('director.lightingLook')}</strong></div><div className="control-grid two"><SelectField label={t('director.lighting')} value={director.lighting} options={SELECTS.lighting} onChange={(value) => update('lighting', value)}/><Field label={t('common.palette')}><input value={director.palette} onChange={(event) => update('palette', event.target.value)}/></Field><Field label={t('common.atmosphere')}><input value={director.atmosphere} onChange={(event) => update('atmosphere', event.target.value)}/></Field><Field label={t('common.style')}><input value={director.style} onChange={(event) => update('style', event.target.value)}/></Field></div></div></div><CinemaGuide/></section>}

          {view === 'carousel' && <section className="carousel-view"><div className="section-heading"><div><span className="micro">{t('carousel.kicker')}</span><h1>{t('carousel.title')}</h1></div><button className="subtle-button" type="button" onClick={exportPromptPack}><Download size={15}/>{t('carousel.exportPack')}</button></div><div className="carousel-layout"><div className="copy-editor"><Field label={t('carousel.slides')}><textarea value={carouselRaw} onChange={(event) => setCarouselRaw(event.target.value)}/></Field><Field label={t('carousel.designStyle')}><input value={carouselStyle} onChange={(event) => setCarouselStyle(event.target.value)}/></Field><div className="segmented">{(['integrated', 'separate', 'clean'] as const).map((mode) => <button key={mode} className={textMode === mode ? 'active' : ''} type="button" onClick={() => setTextMode(mode)}>{mode === 'integrated' ? t('carousel.textInImage') : mode === 'separate' ? t('carousel.textLayer') : t('carousel.cleanImage')}</button>)}</div></div><div className="slide-stack">{carouselPrompts.map((slide) => <article className="slide-card" key={slide.id}><div className="slide-preview"><span>{String(slide.number).padStart(2, '0')}</span><div><strong>{slide.title}</strong><p>{slide.body}</p></div></div><div className="slide-prompt"><span className="micro">{t('carousel.prompt')}</span><p>{slide.prompt}</p></div><button className="icon-button" type="button" onClick={() => void copy(slide.prompt)}><Copy size={15}/></button></article>)}</div></div></section>}

          {view === 'scene' && <StoryboardStudio idea={director.idea} director={director} onCopy={(value) => void copy(value)}/>} 
          {view === 'layers' && <section className="layers-view"><div className="section-heading"><div><span className="micro">{t('layers.kicker')}</span><h1>{t('layers.title')}</h1></div><button className="subtle-button"><SquareStack size={15}/>{t('layers.exportPlan')}</button></div><div className="layer-composer"><div className="layer-preview"><div className="depth-frame back"/><div className="depth-frame middle"/><div className="depth-frame front"/><span>{t('layers.composite')}</span></div><div className="layer-list">{[['06',t('layers.textGraphics'),'transparent · SVG/PNG'],['05',t('layers.foreground'),'transparent · parallax 1.8×'],['04',t('layers.subject'),'transparent · identity locked'],['03',t('layers.midground'),'depth · parallax 0.7×'],['02',t('layers.background'),'clean plate'],['01',t('layers.depthMasks'),'metadata']].map(([n,label,info]) => <div className="layer-row" key={n}><span>{n}</span><div><strong>{label}</strong><small>{info}</small></div><Settings2 size={14}/></div>)}</div></div></section>}
          {view === 'assets' && <section className="asset-view"><div className="section-heading"><div><span className="micro">{t('assets.kicker')}</span><h1>{t('assets.title')}</h1></div></div><AnalyzerPanel/><div className="tool-grid">{[[WandSparkles,'assets.improve','assets.improveDetail'],[Maximize2,'assets.upscale','assets.upscaleDetail'],[Lightbulb,'assets.relight','assets.relightDetail'],[Frame,'assets.reframe','assets.reframeDetail'],[ScanSearch,'assets.semantic','assets.semanticDetail'],[Move3d,'assets.newTake','assets.newTakeDetail']].map(([Icon,labelKey,detailKey]) => { const ToolIcon = Icon as typeof WandSparkles; return <button className="tool-card" type="button" key={labelKey as string} onClick={() => toast(`${t(labelKey as string)} ${t('assets.providerRequired')}`)}><ToolIcon size={20}/><strong>{t(labelKey as string)}</strong><span>{t(detailKey as string)}</span></button>; })}</div></section>}
          {view === 'flow' && <section className="flow-view"><div className="flow-toolbar glass-surface"><span>{t('flow.promptOnly')}</span><span>{director.aspect}</span><span>{t('flow.offlineCore')}</span><button type="button" onClick={() => toast(t('flow.executed'))}><Play size={14}/>{t('flow.run')}</button></div><div className="node node-a"><span className="micro">{t('flow.textDirector')}</span><strong>{director.idea}</strong><div className="node-port out"/></div><svg className="connector" viewBox="0 0 500 220" preserveAspectRatio="none"><path d="M 110 110 C 220 110, 260 165, 390 165"/></svg><div className="node node-b"><span className="micro">{t('flow.imagePrompt')}</span><p>{prompt.imagePrompt.slice(0,220)}…</p><div className="node-port in"/></div><button className="canvas-add" type="button"><Plus size={18}/></button></section>}

          {view === 'providers' && <section className="providers-view"><div className="section-heading"><div><span className="micro">{t('providers.kicker')} · LIVE CAPABILITY REGISTRY</span><h1>{t('providers.title')}</h1><p>{language === 'es' ? 'Vision separa la lógica de prompts de la ejecución. Las capacidades reales se descubren antes de habilitar una generación.' : 'Vision separates prompt intelligence from execution. Live capabilities are discovered before a generation action is enabled.'}</p></div></div><div className="provider-list">{providerRegistry.map((provider) => { const ready = provider.readiness === 'ready'; const status = provider.readiness === 'ready' ? (language === 'es' ? 'LISTO' : 'READY') : provider.readiness === 'discover-live' ? (language === 'es' ? 'DESCUBRIR EN VIVO' : 'DISCOVER LIVE') : (language === 'es' ? 'PREPARADO' : 'PREPARED'); return <div className="provider-row" key={provider.id}><div className={ready ? 'provider-logo ready' : 'provider-logo'}>{provider.label.slice(0,1)}</div><div><strong>{provider.label}</strong><span>{provider.execution}</span><code>{provider.discovery}</code></div><em className={ready ? 'ready' : ''}>{status}</em></div>; })}</div></section>}

          {view === 'settings' && <section className="settings-view"><div className="section-heading"><div><span className="micro">{t('settings.kicker')}</span><h1>{t('settings.title')}</h1><p>{t('settings.body')}</p></div></div><div className="settings-grid"><article className="settings-card"><div className="settings-card-head"><div className="settings-icon"><Languages size={20}/></div><div><strong>{t('settings.language')}</strong><p>{t('settings.languageHelp')}</p></div></div><div className="language-picker"><button className={language === 'en' ? 'active' : ''} type="button" onClick={() => setLanguage('en')}><span>EN</span><div><strong>{t('settings.english')}</strong><small>English</small></div></button><button className={language === 'es' ? 'active' : ''} type="button" onClick={() => setLanguage('es')}><span>ES</span><div><strong>{t('settings.spanish')}</strong><small>Español</small></div></button></div><div className="settings-foot"><Globe2 size={14}/>{t('settings.savedLocally')}</div></article><article className="settings-card"><div className="settings-card-head"><div className="settings-icon"><Globe2 size={20}/></div><div><strong>{language === 'es' ? 'Idioma de salida de prompts' : 'Prompt output language'}</strong><p>{language === 'es' ? 'Independiente del idioma de la interfaz. AUTO conserva el idioma de la idea; EN o ES fuerzan la especificación.' : 'Independent from the UI language. AUTO follows the idea language; EN or ES force the production specification.'}</p></div></div><div className="prompt-language-picker">{(['auto','en','es'] as const).map((value) => <button type="button" key={value} className={(director.outputLanguage ?? 'auto') === value ? 'active' : ''} onClick={() => update('outputLanguage', value)}>{value.toUpperCase()}</button>)}</div></article><article className="settings-card"><div className="settings-card-head"><div className="settings-icon"><Sparkles size={20}/></div><div><strong>{language === 'es' ? 'Motor de skills de generación' : 'Generation skill engine'}</strong><p>{language === 'es' ? 'ABRAXAS mantiene una especificación canónica y la traduce por target. Higgsfield/Seedance/Kling/Veo usan reglas distintas; I2V describe sólo cambios/movimiento.' : 'ABRAXAS keeps a canonical spec and translates per target. Higgsfield/Seedance/Kling/Veo use different grammars; I2V describes motion/change only.'}</p></div></div></article><article className="settings-card"><div className="settings-card-head"><div className="settings-icon"><Sparkles size={20}/></div><div><strong>{t('settings.promptNoteTitle')}</strong><p>{t('settings.promptNote')}</p></div></div></article></div><CinemaGuide compact/></section>}
        </main>

        <aside className="inspector"><div className="inspector-head"><div><span className="micro">{t('inspector.kicker')}</span><strong>{t('inspector.title')}</strong></div><PanelLeftClose size={16}/></div><p className="inspector-copy">{t('inspector.body')}</p><div className="lock-list">{Object.entries(director.preserve).map(([key, enabled]) => <button type="button" key={key} className={enabled ? 'lock-row active' : 'lock-row'} onClick={() => update('preserve', { ...director.preserve, [key]: !enabled })}><span>{lockLabel(key)}</span><i>{enabled ? t('common.locked') : t('common.open')}</i></button>)}</div><div className="inspector-divider"/><span className="micro">{t('inspector.shotFacts')}</span><dl className="facts"><div><dt>{t('common.camera')}</dt><dd>{option(director.camera)}</dd></div><div><dt>{t('common.lens')}</dt><dd>{director.focal} · {option(director.lens)}</dd></div><div><dt>{t('common.frame')}</dt><dd>{option(director.framing)}</dd></div><div><dt>{t('common.move')}</dt><dd>{option(director.movement)}</dd></div><div><dt>{t('common.aspect')}</dt><dd>{director.aspect}</dd></div></dl><button className="wide-button" type="button" onClick={() => { setDirector(defaults); toast(t('inspector.resetDone')); }}><RefreshCw size={15}/>{t('inspector.resetDirector')}</button><button className="wide-button" type="button" onClick={exportProject}><Save size={15}/>{t('inspector.saveExport')}</button></aside>
      </div>
    </section>
    <div className="toast-stack" aria-live="polite">{toasts.map((item) => <div className="toast" key={item.id}>{item.text}</div>)}</div>
  </div>;
}
