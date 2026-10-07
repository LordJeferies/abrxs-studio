import { CheckCircle2, KeyRound, Plus, RefreshCcw, ShieldAlert, Trash2, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  capabilityLabel,
  clearSessionProviderKey,
  createCustomProvider,
  getSessionProviderKey,
  loadCustomProviders,
  saveCustomProviders,
  setSessionProviderKey,
  testCustomProvider,
  type CustomProvider,
  type CustomProviderCapability,
  type CustomProviderProtocol,
} from './customProviders';

const CAPABILITIES: CustomProviderCapability[] = ['assistant','multimodal-analysis','image-generation','video-generation'];

const EMPTY = {
  name: '', protocol: 'openai-compatible' as CustomProviderProtocol, baseUrl: '', model: '', capabilities: ['assistant'] as CustomProviderCapability[], modelsPath: '/v1/models', chatPath: '/v1/chat/completions', generatePath: '',
};

export function CustomProviderSettings({ language }: { language: 'es' | 'en' }) {
  const es = language === 'es';
  const [providers, setProviders] = useState<CustomProvider[]>(loadCustomProviders);
  const [draft, setDraft] = useState(EMPTY);
  const [keys, setKeys] = useState<Record<string,string>>(() => Object.fromEntries(loadCustomProviders().map((item) => [item.id, getSessionProviderKey(item.id)])));
  const [status, setStatus] = useState<Record<string,{ kind: 'idle' | 'testing' | 'ok' | 'error'; text?: string }>>({});
  const hasProviders = providers.length > 0;
  const protocolHelp = useMemo(() => draft.protocol === 'openai-compatible'
    ? (es ? 'Compatible con /v1/models y /v1/chat/completions. Útil para routers y servidores que imitan OpenAI.' : 'Compatible with /v1/models and /v1/chat/completions. Useful for routers and servers that mimic OpenAI.')
    : draft.protocol === 'anthropic-compatible'
      ? (es ? 'Compatible con /v1/messages y headers x-api-key / anthropic-version.' : 'Compatible with /v1/messages and x-api-key / anthropic-version headers.')
      : (es ? 'Permite registrar endpoints de imagen/video u otros REST. La ejecución sólo se habilita cuando existe un adapter explícito.' : 'Registers image/video or other REST endpoints. Execution is enabled only when an explicit adapter exists.'), [draft.protocol, es]);

  const persist = (next: CustomProvider[]) => { setProviders(next); saveCustomProviders(next); };
  const add = () => {
    if (!draft.name.trim() || !draft.baseUrl.trim() || !draft.model.trim()) return;
    const provider = createCustomProvider(draft);
    const next = [...providers.filter((item) => item.id !== provider.id), provider];
    persist(next);
    setDraft(EMPTY);
  };
  const remove = (provider: CustomProvider) => {
    clearSessionProviderKey(provider.id);
    persist(providers.filter((item) => item.id !== provider.id));
    setKeys((current) => { const next = { ...current }; delete next[provider.id]; return next; });
  };
  const saveKey = (provider: CustomProvider, value: string) => {
    setSessionProviderKey(provider.id, value);
    setKeys((current) => ({ ...current, [provider.id]: value }));
  };
  const test = async (provider: CustomProvider) => {
    setStatus((current) => ({ ...current, [provider.id]: { kind: 'testing', text: es ? 'Probando…' : 'Testing…' } }));
    try {
      const result = await testCustomProvider(provider);
      setStatus((current) => ({ ...current, [provider.id]: { kind: 'ok', text: result.mode === 'live' ? (es ? 'Conexión verificada.' : 'Connection verified.') : (es ? 'Configuración válida; no hay endpoint de discovery.' : 'Configuration valid; no discovery endpoint configured.') } }));
    } catch (reason) {
      setStatus((current) => ({ ...current, [provider.id]: { kind: 'error', text: reason instanceof Error ? reason.message : String(reason) } }));
    }
  };

  return <section className="custom-provider-settings">
    <header><div><span className="micro">CUSTOM PROVIDERS · BYOK</span><h2>{es ? 'Conecta routers, LLMs y generadores externos.' : 'Connect routers, LLMs and external generators.'}</h2><p>{es ? 'Registra endpoints OpenAI-compatible, Anthropic-compatible o REST. La metadata se guarda localmente; por seguridad, las API keys personalizadas son de sesión y se borran al cerrar la sesión del navegador. Para una PWA pública permanente usa Vision Cloud Gateway.' : 'Register OpenAI-compatible, Anthropic-compatible or REST endpoints. Metadata is stored locally; for safety, custom API keys are session-only and disappear when the browser session closes. For persistent public-PWA credentials use Vision Cloud Gateway.'}</p></div><div className="custom-security-note"><ShieldAlert size={18}/><span>{es ? 'Nunca incrustes master keys en GitHub Pages.' : 'Never embed master keys in GitHub Pages.'}</span></div></header>

    <div className="custom-provider-builder">
      <div className="builder-title"><span className="micro">+ ADD PROVIDER</span><strong>{es ? 'Nuevo provider' : 'New provider'}</strong></div>
      <div className="builder-grid">
        <label><span>{es ? 'Nombre' : 'Name'}</span><input value={draft.name} onChange={(e) => setDraft((current) => ({ ...current, name: e.target.value }))} placeholder="Gonka Router"/></label>
        <label><span>Protocol</span><select value={draft.protocol} onChange={(e) => { const protocol = e.target.value as CustomProviderProtocol; setDraft((current) => ({ ...current, protocol, modelsPath: protocol === 'openai-compatible' ? '/v1/models' : '', chatPath: protocol === 'openai-compatible' ? '/v1/chat/completions' : protocol === 'anthropic-compatible' ? '/v1/messages' : '' })); }}><option value="openai-compatible">OpenAI Compatible</option><option value="anthropic-compatible">Anthropic Compatible</option><option value="generic-rest">Generic REST</option></select></label>
        <label className="wide"><span>Base URL</span><input value={draft.baseUrl} onChange={(e) => setDraft((current) => ({ ...current, baseUrl: e.target.value }))} placeholder="https://provider.example.com"/></label>
        <label><span>Model</span><input value={draft.model} onChange={(e) => setDraft((current) => ({ ...current, model: e.target.value }))} placeholder="model-id"/></label>
        <label><span>Models path</span><input value={draft.modelsPath} onChange={(e) => setDraft((current) => ({ ...current, modelsPath: e.target.value }))} placeholder="/v1/models"/></label>
        <label><span>Chat path</span><input value={draft.chatPath} onChange={(e) => setDraft((current) => ({ ...current, chatPath: e.target.value }))} placeholder="/v1/chat/completions"/></label>
        <label><span>Generate path</span><input value={draft.generatePath} onChange={(e) => setDraft((current) => ({ ...current, generatePath: e.target.value }))} placeholder="optional"/></label>
      </div>
      <p className="protocol-help">{protocolHelp}</p>
      <div className="custom-capabilities">{CAPABILITIES.map((capability) => <label key={capability}><input type="checkbox" checked={draft.capabilities.includes(capability)} onChange={(e) => setDraft((current) => ({ ...current, capabilities: e.target.checked ? [...current.capabilities, capability] : current.capabilities.filter((item) => item !== capability) }))}/><span>{capabilityLabel(capability)}</span></label>)}</div>
      <button className="custom-add" type="button" disabled={!draft.name.trim() || !draft.baseUrl.trim() || !draft.model.trim()} onClick={add}><Plus size={15}/>{es ? 'Añadir provider' : 'Add provider'}</button>
    </div>

    <div className="custom-provider-list">{!hasProviders ? <div className="custom-empty">{es ? 'No hay providers personalizados todavía.' : 'No custom providers yet.'}</div> : providers.map((provider) => {
      const itemStatus = status[provider.id] || { kind: 'idle' as const };
      return <article key={provider.id}>
        <div className="provider-top"><div><span className="micro">{provider.protocol}</span><h3>{provider.name}</h3><p>{provider.baseUrl} · {provider.model}</p></div><button className="remove" type="button" onClick={() => remove(provider)}><Trash2 size={14}/></button></div>
        <div className="provider-caps">{provider.capabilities.map((capability) => <span key={capability}>{capabilityLabel(capability)}</span>)}</div>
        <label className="custom-key"><span>{es ? 'API key de sesión' : 'Session API key'}</span><div><input type="password" autoComplete="off" value={keys[provider.id] || ''} onChange={(e) => saveKey(provider, e.target.value)} placeholder="••••••••••••"/><KeyRound size={14}/></div></label>
        <div className="provider-actions"><button type="button" disabled={itemStatus.kind === 'testing'} onClick={() => void test(provider)}><RefreshCcw size={13}/>{es ? 'Probar conexión' : 'Test connection'}</button>{itemStatus.kind === 'ok' ? <span className="ok"><CheckCircle2 size={13}/>{itemStatus.text}</span> : itemStatus.kind === 'error' ? <span className="error"><XCircle size={13}/>{itemStatus.text}</span> : itemStatus.kind === 'testing' ? <span>{itemStatus.text}</span> : null}</div>
        {provider.protocol === 'generic-rest' && <small className="provider-warning">{es ? 'Registrado para routing/capabilities. El botón de generación permanece deshabilitado hasta que haya un adapter de request/response validado para ese endpoint.' : 'Registered for routing/capabilities. Generate remains disabled until a request/response adapter for this endpoint is validated.'}</small>}
      </article>;
    })}</div>
  </section>;
}
