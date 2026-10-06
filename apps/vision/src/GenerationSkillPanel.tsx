import { CheckCircle2, Copy, Film, Image as ImageIcon, Play, RefreshCw, ShieldCheck, Sparkles, Timer, Workflow } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  higgsfieldDesktopGenerate,
  higgsfieldDesktopModelSchema,
  higgsfieldDesktopModels,
  higgsfieldDesktopPreflight,
  higgsfieldDesktopStatus,
  isVisionDesktop,
  normalizeHiggsfieldModels,
  type HiggsfieldPreflightResult,
  type HiggsfieldStatus,
  type LiveModelOption,
} from './desktopBridge';
import {
  compileProfessionalPrompt,
  professionalBriefDefaults,
  type ProfessionalPromptBrief,
} from './professionalPromptEngine';
import type { DirectorState } from './promptEngine';
import {
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
const BRIEF_KEY = 'abrxsVisionProfessionalBriefV1';
const BRIEF_EVENT = 'abrxs-vision-professional-brief';

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
function storedBrief(): ProfessionalPromptBrief {
  try {
    const raw = localStorage.getItem(BRIEF_KEY);
    return raw ? { ...professionalBriefDefaults, ...(JSON.parse(raw) as Partial<ProfessionalPromptBrief>) } : professionalBriefDefaults;
  } catch {
    return professionalBriefDefaults;
  }
}

function gateLabel(id: string, fallback: string, es: boolean) {
  const labels: Record<string, [string, string]> = {
    canonical: ['Canonical production spec', 'Especificación canónica'],
    want: ['What I want', 'Qué quiero'],
    'must-have': ['Must-have clarity', 'Claridad de obligatorios'],
    'do-not': ['No Prompt / exclusion intent', 'No Prompt / exclusiones'],
    output: ['Output contract', 'Contrato de salida'],
    'mode-output': ['Output / mode compatibility', 'Compatibilidad output / modo'],
    'action-load': ['Action load', 'Carga de acciones'],
    'camera-load': ['Camera load', 'Carga de cámara'],
    'anti-slop': ['Anti-slop language', 'Lenguaje anti-slop'],
    emotion: ['Performance specificity', 'Especificidad de actuación'],
    i2v: ['I2V first-frame contract', 'Contrato de primer fotograma I2V'],
    'literal-text': ['Literal text risk', 'Riesgo de texto literal'],
    constraints: ['Constraint translation', 'Traducción de restricciones'],
    'prompt-budget': ['Provider prompt budget', 'Presupuesto del prompt'],
  };
  const pair = labels[id];
  return pair ? (es ? pair[1] : pair[0]) : fallback;
}

function localWarning(warning: string, es: boolean) {
  if (!es) return warning;
  return warning
    .replace('Replace vague quality adjectives with concrete camera, light, material, behavior or composition decisions.', 'Reemplaza adjetivos vagos por decisiones concretas de cámara, luz, material, conducta o composición.')
    .replace('Generic emotion detected. Describe physical performance instead of leaving the model to choose a random emotional realization.', 'Se detectó una emoción genérica. Describe actuación física en vez de dejar al modelo elegir una realización aleatoria.')
    .replace('The shot carries too many action phases. Split the scene or reduce it to one primary action plus one or two secondary motions.', 'El plano tiene demasiadas fases de acción. Divide la escena o conserva una acción principal y una o dos secundarias.')
    .replace('The shot carries too many camera moves. Sequence them explicitly or split the shot.', 'El plano tiene demasiados movimientos de cámara. Ordénalos explícitamente o divide el plano.')
    .replace('Do not execute I2V until an actual first frame is supplied.', 'No ejecutes I2V hasta aportar un primer fotograma real.')
    .replace('Exact text is safer as a separate typography layer unless the selected live model proves reliable text rendering.', 'El texto exacto es más seguro como capa tipográfica separada salvo que el modelo vivo demuestre buena fidelidad de texto.')
    .replace('Negative/exclusion support must be mapped from the live provider schema before execution.', 'El soporte de negativos/exclusiones debe resolverse desde el esquema vivo del proveedor antes de ejecutar.')
    .replace('Target prompt exceeds the provider prompt budget and must be compressed before execution.', 'El prompt supera el presupuesto del proveedor y debe comprimirse antes de ejecutar.')
    .replace('The must-have list is becoming a second prompt. Split the asset/shot or move structural detail into the canonical scene fields.', 'La lista de obligatorios se está convirtiendo en un segundo prompt. Divide el asset/plano o mueve el detalle estructural a los campos canónicos.');
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
  const [brief, setBrief] = useState<ProfessionalPromptBrief>(storedBrief);
  const [desktopStatus, setDesktopStatus] = useState<HiggsfieldStatus | null>(null);
  const [liveModels, setLiveModels] = useState<LiveModelOption[]>([]);
  const [modelId, setModelId] = useState('');
  const [modelSchema, setModelSchema] = useState<unknown>(null);
  const [preflight, setPreflight] = useState<HiggsfieldPreflightResult | null>(null);
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
    const syncBrief = (event: Event) => {
      const custom = event as CustomEvent<ProfessionalPromptBrief>;
      setBrief(custom.detail ?? storedBrief());
    };
    window.addEventListener(BRIEF_EVENT, syncBrief);
    return () => window.removeEventListener(BRIEF_EVENT, syncBrief);
  }, []);
  useEffect(() => {
    if (!desktop) return;
    void higgsfieldDesktopStatus().then(setDesktopStatus).catch((error) => setDesktopStatus({ installed: false, error: String(error) }));
  }, [desktop]);
  useEffect(() => { setPreflight(null); setConfirmSpend(false); }, [modelId, mode, duration, startImage, resolution, director.aspect, brief]);

  const normalizedRefs = useMemo(() => references.map((reference) => ({ ...reference, role: normalizeReferenceRole(reference.role) })), [references]);
  const firstFrameTagged = normalizedRefs.some((reference) => reference.role === 'first-frame');
  const compilation = useMemo(() => compileProfessionalPrompt({
    director,
    target,
    mode,
    intent,
    duration,
    references: normalizedRefs,
    startImageProvided: Boolean(startImage.trim()) || firstFrameTagged,
    brief,
  }), [director, target, mode, intent, duration, normalizedRefs, startImage, firstFrameTagged, brief]);
  const route = useMemo(() => recommendGenerationRoute({
    mode,
    intent,
    identityCritical: normalizedRefs.some((reference) => reference.role === 'identity'),
    multiShot: intent === 'cinematic' || intent === 'social-hook',
    videoEdit: mode === 'video-edit',
  }), [mode, intent, normalizedRefs]);

  const modeLabel = (value: GenerationMode) => {
    const labels: Record<GenerationMode, [string, string]> = {
      'text-to-image': ['Text → Image', 'Texto → Imagen'],
      'image-to-image': ['Image → Image', 'Imagen → Imagen'],
      'text-to-video': ['Text → Video', 'Texto → Video'],
      'image-to-video': ['Image → Video', 'Imagen → Video'],
      'video-edit': ['Video edit', 'Edición de video'],
    };
    return es ? labels[value][1] : labels[value][0];
  };
  const intentLabel = (value: GenerationIntent) => {
    const labels: Record<GenerationIntent, [string, string]> = {
      cinematic: ['Cinematic scene', 'Escena cinematográfica'],
      'social-hook': ['Social hook', 'Hook social'],
      'podcast-visual': ['Podcast visual', 'Visual de podcast'],
      product: ['Product', 'Producto'],
      education: ['Educational', 'Educativo'],
      documentary: ['Documentary', 'Documental'],
      dialogue: ['Dialogue', 'Diálogo'],
      faceless: ['Faceless', 'Faceless'],
      carousel: ['Carousel', 'Carrusel'],
    };
    return es ? labels[value][1] : labels[value][0];
  };
  const routeText = () => {
    if (!es) return route.rationale[0];
    if (route.primary === 'higgsfield-cinema') return 'Resuelve primero un frame/shot cinematográfico con referencias y continuidad antes de variantes costosas.';
    if (route.primary === 'higgsfield-seedance') return 'Este trabajo se beneficia de beats temporales explícitos, referencias con rol y continuidad de corto formato.';
    if (route.primary === 'higgsfield-kling') return 'El trabajo requiere una ruta de video/edit compatible y validación del esquema vivo antes de enviar material.';
    if (route.primary === 'veo') return 'El audio forma parte de la intención; verifica en vivo que el modelo elegido soporte la configuración requerida.';
    if (route.primary === 'comfyui') return 'La ejecución local depende del workflow y de los nodos instalados; valida ambos antes de generar.';
    return 'Vision conserva la especificación canónica y valida capacidades reales antes de ejecutar.';
  };

  const refreshModels = async () => {
    if (!desktop) return;
    setProviderBusy(true); setProviderMessage(''); setProviderResult(null);
    try {
      const status = await higgsfieldDesktopStatus(); setDesktopStatus(status);
      if (!status.installed) throw new Error(status.error || 'Higgsfield CLI not installed.');
      const payload = await higgsfieldDesktopModels();
      const models = normalizeHiggsfieldModels(payload); setLiveModels(models);
      setProviderMessage(models.length ? (es ? `${models.length} modelos descubiertos en vivo.` : `${models.length} live models discovered.`) : (es ? 'El CLI respondió, pero el catálogo no pudo normalizarse. Puedes escribir el model id manualmente.' : 'CLI responded, but the catalog could not be normalized. You can type the model id manually.'));
    } catch (error) { setProviderMessage(error instanceof Error ? error.message : String(error)); }
    finally { setProviderBusy(false); }
  };

  const inspectModel = async (nextModel: string) => {
    setModelId(nextModel); setModelSchema(null); setPreflight(null); setProviderResult(null); setConfirmSpend(false);
    if (!desktop || !nextModel) return;
    try { setModelSchema(await higgsfieldDesktopModelSchema(nextModel)); } catch (error) { setProviderMessage(error instanceof Error ? error.message : String(error)); }
  };

  const validateSetup = async () => {
    if (!desktop || !modelId) return null;
    setProviderBusy(true); setProviderMessage(''); setProviderResult(null);
    try {
      const result = await higgsfieldDesktopPreflight({
        modelId,
        aspectRatio: director.aspect,
        duration: mode.includes('video') ? duration : undefined,
        startImage: startImage.trim() || undefined,
        resolution: resolution.trim() || undefined,
      });
      setPreflight(result);
      const omitted = result.plan?.omitted?.length ?? 0;
      setProviderMessage(es ? `Preflight listo. ${result.plan?.applied?.length ?? 0} parámetros aceptados${omitted ? `; ${omitted} omitidos por el esquema vivo` : ''}.` : `Preflight ready. ${result.plan?.applied?.length ?? 0} parameters accepted${omitted ? `; ${omitted} omitted by the live schema` : ''}.`);
      return result;
    } catch (error) {
      setPreflight(null); setProviderMessage(error instanceof Error ? error.message : String(error)); return null;
    } finally { setProviderBusy(false); }
  };

  const generate = async () => {
    if (!desktop || !modelId || !confirmSpend || compilation.quality.grade === 'D') return;
    if (mode === 'image-to-video' && !startImage.trim()) {
      setProviderMessage(es ? 'Para ejecutar I2V en Desktop escribe la ruta local del primer fotograma. Una referencia de identidad no sustituye el frame inicial.' : 'For Desktop I2V execution, provide the local first-frame path. An identity reference does not replace the starting frame.');
      return;
    }
    const checked = preflight ?? await validateSetup();
    if (!checked) return;
    setProviderBusy(true); setProviderMessage(es ? 'Generando mediante el CLI oficial de Higgsfield…' : 'Generating through the official Higgsfield CLI…'); setProviderResult(null);
    try {
      const result = await higgsfieldDesktopGenerate({ modelId, prompt: compilation.targetPrompt, aspectRatio: director.aspect, duration: mode.includes('video') ? duration : undefined, startImage: startImage.trim() || undefined, resolution: resolution.trim() || undefined, confirmSpend });
      setProviderResult(result); setPreflight(result.preflight ? { ok: true, modelId, plan: result.preflight } : checked);
      setProviderMessage(es ? 'Trabajo completado. Revisa la respuesta del proveedor y el preflight aplicado.' : 'Job completed. Review the provider response and applied preflight.'); setConfirmSpend(false);
    } catch (error) { setProviderMessage(error instanceof Error ? error.message : String(error)); }
    finally { setProviderBusy(false); }
  };

  return <section className="skill-engine-panel">
    <div className="skill-engine-head"><div><span className="micro">VISUAL GENERATION TRANSLATOR · V0.6</span><h2>{es ? 'Un brief profesional. Una traducción distinta por modelo.' : 'One professional brief. A different translation per model.'}</h2><p>{es ? 'Edita Qué quiero / No Prompt / Output / Performance en Prompt Lab. Esta sección toma ese mismo brief y lo convierte al target, valida calidad y prepara ejecución.' : 'Edit What I want / No Prompt / Output / Performance in Prompt Lab. This section consumes that same brief, translates it to the target, validates quality and prepares execution.'}</p></div><div className={`skill-score grade-${compilation.quality.grade.toLowerCase()}`}><strong>{compilation.quality.grade}</strong><span>{compilation.quality.score}/100</span></div></div>

    <div className="skill-engine-grid"><div className="skill-controls-card"><label><span>{es ? 'Destino' : 'Target'}</span><select value={target} onChange={(event) => { setTarget(event.target.value as GenerationTargetId); setModelId(''); setModelSchema(null); setPreflight(null); setProviderResult(null); setConfirmSpend(false); }}>{targetProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.label}</option>)}</select></label><label><span>{es ? 'Modo' : 'Mode'}</span><select value={mode} onChange={(event) => setMode(event.target.value as GenerationMode)}>{MODES.map((value) => <option key={value} value={value}>{modeLabel(value)}</option>)}</select></label><label><span>{es ? 'Intención' : 'Intent'}</span><select value={intent} onChange={(event) => setIntent(event.target.value as GenerationIntent)}>{generationIntents.map((value) => <option key={value} value={value}>{intentLabel(value)}</option>)}</select></label><label><span>{es ? 'Duración' : 'Duration'}</span><div className="skill-duration"><Timer size={14}/><input type="number" min={2} max={60} value={duration} disabled={!mode.includes('video')} onChange={(event) => setDuration(Math.max(2, Math.min(60, Number(event.target.value) || 8)))}/><small>s</small></div></label><div className="route-card"><Workflow size={16}/><div><span className="micro">{es ? 'RUTA SUGERIDA' : 'SUGGESTED ROUTE'}</span><strong>{targetProfiles.find((profile) => profile.id === route.primary)?.label ?? route.primary}</strong><p>{routeText()}</p></div></div><div className="skill-badges"><span>MCSLA</span><span>I2V Δ</span><span>OUTPUT CONTRACT</span><span>NO-PROMPT POLICY</span><span>CONTINUITY</span><span>LIVE SCHEMA</span></div></div>

      <article className="skill-output-card"><div className="skill-output-head"><div><span className="micro">{es ? 'PROMPT DEL TARGET' : 'TARGET PROMPT'}</span><strong>{targetProfiles.find((profile) => profile.id === target)?.label ?? target} · {compilation.outputProfile.label[language]}</strong></div><button className="icon-button" type="button" onClick={() => onCopy(compilation.targetPrompt)} aria-label="Copy target prompt"><Copy size={15}/></button></div><pre>{compilation.targetPrompt}</pre><details className="provider-schema"><summary>{es ? 'Contrato + parámetros + restricciones' : 'Contract + parameters + constraints'}</summary><pre>{JSON.stringify({ output: compilation.outputContract, parameters: compilation.parameterPack, constraints: compilation.constraintPack }, null, 2)}</pre></details></article></div>

    <div className="quality-gates">{compilation.quality.gates.map((gate) => <div className={gate.passed ? 'quality-gate pass' : 'quality-gate fail'} key={gate.id}><ShieldCheck size={14}/><div><strong>{gateLabel(gate.id, gate.label, es)}</strong><span>{gate.detail}</span></div></div>)}</div>
    {compilation.quality.warnings.length > 0 && <div className="skill-warning-list">{compilation.quality.warnings.map((warning) => <p key={warning}><Sparkles size={13}/>{localWarning(warning, es)}</p>)}</div>}

    {HIGGSFIELD_TARGETS.includes(target) && <section className="live-provider-card">
      <div className="live-provider-head"><div><span className="micro">HIGGSFIELD · OFFICIAL CLI BRIDGE</span><strong>{desktop ? (desktopStatus?.installed ? (es ? 'Desktop conectado' : 'Desktop connected') : (es ? 'CLI por verificar' : 'CLI check required')) : (es ? 'Ejecución disponible en Desktop' : 'Execution available in Desktop')}</strong><p>{desktop ? (desktopStatus?.installed ? `${desktopStatus.version || 'Higgsfield CLI'} · ${desktopStatus.binary || ''}` : desktopStatus?.error || (es ? 'Presiona actualizar para detectar el CLI.' : 'Refresh to detect the CLI.')) : (es ? 'La PWA compila prompts. Para ejecución con credenciales usa Desktop.' : 'The PWA compiles prompts. Use Desktop for credentialed provider execution.')}</p></div><button className="subtle-button" type="button" disabled={!desktop || providerBusy} onClick={() => void refreshModels()}><RefreshCw size={14}/>{es ? 'Descubrir modelos' : 'Discover models'}</button></div>
      {desktop && <div className="live-provider-grid"><label><span>{es ? 'Modelo en vivo' : 'Live model'}</span><div className="live-model-row"><select value={modelId} onChange={(event) => void inspectModel(event.target.value)}><option value="">{es ? 'Selecciona del catálogo…' : 'Select from live catalog…'}</option>{liveModels.map((model) => <option value={model.id} key={model.id}>{model.name} · {model.id}</option>)}</select><input value={modelId} onChange={(event) => void inspectModel(event.target.value)} placeholder="job_set_type / model id"/></div></label><label><span>{es ? 'Resolución (opcional)' : 'Resolution (optional)'}</span><input value={resolution} onChange={(event) => setResolution(event.target.value)} placeholder="1080p / 2k / provider default"/></label>{mode === 'image-to-video' && <label className="live-provider-wide"><span>{es ? 'Ruta local del primer fotograma' : 'Local first-frame path'}</span><input value={startImage} onChange={(event) => setStartImage(event.target.value)} placeholder="/Users/.../frame.png"/></label>}<div className="live-provider-wide provider-safety"><label><input type="checkbox" checked={confirmSpend} onChange={(event) => setConfirmSpend(event.target.checked)}/><span>{es ? 'Confirmo esta generación y acepto que puede consumir créditos del proveedor.' : 'I confirm this generation and understand it may consume provider credits.'}</span></label><div className="provider-action-row"><button className="subtle-button" type="button" disabled={providerBusy || !desktopStatus?.installed || !modelId} onClick={() => void validateSetup()}><CheckCircle2 size={14}/>{es ? 'Validar setup' : 'Validate setup'}</button><button className="primary-button" type="button" disabled={providerBusy || !desktopStatus?.installed || !modelId || !confirmSpend || compilation.quality.grade === 'D'} onClick={() => void generate()}><Play size={14}/>{providerBusy ? (es ? 'Procesando…' : 'Processing…') : (es ? 'Generar en Higgsfield' : 'Generate in Higgsfield')}</button></div></div></div>}
      {desktop && !desktopStatus?.installed && <div className="provider-install-note"><code>brew install higgsfield-ai/tap/higgsfield</code><code>higgsfield auth login</code></div>}
      {providerMessage && <p className="provider-message">{providerMessage}</p>}
      {preflight?.plan && <details className="provider-schema" open><summary>{es ? 'Preflight · parámetros que Vision enviará' : 'Preflight · parameters Vision will submit'}</summary><pre>{JSON.stringify(preflight.plan, null, 2)}</pre></details>}
      {modelSchema != null && <details className="provider-schema"><summary>{es ? 'Ver esquema vivo del modelo' : 'View live model schema'}</summary><pre>{JSON.stringify(modelSchema, null, 2)}</pre></details>}
      {providerResult != null && <details className="provider-schema" open><summary>{es ? 'Resultado del trabajo' : 'Job result'}</summary><pre>{JSON.stringify(providerResult, null, 2)}</pre></details>}
    </section>}

    <div className="skill-foot"><span><ImageIcon size={13}/>{normalizedRefs.length} {es ? 'referencias con rol' : 'role-tagged references'}</span><span><Film size={13}/>{compilation.timeline.length} {es ? 'beats temporales' : 'temporal beats'}</span><span>{compilation.provenance.slice(0, 7).join(' · ')}</span></div>
  </section>;
}
