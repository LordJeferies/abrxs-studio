import { Copy, Film, Image as ImageIcon, Play, RefreshCw, ShieldCheck, Sparkles, Timer, Workflow } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  higgsfieldDesktopGenerate,
  higgsfieldDesktopModelSchema,
  higgsfieldDesktopModels,
  higgsfieldDesktopStatus,
  isVisionDesktop,
  normalizeHiggsfieldModels,
  type HiggsfieldStatus,
  type LiveModelOption,
} from './desktopBridge';
import type { DirectorState } from './promptEngine';
import {
  compileSkillPrompt,
  generationIntents,
  normalizeReferenceRole,
  recommendGenerationRoute,
  targetProfiles,
  type GenerationIntent,
  type GenerationMode,
  type GenerationTargetId,
} from './skillEngine';

const MODES: GenerationMode[] = ['text-to-image', 'image-to-image', 'text-to-video', 'image-to-video', 'video-edit'];
const HIGGSFIELD_TARGETS: GenerationTargetId[] = ['higgsfield-cinema', 'higgsfield-seedance', 'higgsfield-kling', 'veo'];

function storedTarget(): GenerationTargetId {
  const value = localStorage.getItem('abrxsVisionSkillTargetV1') as GenerationTargetId | null;
  return targetProfiles.some((profile) => profile.id === value) ? value! : 'higgsfield-seedance';
}
function storedMode(): GenerationMode {
  const value = localStorage.getItem('abrxsVisionSkillModeV1') as GenerationMode | null;
  return MODES.includes(value as GenerationMode) ? value! : 'text-to-video';
}
function storedIntent(): GenerationIntent {
  const value = localStorage.getItem('abrxsVisionSkillIntentV1') as GenerationIntent | null;
  return generationIntents.includes(value as GenerationIntent) ? value! : 'cinematic';
}

