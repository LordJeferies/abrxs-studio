import {
  Ban,
  CheckCircle2,
  Copy,
  Film,
  Image as ImageIcon,
  PackageCheck,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Timer,
  Type,
  Workflow,
} from 'lucide-react';
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
import { getOutputProfile, outputProfiles, type PromptOutputProfileId } from './outputProfiles';
import {
  compileProfessionalPrompt,
  defaultProfessionalBrief,
  type ProfessionalPromptBrief,
} from './professionalPrompt';
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
    if (!raw) return defaultProfessionalBrief;
    return { ...defaultProfessionalBrief, ...(JSON.parse(raw) as Partial<ProfessionalPromptBrief>) };
  } catch {
    return defaultProfessionalBrief;
  }
}

const GATE_LABELS: Record<string, [string, string]> = {
  canonical: ['Canonical production specification', 'Especificación de producción canónica'],
  'camera-feasibility': ['Camera feasibility', 'Viabilidad de cámara'],
  temporal: ['Temporal coherence', 'Coherencia temporal'],
  continuity: ['Continuity lock', 'Bloqueo de continuidad'],
  references: ['Reference semantics', 'Semántica de referencias'],
  'i2v-input': ['I2V first-frame contract', 'Contrato de primer fotograma I2V'],
  'provider-length': ['Provider prompt budget', 'Presupuesto de prompt del proveedor'],
  physics: ['Physical plausibility', 'Plausibilidad física'],
  evidence: ['Evidence integrity', 'Integridad de evidencia'],
  purpose: ['Visual function', 'Función visual'],
  output: ['Output contract', 'Contrato de salida'],
  'must-have': ['Must-have clarity', 'Claridad de obligatorios'],
  'constraint-strategy': ['Constraint strategy', 'Estrategia de restricciones'],
  'action-economy': ['Action economy', 'Economía de acciones'],
  'camera-economy': ['Camera economy', 'Economía de cámara'],
  performance: ['Performance specificity', 'Especificidad de actuación'],
  'literal-text': ['Literal text safety', 'Seguridad de texto literal'],
  overprompting: ['Prompt economy', 'Economía del prompt'],
};

function localizedGateLabel(id: string, fallback: string, es: boolean) {
  const pair = GATE_LABELS[id];
  return pair ? (es ? pair[1] : pair[0]) : fallback;
}

