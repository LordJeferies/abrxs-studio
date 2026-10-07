import { CheckCircle2, Cpu, KeyRound, Link2, ShieldCheck, Trash2, Unplug } from 'lucide-react';
import { useEffect, useState } from 'react';
import { deleteSecret, geminiCliStatus, isVisionDesktop, loadAssistantPreferences, saveAssistantPreferences, secretStatus, setSecret, type AssistantPreferences } from './assistantBridge';

export function VisionAISettings({ language }: { language: 'es' | 'en' }) {
  const es = language === 'es';
  const [prefs, setPrefs] = useState<AssistantPreferences>(loadAssistantPreferences);
  const [nvidiaKey, setNvidiaKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [nvidiaConfigured, setNvidiaConfigured] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [geminiCli, setGeminiCli] = useState<{ installed: boolean; version?: string; binary?: string; error?: string }>({ installed: false });
  const [message, setMessage] = useState('');
  const desktop = isVisionDesktop();

  const refresh = async () => {
    const [nvidia, gemini, cli] = await Promise.all([
      secretStatus('nvidia'),
      secretStatus('gemini-api'),
      geminiCliStatus(),
    ]);
    setNvidiaConfigured(Boolean(nvidia.configured));
    setGeminiConfigured(Boolean(gemini.configured));
    setGeminiCli(cli);
  };

  useEffect(() => { void refresh(); }, []);
  useEffect(() => { saveAssistantPreferences(prefs); }, [prefs]);

  const saveKey = async (provider: 'nvidia' | 'gemini-api', value: string) => {
    try {
      await setSecret(provider, value);
      if (provider === 'nvidia') setNvidiaKey(''); else setGeminiKey('');
      setMessage(es ? 'Credencial guardada en el llavero del sistema.' : 'Credential saved in the system keychain.');
      await refresh();
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : String(reason)); }
  };
  const removeKey = async (provider: 'nvidia' | 'gemini-api') => {
    try { await deleteSecret(provider); setMessage(es ? 'Credencial eliminada.' : 'Credential removed.'); await refresh(); } catch (reason) { setMessage(reason instanceof Error ? reason.message : String(reason)); }
  };

  return <section className="vision-ai-settings-v2">
    <header className="ai-settings-head"><div><span className="micro">AI / PROVIDER SETTINGS</span><h1>{es ? 'Conexiones, modelos y credenciales.' : 'Connections, models and credentials.'}</h1><p>{es ? 'El asistente y el creador comparten un registro de providers, pero no son la misma cosa: el asistente razona y propone; el creador ejecuta generación sólo cuando el modelo y la capacidad están validados.' : 'The assistant and creator share a provider registry, but they are not the same thing: the assistant reasons and proposes; the creator executes generation only after model and capability validation.'}</p></div><div className={`desktop-state ${desktop ? 'ready' : ''}`}>{desktop ? <ShieldCheck size={17}/> : <Unplug size={17}/>}<div><strong>{desktop ? (es ? 'Desktop seguro' : 'Secure desktop') : 'PWA / Browser'}</strong><span>{desktop ? (es ? 'Keys en Keychain; nunca en el proyecto.' : 'Keys in Keychain; never in project data.') : (es ? 'No se guardan keys persistentes en esta build web.' : 'Persistent API keys are not stored in this web build.')}</span></div></div></header>

    <div className="ai-settings-grid">
      <article className="provider-settings-card featured"><div className="provider-card-title"><span className="provider-mark">N</span><div><span className="micro">ASSISTANT + SEMANTIC AI</span><h2>NVIDIA NIM</h2></div><em className={nvidiaConfigured ? 'connected' : ''}>{nvidiaConfigured ? (es ? 'Configurado' : 'Configured') : (es ? 'Sin key' : 'No key')}</em></div><p>{es ? 'Se usa para el chat/coproductor, crítica de prompts, propuestas de referencias y análisis semántico. La generación visual sigue separada por modelo/capacidad.' : 'Used for chat/copilot, prompt critique, reference suggestions and semantic analysis. Visual generation remains separated by model/capability.'}</p><label><span>{es ? 'API key NVIDIA' : 'NVIDIA API key'}</span><div className="secret-row"><input type="password" autoComplete="off" value={nvidiaKey} onChange={(event) => setNvidiaKey(event.target.value)} placeholder={nvidiaConfigured ? '••••••••••••••••' : 'nvapi-…'}/><button type="button" disabled={!desktop || !nvidiaKey.trim()} onClick={() => void saveKey('nvidia', nvidiaKey)}><KeyRound size={14}/>{nvidiaConfigured ? (es ? 'Reemplazar' : 'Replace') : (es ? 'Guardar' : 'Save')}</button>{nvidiaConfigured && <button className="danger" type="button" onClick={() => void removeKey('nvidia')}><Trash2 size={14}/></button>}</div></label><label><span>{es ? 'Modelo para el asistente' : 'Assistant model'}</span><input value={prefs.nvidiaModel} onChange={(event) => setPrefs((current) => ({ ...current, nvidiaModel: event.target.value }))} placeholder="meta/muse-glimmer-30b"/></label><label><span>Endpoint</span><input value={prefs.nvidiaEndpoint} onChange={(event) => setPrefs((current) => ({ ...current, nvidiaEndpoint: event.target.value }))}/></label><small>{es ? 'No se asume que un modelo sea gratis, multimodal o generador por siempre. Vision valida capacidades por separado antes de habilitar acciones.' : 'Vision never assumes a model remains free, multimodal or generative forever. Capabilities are validated separately before actions are enabled.'}</small></article>

      <article className="provider-settings-card"><div className="provider-card-title"><span className="provider-mark">G</span><div><span className="micro">ASSISTANT ENGINE</span><h2>Gemini CLI</h2></div><em className={geminiCli.installed ? 'connected' : ''}>{geminiCli.installed ? (es ? 'Detectado' : 'Detected') : (es ? 'No detectado' : 'Not detected')}</em></div><p>{es ? 'Opción local para el mejorador/chat usando la autenticación del CLI. Vision lo llama en modo headless con salida JSON y sin convertirlo en el dueño del proyecto.' : 'Local option for the improver/chat using CLI authentication. Vision invokes it headlessly with JSON output without making it the owner of project state.'}</p><label><span>{es ? 'Modelo opcional' : 'Optional model'}</span><input value={prefs.geminiModel} onChange={(event) => setPrefs((current) => ({ ...current, geminiModel: event.target.value }))} placeholder={es ? 'vacío = modelo del CLI' : 'blank = CLI default'}/></label>{geminiCli.binary && <small>{geminiCli.binary}{geminiCli.version ? ` · ${geminiCli.version}` : ''}</small>}{geminiCli.error && <small>{geminiCli.error}</small>}</article>

      <article className="provider-settings-card"><div className="provider-card-title"><span className="provider-mark">G</span><div><span className="micro">FUTURE DIRECT API</span><h2>Gemini API</h2></div><em className={geminiConfigured ? 'connected' : ''}>{geminiConfigured ? (es ? 'Key guardada' : 'Key stored') : (es ? 'Preparado' : 'Prepared')}</em></div><p>{es ? 'Slot de credencial separado del Gemini CLI. El adaptador directo se mantiene independiente para poder elegir modelo/capacidad sin mezclar autenticaciones.' : 'Separate credential slot from Gemini CLI. The direct adapter remains independent so model/capability selection never mixes authentication paths.'}</p><label><span>Gemini API key</span><div className="secret-row"><input type="password" autoComplete="off" value={geminiKey} onChange={(event) => setGeminiKey(event.target.value)} placeholder={geminiConfigured ? '••••••••••••••••' : 'AIza…'}/><button type="button" disabled={!desktop || !geminiKey.trim()} onClick={() => void saveKey('gemini-api', geminiKey)}><KeyRound size={14}/>{geminiConfigured ? (es ? 'Reemplazar' : 'Replace') : (es ? 'Guardar' : 'Save')}</button>{geminiConfigured && <button className="danger" type="button" onClick={() => void removeKey('gemini-api')}><Trash2 size={14}/></button>}</div></label><small>{es ? 'La key puede guardarse ya, pero la ejecución directa no se anuncia como activa hasta tener adapter + pruebas.' : 'The key can be stored now, but direct execution is not advertised as active until the adapter and tests exist.'}</small></article>

      <article className="provider-settings-card"><div className="provider-card-title"><span className="provider-mark">C</span><div><span className="micro">LOCAL GENERATION</span><h2>ComfyUI</h2></div><em>{es ? 'Local' : 'Local'}</em></div><p>{es ? 'ComfyUI pertenece al módulo de creación: Vision compila intención y parámetros; el connector descubre workflow, nodos y modelos antes de enviar un job.' : 'ComfyUI belongs to the creation module: Vision compiles intent and parameters; the connector discovers workflow, nodes and models before submitting a job.'}</p><label><span>{es ? 'Endpoint local' : 'Local endpoint'}</span><div className="secret-row"><input value={prefs.comfyEndpoint} onChange={(event) => setPrefs((current) => ({ ...current, comfyEndpoint: event.target.value }))}/><span className="endpoint-icon"><Link2 size={15}/></span></div></label><small>{es ? 'Siguiente adapter: importar workflow API JSON, mapear inputs semánticos, validar node inventory, ejecutar y recuperar outputs/historial.' : 'Next adapter: import API workflow JSON, map semantic inputs, validate node inventory, execute and retrieve outputs/history.'}</small></article>
    </div>

    <section className="provider-boundary"><Cpu size={18}/><div><strong>{es ? 'Separación correcta de responsabilidades' : 'Correct separation of responsibilities'}</strong><p>{es ? 'Copilot / Mejorador = conversar, analizar, criticar y proponer patches. Creator / Generate = seleccionar provider/model/workflow, hacer preflight, mostrar requisitos/coste si existe y ejecutar sólo con acción explícita. Así el botón Generar aparece cuando realmente hay una ruta ejecutable.' : 'Copilot / Improver = converse, analyze, critique and propose patches. Creator / Generate = select provider/model/workflow, run preflight, show requirements/cost when available and execute only on explicit action. This is when the Generate button should become enabled.'}</p></div></section>
    {message && <div className="settings-toast"><CheckCircle2 size={15}/>{message}</div>}
  </section>;
}