export function GenerationSkillPanel({
  director,
  references,
  language,
  onCopy,
}: {
  director: DirectorState;
  references: Array<{ name: string; role: string }>;
  language: 'en' | 'es';
  onCopy: (value: string) => void;
}) {
  const [target, setTarget] = useState<GenerationTargetId>(storedTarget);
  const [mode, setMode] = useState<GenerationMode>(storedMode);
  const [intent, setIntent] = useState<GenerationIntent>(storedIntent);
  const [duration, setDuration] = useState(8);
  const [desktopStatus, setDesktopStatus] = useState<HiggsfieldStatus | null>(null);
  const [liveModels, setLiveModels] = useState<LiveModelOption[]>([]);
  const [modelId, setModelId] = useState('');
  const [modelSchema, setModelSchema] = useState<unknown>(null);
  const [startImage, setStartImage] = useState('');
  const [resolution, setResolution] = useState('');
  const [confirmSpend, setConfirmSpend] = useState(false);
  const [providerBusy, setProviderBusy] = useState(false);
  const [providerMessage, setProviderMessage] = useState('');
  const [providerResult, setProviderResult] = useState<unknown>(null);
  const es = language === 'es';
  const desktop = isVisionDesktop();

  useEffect(() => localStorage.setItem('abrxsVisionSkillTargetV1', target), [target]);
  useEffect(() => localStorage.setItem('abrxsVisionSkillModeV1', mode), [mode]);
  useEffect(() => localStorage.setItem('abrxsVisionSkillIntentV1', intent), [intent]);
  useEffect(() => {
    if (!desktop) return;
    void higgsfieldDesktopStatus().then(setDesktopStatus).catch((error) => setDesktopStatus({ installed: false, error: String(error) }));
  }, [desktop]);

  const normalizedRefs = useMemo(() => references.map((reference) => ({ ...reference, role: normalizeReferenceRole(reference.role) })), [references]);
  const firstFrameTagged = normalizedRefs.some((reference) => reference.role === 'first-frame');
  const compilation = useMemo(() => compileSkillPrompt({
    director,
    mode,
    target,
    intent,
    duration,
    references: normalizedRefs,
    startImageProvided: Boolean(startImage.trim()) || firstFrameTagged,
  }), [director, mode, target, intent, duration, normalizedRefs, startImage, firstFrameTagged]);
  const route = useMemo(() => recommendGenerationRoute({
    mode,
    intent,
    identityCritical: normalizedRefs.some((reference) => reference.role === 'identity'),
    multiShot: intent === 'cinematic' || intent === 'social-hook',
    videoEdit: mode === 'video-edit',
  }), [mode, intent, normalizedRefs]);

  const modeLabel = (value: GenerationMode) => {
    const labels: Record<GenerationMode, [string, string]> = {
      'text-to-image': ['Text → Image', 'Texto → Imagen'], 'image-to-image': ['Image → Image', 'Imagen → Imagen'], 'text-to-video': ['Text → Video', 'Texto → Video'], 'image-to-video': ['Image → Video', 'Imagen → Video'], 'video-edit': ['Video edit', 'Edición de video'],
    };
    return es ? labels[value][1] : labels[value][0];
  };
  const intentLabel = (value: GenerationIntent) => {
    const labels: Record<GenerationIntent, [string, string]> = {
      cinematic: ['Cinematic scene', 'Escena cinematográfica'], 'social-hook': ['Social hook', 'Hook social'], 'podcast-visual': ['Podcast visual', 'Visual de podcast'], product: ['Product', 'Producto'], education: ['Educational', 'Educativo'], documentary: ['Documentary', 'Documental'], dialogue: ['Dialogue', 'Diálogo'], faceless: ['Faceless', 'Faceless'], carousel: ['Carousel', 'Carrusel'],
    };
    return es ? labels[value][1] : labels[value][0];
  };

  const refreshModels = async () => {
    if (!desktop) return;
    setProviderBusy(true); setProviderMessage(''); setProviderResult(null);
    try {
      const status = await higgsfieldDesktopStatus(); setDesktopStatus(status);
      if (!status.installed) throw new Error(status.error || 'Higgsfield CLI not installed.');
      const payload = await higgsfieldDesktopModels();
      const models = normalizeHiggsfieldModels(payload); setLiveModels(models);
      if (!models.length) setProviderMessage(es ? 'El CLI respondió, pero no pude normalizar el catálogo. Puedes escribir el model id manualmente.' : 'CLI responded, but the catalog shape could not be normalized. You can type the model id manually.');
      else setProviderMessage(es ? `${models.length} modelos descubiertos en vivo.` : `${models.length} live models discovered.`);
    } catch (error) { setProviderMessage(error instanceof Error ? error.message : String(error)); }
    finally { setProviderBusy(false); }
  };

  const inspectModel = async (nextModel: string) => {
    setModelId(nextModel); setModelSchema(null); setProviderResult(null); setConfirmSpend(false);
    if (!desktop || !nextModel) return;
    try { setModelSchema(await higgsfieldDesktopModelSchema(nextModel)); } catch (error) { setProviderMessage(error instanceof Error ? error.message : String(error)); }
  };

  const generate = async () => {
    if (!desktop || !modelId || !confirmSpend) return;
    if (mode === 'image-to-video' && !startImage.trim()) {
      setProviderMessage(es ? 'Para ejecutar I2V en Desktop escribe la ruta local del primer fotograma. Una referencia de identidad no sustituye el frame inicial.' : 'For Desktop I2V execution, provide the local first-frame path. An identity reference does not replace the starting frame.');
      return;
    }
    setProviderBusy(true); setProviderMessage(es ? 'Generando mediante el CLI oficial de Higgsfield…' : 'Generating through the official Higgsfield CLI…'); setProviderResult(null);
    try {
      const result = await higgsfieldDesktopGenerate({ modelId, prompt: compilation.providerPrompt, aspectRatio: director.aspect, duration: mode.includes('video') ? duration : undefined, startImage: startImage.trim() || undefined, resolution: resolution.trim() || undefined, confirmSpend });
      setProviderResult(result); setProviderMessage(es ? 'Trabajo completado. Revisa la respuesta del proveedor.' : 'Job completed. Review the provider response.'); setConfirmSpend(false);
    } catch (error) { setProviderMessage(error instanceof Error ? error.message : String(error)); }
    finally { setProviderBusy(false); }
  };

  return <section className="skill-engine-panel">
    <div className="skill-engine-head"><div><span className="micro">VISUAL GENERATION SKILL ENGINE · V0.4</span><h2>{es ? 'Compila para el modelo, no sólo “un prompt”.' : 'Compile for the model, not just “a prompt”.'}</h2><p>{es ? 'Vision conserva una especificación ABRAXAS canónica y la traduce a una gramática adecuada para Higgsfield/Seedance/Kling/Veo/ComfyUI sin perder intención, continuidad ni restricciones.' : 'Vision keeps one canonical ABRAXAS production spec and translates it into the target grammar for Higgsfield/Seedance/Kling/Veo/ComfyUI without losing intent, continuity or constraints.'}</p></div><div className={`skill-score grade-${compilation.quality.grade.toLowerCase()}`}><strong>{compilation.quality.grade}</strong><span>{compilation.quality.score}/100</span></div></div>

    <div className="skill-engine-grid"><div className="skill-controls-card"><label><span>{es ? 'Destino' : 'Target'}</span><select value={target} onChange={(event) => { setTarget(event.target.value as GenerationTargetId); setModelId(''); setModelSchema(null); setProviderResult(null); setConfirmSpend(false); }}>{targetProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.label}</option>)}</select></label><label><span>{es ? 'Modo' : 'Mode'}</span><select value={mode} onChange={(event) => setMode(event.target.value as GenerationMode)}>{MODES.map((value) => <option key={value} value={value}>{modeLabel(value)}</option>)}</select></label><label><span>{es ? 'Intención' : 'Intent'}</span><select value={intent} onChange={(event) => setIntent(event.target.value as GenerationIntent)}>{generationIntents.map((value) => <option key={value} value={value}>{intentLabel(value)}</option>)}</select></label><label><span>{es ? 'Duración' : 'Duration'}</span><div className="skill-duration"><Timer size={14}/><input type="number" min={2} max={60} value={duration} disabled={!mode.includes('video')} onChange={(event) => setDuration(Math.max(2, Math.min(60, Number(event.target.value) || 8)))}/><small>s</small></div></label><div className="route-card"><Workflow size={16}/><div><span className="micro">{es ? 'RUTA SUGERIDA' : 'SUGGESTED ROUTE'}</span><strong>{targetProfiles.find((profile) => profile.id === route.primary)?.label ?? route.primary}</strong><p>{route.rationale[0]}</p></div></div><div className="skill-badges"><span>MCSLA</span><span>I2V Δ</span><span>CONTINUITY</span><span>QA GATES</span><span>PROVIDER-AWARE</span></div></div>

      <article className="skill-output-card"><div className="skill-output-head"><div><span className="micro">{es ? 'PROMPT DEL DESTINO' : 'TARGET PROMPT'}</span><strong>{compilation.target.label}</strong></div><button className="icon-button" type="button" onClick={() => onCopy(compilation.providerPrompt)} aria-label="Copy target prompt"><Copy size={15}/></button></div><pre>{compilation.providerPrompt}</pre></article></div>

    <div className="quality-gates">{compilation.quality.gates.map((gate) => <div className={gate.passed ? 'quality-gate pass' : 'quality-gate fail'} key={gate.id}><ShieldCheck size={14}/><div><strong>{gate.label}</strong><span>{gate.detail}</span></div></div>)}</div>
    {compilation.quality.warnings.length > 0 && <div className="skill-warning-list">{compilation.quality.warnings.map((warning) => <p key={warning}><Sparkles size={13}/>{warning}</p>)}</div>}

    {HIGGSFIELD_TARGETS.includes(target) && <section className="live-provider-card">
      <div className="live-provider-head"><div><span className="micro">HIGGSFIELD · OFFICIAL CLI BRIDGE</span><strong>{desktop ? (desktopStatus?.installed ? (es ? 'Desktop conectado' : 'Desktop connected') : (es ? 'CLI por verificar' : 'CLI check required')) : (es ? 'Ejecución disponible en Desktop' : 'Execution available in Desktop')}</strong><p>{desktop ? (desktopStatus?.installed ? `${desktopStatus.version || 'Higgsfield CLI'} · ${desktopStatus.binary || ''}` : desktopStatus?.error || (es ? 'Presiona actualizar para detectar el CLI.' : 'Refresh to detect the CLI.')) : (es ? 'La PWA compila prompts; para ejecutar el proveedor usa la app macOS, donde las credenciales permanecen fuera del proyecto.' : 'The PWA compiles prompts; use the macOS app for provider execution so credentials stay outside the project.')}</p></div><button className="subtle-button" type="button" disabled={!desktop || providerBusy} onClick={() => void refreshModels()}><RefreshCw size={14}/>{es ? 'Descubrir modelos' : 'Discover models'}</button></div>

      {desktop && <div className="live-provider-grid"><label><span>{es ? 'Modelo en vivo' : 'Live model'}</span><div className="live-model-row"><select value={modelId} onChange={(event) => void inspectModel(event.target.value)}><option value="">{es ? 'Selecciona del catálogo…' : 'Select from live catalog…'}</option>{liveModels.map((model) => <option value={model.id} key={model.id}>{model.name} · {model.id}</option>)}</select><input value={modelId} onChange={(event) => void inspectModel(event.target.value)} placeholder="job_set_type / model id"/></div></label><label><span>{es ? 'Resolución (opcional)' : 'Resolution (optional)'}</span><input value={resolution} onChange={(event) => setResolution(event.target.value)} placeholder="1080p / 2k / provider default"/></label>{mode === 'image-to-video' && <label className="live-provider-wide"><span>{es ? 'Ruta local del primer fotograma' : 'Local first-frame path'}</span><input value={startImage} onChange={(event) => setStartImage(event.target.value)} placeholder="/Users/.../frame.png"/></label>}<div className="live-provider-wide provider-safety"><label><input type="checkbox" checked={confirmSpend} onChange={(event) => setConfirmSpend(event.target.checked)}/><span>{es ? 'Confirmo esta generación y acepto que puede consumir créditos del proveedor.' : 'I confirm this generation and understand it may consume provider credits.'}</span></label><button className="primary-button" type="button" disabled={providerBusy || !desktopStatus?.installed || !modelId || !confirmSpend} onClick={() => void generate()}><Play size={14}/>{providerBusy ? (es ? 'Procesando…' : 'Processing…') : (es ? 'Generar en Higgsfield' : 'Generate in Higgsfield')}</button></div></div>}

      {desktop && !desktopStatus?.installed && <div className="provider-install-note"><code>brew install higgsfield-ai/tap/higgsfield</code><code>higgsfield auth login</code></div>}
      {providerMessage && <p className="provider-message">{providerMessage}</p>}
      {modelSchema != null && <details className="provider-schema"><summary>{es ? 'Ver esquema vivo del modelo' : 'View live model schema'}</summary><pre>{JSON.stringify(modelSchema, null, 2)}</pre></details>}
      {providerResult != null && <details className="provider-schema" open><summary>{es ? 'Resultado del trabajo' : 'Job result'}</summary><pre>{JSON.stringify(providerResult, null, 2)}</pre></details>}
    </section>}

    <div className="skill-foot"><span><ImageIcon size={13}/>{normalizedRefs.length} {es ? 'referencias con rol' : 'role-tagged references'}</span><span><Film size={13}/>{compilation.timeline.length} {es ? 'beats temporales' : 'temporal beats'}</span><span>{compilation.provenance.slice(0, 5).join(' · ')}</span></div>
  </section>;
}