function localizedWarning(warning: string, es: boolean) {
  if (!es) return warning;
  if (warning.startsWith('Resolve the live provider/model capability catalog')) return 'Resuelve el catálogo vivo de capacidades del proveedor/modelo antes de ejecutar; no asumas que todos los targets exponen hoy los mismos controles.';
  if (warning.startsWith('Prompt exceeds')) return 'El prompt supera el presupuesto recomendado del target y debe comprimirse antes de enviarse.';
  if (warning.startsWith('Prompt is likely over-detailed')) return 'El prompt probablemente está sobrecargado para este target; prioriza decisiones explícitas y elimina adjetivos repetidos.';
  if (warning.startsWith('Image-to-video requires')) return 'Image-to-video requiere un primer fotograma o imagen de referencia real. Vision no inventará ese input silenciosamente.';
  if (warning.startsWith('I2V should emphasize')) return 'En I2V el prompt debe describir movimiento y cambio. No rediseñes en texto lo que ya existe en el primer fotograma.';
  if (warning.startsWith('Literal text inside')) return 'El texto literal dentro de imágenes generadas depende del modelo. Usa una capa de texto separada cuando la redacción deba ser exacta.';
  if (warning.startsWith('More than two camera moves')) return 'Hay más de dos movimientos de cámara compitiendo en el mismo plano; ordénalos por tiempo o divide el plano.';
  if (warning.startsWith('Static camera conflicts')) return '“Cámara estática” entra en conflicto con otro movimiento simultáneo.';
  if (warning.startsWith('Rewrite these exclusions')) return warning.replace('Rewrite these exclusions as a desired state for this target:', 'Reescribe estas exclusiones como un estado deseado para este target:');
  if (warning.startsWith('Exact typography')) return 'La tipografía exacta es más segura como capa separada. Genera una imagen limpia + asset de texto salvo que el modelo vivo demuestre buena fidelidad tipográfica.';
  if (warning.startsWith('Too many actions')) return 'Hay demasiadas acciones compitiendo en un clip. Divide en planos o conserva una acción principal y una o dos secundarias.';
  if (warning.startsWith('Too many camera moves')) return 'Hay demasiados movimientos de cámara en un plano. Ordénalos por tiempo o divide el plano.';
  if (warning.startsWith('The must-have list')) return 'La lista de obligatorios se está convirtiendo en un segundo prompt. Mueve detalle estructural a sujeto/acción/escena o divide el asset.';
  return warning;
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
  useEffect(() => localStorage.setItem(BRIEF_KEY, JSON.stringify(brief)), [brief]);
  useEffect(() => {
    if (!desktop) return;
    void higgsfieldDesktopStatus().then(setDesktopStatus).catch((error) => setDesktopStatus({ installed: false, error: String(error) }));
  }, [desktop]);
  useEffect(() => { setPreflight(null); setConfirmSpend(false); }, [modelId, mode, duration, startImage, resolution, director.aspect, brief]);

  const normalizedRefs = useMemo(() => references.map((reference) => ({ ...reference, role: normalizeReferenceRole(reference.role) })), [references]);
  const firstFrameTagged = normalizedRefs.some((reference) => reference.role === 'first-frame');
  const compilation = useMemo(() => compileProfessionalPrompt({
    director,
    mode,
    target,
    intent,
    duration,
    references: normalizedRefs,
    startImageProvided: Boolean(startImage.trim()) || firstFrameTagged,
    literalText: brief.literalText,
    audioDirection: brief.audioIntent,
  }, brief), [director, mode, target, intent, duration, normalizedRefs, startImage, firstFrameTagged, brief]);
  const activeOutput = useMemo(() => getOutputProfile(brief.outputProfile), [brief.outputProfile]);
  const route = useMemo(() => recommendGenerationRoute({
    mode,
    intent,
    identityCritical: normalizedRefs.some((reference) => reference.role === 'identity'),
    multiShot: intent === 'cinematic' || intent === 'social-hook',
    videoEdit: mode === 'video-edit',
  }), [mode, intent, normalizedRefs]);

  const updateBrief = <K extends keyof ProfessionalPromptBrief>(key: K, value: ProfessionalPromptBrief[K]) => setBrief((current) => ({ ...current, [key]: value }));

  const chooseOutput = (id: PromptOutputProfileId) => {
    const profile = getOutputProfile(id);
    setBrief((current) => ({ ...current, outputProfile: id }));
    if (profile.defaultMode !== mode) setMode(profile.defaultMode);
  };

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
    if (route.primary === 'higgsfield-cinema') return 'Conviene resolver primero una imagen/shot cinematográfico con referencias y continuidad antes de ejecutar variantes.';
    if (route.primary === 'higgsfield-seedance') return 'Este trabajo se beneficia de beats temporales explícitos, referencias con rol y continuidad de corto formato.';
    if (route.primary === 'higgsfield-kling') return 'El trabajo requiere una ruta de video/edit compatible y validación del esquema vivo antes de enviar material.';
    if (route.primary === 'veo') return 'El audio forma parte de la intención; verifica en vivo que el modelo elegido soporte la configuración requerida.';
    if (route.primary === 'comfyui') return 'La ejecución local depende del workflow y de los nodos instalados; valida ambos antes de generar.';
    return 'Vision conserva la especificación canónica y valida las capacidades reales antes de ejecutar.';
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
      setProviderMessage(es
        ? `Preflight listo. ${result.plan?.applied?.length ?? 0} parámetros aceptados${omitted ? `; ${omitted} omitidos por el esquema vivo` : ''}.`
        : `Preflight ready. ${result.plan?.applied?.length ?? 0} parameters accepted${omitted ? `; ${omitted} omitted by the live schema` : ''}.`);
      return result;
    } catch (error) {
      setPreflight(null);
      setProviderMessage(error instanceof Error ? error.message : String(error));
      return null;
    } finally { setProviderBusy(false); }
  };

  const generate = async () => {
    if (!desktop || !modelId || !confirmSpend) return;
    if (mode === 'image-to-video' && !startImage.trim()) {
      setProviderMessage(es ? 'Para ejecutar I2V en Desktop escribe la ruta local del primer fotograma. Una referencia de identidad no sustituye el frame inicial.' : 'For Desktop I2V execution, provide the local first-frame path. An identity reference does not replace the starting frame.');
      return;
    }
    const checked = preflight ?? await validateSetup();
    if (!checked) return;
    setProviderBusy(true); setProviderMessage(es ? 'Generando mediante el CLI oficial de Higgsfield…' : 'Generating through the official Higgsfield CLI…'); setProviderResult(null);
    try {
      const result = await higgsfieldDesktopGenerate({
        modelId,
        prompt: compilation.providerPrompt,
        aspectRatio: director.aspect,
        duration: mode.includes('video') ? duration : undefined,
        startImage: startImage.trim() || undefined,
        resolution: resolution.trim() || undefined,
        confirmSpend,
      });
      setProviderResult(result);
      setPreflight(result.preflight ? { ok: true, modelId, plan: result.preflight } : checked);
      setProviderMessage(es ? 'Trabajo completado. Revisa la respuesta del proveedor y el preflight aplicado.' : 'Job completed. Review the provider response and applied preflight.');
      setConfirmSpend(false);
    } catch (error) { setProviderMessage(error instanceof Error ? error.message : String(error)); }
    finally { setProviderBusy(false); }
  };

  return <section className="skill-engine-panel">
    <div className="skill-engine-head">
      <div><span className="micro">VISUAL GENERATION SKILL ENGINE · PROFESSIONAL V0.6</span><h2>{es ? 'Primero define el resultado. Luego compila para el modelo.' : 'Define the result first. Then compile for the model.'}</h2><p>{es ? 'Vision separa intención, output, obligatorios, “No Prompt”, continuidad y parámetros. El target recibe sólo la gramática que le conviene; no una bolsa genérica de palabras.' : 'Vision separates intent, output, must-haves, No Prompt, continuity and parameters. The target receives the grammar it benefits from, not a generic bag of words.'}</p></div>
      <div className={`skill-score grade-${compilation.professionalQuality.grade.toLowerCase()}`}><strong>{compilation.professionalQuality.grade}</strong><span>{compilation.professionalQuality.score}/100</span></div>
    </div>

    <section className="professional-brief-card">
      <div className="professional-brief-head">
        <div><span className="micro">{es ? 'BRIEF PROFESIONAL' : 'PROFESSIONAL BRIEF'}</span><strong>{es ? 'Qué quieres recibir y qué no debe romperse.' : 'What you want back and what must not break.'}</strong></div>
        <div className="constraint-strategy-chip"><ShieldCheck size={13}/><span>{compilation.constraintPack.strategy}</span></div>
      </div>

      <div className="professional-brief-grid">
        <label className="professional-field output-field"><span>{es ? 'Tipo de output' : 'Output type'}</span><select value={brief.outputProfile} onChange={(event) => chooseOutput(event.target.value as PromptOutputProfileId)}>{outputProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.label[language]}</option>)}</select><small>{activeOutput.description[language]}</small></label>
        <label className="professional-field"><span><PackageCheck size={12}/>{es ? 'Debe incluir' : 'Must include'}</span><textarea value={brief.mustHave} onChange={(event) => updateBrief('mustHave', event.target.value)} placeholder={es ? 'Objetos, posiciones, gestos, evidencia, props, composición obligatoria…' : 'Required objects, positions, gestures, evidence, props, composition…'}/><small>{es ? 'Sólo decisiones obligatorias. Si la lista crece demasiado, Vision te pedirá dividir el plano/asset.' : 'Only mandatory decisions. If this becomes too long, Vision will flag the asset/shot for splitting.'}</small></label>
        <label className="professional-field no-prompt-field"><span><Ban size={12}/>{es ? 'No Prompt / No quiero' : 'No Prompt / Do not want'}</span><textarea value={brief.mustAvoid} onChange={(event) => updateBrief('mustAvoid', event.target.value)} placeholder={es ? 'Neón, piel plástica, texto falso, oficina de stock, cámara temblorosa…' : 'Neon, waxy skin, fake text, stock-office staging, shaky camera…'}/><small>{es ? 'No se pega ciegamente al prompt. Vision lo traduce a restricciones positivas cuando el modelo responde mejor así.' : 'This is not blindly appended. Vision translates it into positive constraints when the target responds better that way.'}</small></label>
      </div>

      <details className="professional-advanced">
        <summary>{es ? 'Dirección avanzada · actuación, texto, física, audio y entrega' : 'Advanced direction · performance, text, physics, audio and delivery'}</summary>
        <div className="professional-advanced-grid">
          <label className="professional-field"><span>{es ? 'Actuación / microcomportamiento' : 'Performance / micro-behavior'}</span><textarea value={brief.performance} onChange={(event) => updateBrief('performance', event.target.value)} placeholder={es ? 'Mandíbula tensa, mirada fija, respiración corta; la mano deja de moverse justo antes de decidir…' : 'Set jaw, fixed gaze, shallow breath; the hand stops moving just before the decision…'}/></label>
          <label className="professional-field"><span><Type size={12}/>{es ? 'Texto literal exacto' : 'Exact literal text'}</span><textarea value={brief.literalText} onChange={(event) => updateBrief('literalText', event.target.value)} placeholder={es ? 'Déjalo vacío si el texto se agregará luego como capa.' : 'Leave blank when typography will be added later as a layer.'}/></label>
          <label className="professional-field"><span>{es ? 'Física / comportamiento material' : 'Physics / material behavior'}</span><textarea value={brief.physicsNotes} onChange={(event) => updateBrief('physicsNotes', event.target.value)} placeholder={es ? 'Papel se flexiona con gravedad real; vapor asciende; tela conserva peso…' : 'Paper flexes with real gravity; steam rises; fabric keeps believable weight…'}/></label>
          <label className="professional-field"><span>{es ? 'Audio' : 'Audio intent'}</span><textarea value={brief.audioIntent} onChange={(event) => updateBrief('audioIntent', event.target.value)} placeholder={es ? 'Ambiente, diálogo, silencio, golpe sonoro, música secundaria…' : 'Ambience, dialogue, silence, impact cue, secondary music…'}/></label>
          <label className="professional-field professional-wide"><span>{es ? 'Entrega / uso posterior' : 'Delivery / downstream use'}</span><textarea value={brief.deliveryNotes} onChange={(event) => updateBrief('deliveryNotes', event.target.value)} placeholder={es ? 'Debe permitir texto arriba a la derecha; se animará en Dresser; necesito clean plate + sujeto…' : 'Keep top-right copy space; will animate in Dresser; need clean plate + subject…'}/></label>
        </div>
      </details>

      <div className="output-contract-strip">
        <div><span className="micro">{es ? 'ENTREGABLES' : 'DELIVERABLES'}</span><div>{activeOutput.deliverables.map((item) => <span key={item}>{item}</span>)}</div></div>
        <div><span className="micro">{es ? 'POLÍTICA DE TEXTO' : 'TEXT POLICY'}</span><strong>{activeOutput.textPolicy}</strong></div>
        <div><span className="micro">{es ? 'ALFA' : 'ALPHA'}</span><strong>{activeOutput.alpha ? (es ? 'REQUERIDA' : 'REQUIRED') : (es ? 'NO' : 'NO')}</strong></div>
      </div>
    </section>

    <div className="skill-engine-grid">
      <div className="skill-controls-card">
        <label><span>{es ? 'Destino' : 'Target'}</span><select value={target} onChange={(event) => { setTarget(event.target.value as GenerationTargetId); setModelId(''); setModelSchema(null); setPreflight(null); setProviderResult(null); setConfirmSpend(false); }}>{targetProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.label}</option>)}</select></label>
        <label><span>{es ? 'Modo' : 'Mode'}</span><select value={mode} onChange={(event) => setMode(event.target.value as GenerationMode)}>{MODES.map((value) => <option key={value} value={value}>{modeLabel(value)}</option>)}</select></label>
        <label><span>{es ? 'Intención' : 'Intent'}</span><select value={intent} onChange={(event) => setIntent(event.target.value as GenerationIntent)}>{generationIntents.map((value) => <option key={value} value={value}>{intentLabel(value)}</option>)}</select></label>
        <label><span>{es ? 'Duración' : 'Duration'}</span><div className="skill-duration"><Timer size={14}/><input type="number" min={2} max={60} value={duration} disabled={!mode.includes('video')} onChange={(event) => setDuration(Math.max(2, Math.min(60, Number(event.target.value) || 8)))}/><small>s</small></div></label>
        <div className="route-card"><Workflow size={16}/><div><span className="micro">{es ? 'RUTA SUGERIDA' : 'SUGGESTED ROUTE'}</span><strong>{targetProfiles.find((profile) => profile.id === route.primary)?.label ?? route.primary}</strong><p>{routeText()}</p></div></div>
        <div className="skill-badges"><span>MCSLA</span><span>I2V Δ</span><span>OUTPUT CONTRACT</span><span>NO-PROMPT → CONSTRAINTS</span><span>CONTINUITY</span><span>LIVE SCHEMA</span></div>
      </div>

      <article className="skill-output-card professional-output-card"><div className="skill-output-head"><div><span className="micro">{es ? 'PROMPT PROFESIONAL DEL DESTINO' : 'PROFESSIONAL TARGET PROMPT'}</span><strong>{compilation.target.label} · {activeOutput.label[language]}</strong></div><button className="icon-button" type="button" onClick={() => onCopy(compilation.providerPrompt)} aria-label="Copy target prompt"><Copy size={15}/></button></div><pre>{compilation.providerPrompt}</pre><details className="output-package-details"><summary>{es ? 'Ver paquete de salida y restricciones' : 'View output package & constraints'}</summary><pre>{JSON.stringify({ parameters: compilation.parameterPack, constraints: compilation.constraintPack, output: compilation.outputProfile }, null, 2)}</pre></details></article>
    </div>

    <div className="quality-gates professional-gates">
      {compilation.quality.gates.map((gate) => <div className={gate.passed ? 'quality-gate pass' : 'quality-gate fail'} key={`core-${gate.id}`}><ShieldCheck size={14}/><div><strong>{localizedGateLabel(gate.id, gate.label, es)}</strong><span>{gate.detail}</span></div></div>)}
      {compilation.professionalQuality.gates.map((gate) => <div className={gate.passed ? 'quality-gate pass pro' : 'quality-gate fail pro'} key={`pro-${gate.id}`}><PackageCheck size={14}/><div><strong>{localizedGateLabel(gate.id, gate.label, es)}</strong><span>{gate.detail}</span></div></div>)}
    </div>
    {[...compilation.quality.warnings, ...compilation.professionalQuality.warnings].length > 0 && <div className="skill-warning-list">{[...compilation.quality.warnings, ...compilation.professionalQuality.warnings].map((warning, index) => <p key={`${warning}-${index}`}><Sparkles size={13}/>{localizedWarning(warning, es)}</p>)}</div>}

    {HIGGSFIELD_TARGETS.includes(target) && <section className="live-provider-card">
      <div className="live-provider-head"><div><span className="micro">HIGGSFIELD · OFFICIAL CLI BRIDGE</span><strong>{desktop ? (desktopStatus?.installed ? (es ? 'Desktop conectado' : 'Desktop connected') : (es ? 'CLI por verificar' : 'CLI check required')) : (es ? 'Ejecución disponible en Desktop' : 'Execution available in Desktop')}</strong><p>{desktop ? (desktopStatus?.installed ? `${desktopStatus.version || 'Higgsfield CLI'} · ${desktopStatus.binary || ''}` : desktopStatus?.error || (es ? 'Presiona actualizar para detectar el CLI.' : 'Refresh to detect the CLI.')) : (es ? 'La PWA compila prompts; para ejecutar el proveedor usa la app macOS, donde las credenciales permanecen fuera del proyecto.' : 'The PWA compiles prompts; use the macOS app for provider execution so credentials stay outside the project.')}</p></div><button className="subtle-button" type="button" disabled={!desktop || providerBusy} onClick={() => void refreshModels()}><RefreshCw size={14}/>{es ? 'Descubrir modelos' : 'Discover models'}</button></div>

      {desktop && <div className="live-provider-grid"><label><span>{es ? 'Modelo en vivo' : 'Live model'}</span><div className="live-model-row"><select value={modelId} onChange={(event) => void inspectModel(event.target.value)}><option value="">{es ? 'Selecciona del catálogo…' : 'Select from live catalog…'}</option>{liveModels.map((model) => <option value={model.id} key={model.id}>{model.name} · {model.id}</option>)}</select><input value={modelId} onChange={(event) => void inspectModel(event.target.value)} placeholder="job_set_type / model id"/></div></label><label><span>{es ? 'Resolución (opcional)' : 'Resolution (optional)'}</span><input value={resolution} onChange={(event) => setResolution(event.target.value)} placeholder="1080p / 2k / provider default"/></label>{mode === 'image-to-video' && <label className="live-provider-wide"><span>{es ? 'Ruta local del primer fotograma' : 'Local first-frame path'}</span><input value={startImage} onChange={(event) => setStartImage(event.target.value)} placeholder="/Users/.../frame.png"/></label>}<div className="live-provider-wide provider-safety"><label><input type="checkbox" checked={confirmSpend} onChange={(event) => setConfirmSpend(event.target.checked)}/><span>{es ? 'Confirmo esta generación y acepto que puede consumir créditos del proveedor.' : 'I confirm this generation and understand it may consume provider credits.'}</span></label><div className="provider-action-row"><button className="subtle-button" type="button" disabled={providerBusy || !desktopStatus?.installed || !modelId} onClick={() => void validateSetup()}><CheckCircle2 size={14}/>{es ? 'Validar setup' : 'Validate setup'}</button><button className="primary-button" type="button" disabled={providerBusy || !desktopStatus?.installed || !modelId || !confirmSpend || compilation.professionalQuality.grade === 'D'} onClick={() => void generate()}><Play size={14}/>{providerBusy ? (es ? 'Procesando…' : 'Processing…') : (es ? 'Generar en Higgsfield' : 'Generate in Higgsfield')}</button></div></div></div>}

      {desktop && !desktopStatus?.installed && <div className="provider-install-note"><code>brew install higgsfield-ai/tap/higgsfield</code><code>higgsfield auth login</code></div>}
      {providerMessage && <p className="provider-message">{providerMessage}</p>}
      {preflight?.plan && <details className="provider-schema" open><summary>{es ? 'Preflight · parámetros que Vision enviará' : 'Preflight · parameters Vision will submit'}</summary><pre>{JSON.stringify(preflight.plan, null, 2)}</pre></details>}
      {modelSchema != null && <details className="provider-schema"><summary>{es ? 'Ver esquema vivo del modelo' : 'View live model schema'}</summary><pre>{JSON.stringify(modelSchema, null, 2)}</pre></details>}
      {providerResult != null && <details className="provider-schema" open><summary>{es ? 'Resultado del trabajo' : 'Job result'}</summary><pre>{JSON.stringify(providerResult, null, 2)}</pre></details>}
    </section>}

    <div className="skill-foot"><span><ImageIcon size={13}/>{normalizedRefs.length} {es ? 'referencias con rol' : 'role-tagged references'}</span><span><Film size={13}/>{compilation.timeline.length} {es ? 'beats temporales' : 'temporal beats'}</span><span>{compilation.provenance.slice(0, 8).join(' · ')}</span></div>
  </section>;
}
