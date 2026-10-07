import { Bot, Check, Copy, Cpu, ExternalLink, Send, Settings2, Sparkles, WandSparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { buildVisionAssistantSystemPrompt, parseAssistantEnvelope, sceneRecipes, type AssistantProviderId, type VisionAssistantAction, type VisionAssistantEnvelope } from './assistantCore';
import { applyAssistantAction, currentAssistantContext, loadAssistantPreferences, runVisionAssistant, type AssistantMessage } from './assistantBridge';
import { loadCustomProviders, runCustomAssistant, type CustomProvider } from './customProviders';
import { optionById } from './directorFinal';

type Props = {
  language: 'es' | 'en';
  onOpenSettings: () => void;
  onOpenPromptStudio: () => void;
  onOpenXRoll: () => void;
};

type ChatRow = AssistantMessage & { envelope?: VisionAssistantEnvelope };
type CopilotProvider = `builtin:${AssistantProviderId}` | `custom:${string}`;

function contextBlock() {
  const { director, brief, v25 } = currentAssistantContext();
  return JSON.stringify({
    v25Director: {
      sourceText: v25.sourceText,
      selectedText: v25.selectedText || undefined,
      selections: v25.selections,
    },
    legacyDirector: {
      idea: director.idea,
      subject: director.subject,
      environment: director.environment,
      action: director.action,
      camera: director.camera,
      lens: director.lens,
      focal: director.focal,
      aperture: director.aperture,
      framing: director.framing,
      angle: director.angle,
      movement: director.movement,
      lighting: director.lighting,
      palette: director.palette,
      atmosphere: director.atmosphere,
      style: director.style,
      aspect: director.aspect,
      brandPreset: director.brandPreset,
      visualFunction: director.visualFunction,
      continuity: director.continuity,
      evidenceConstraints: director.evidenceConstraints,
    },
    professionalBrief: brief,
  }, null, 2);
}

function actionTitle(action: VisionAssistantAction) {
  if (action.type === 'set-v25-option') {
    const option = optionById(action.optionId);
    return `Director V2.5 · ${String(action.category)} → ${option?.label || action.optionId}`;
  }
  if (action.type === 'replace-v25-source') return 'Director V2.5 · Source truth';
  if (action.type === 'set-director') return `Legacy Director · ${String(action.field)}`;
  return `Prompt brief · ${String(action.field)}`;
}

function actionValue(action: VisionAssistantAction) {
  if (action.type === 'set-v25-option') return optionById(action.optionId)?.prompt || action.optionId;
  if (action.type === 'replace-v25-source') return action.value;
  return String(action.value);
}

export function VisionCopilot({ language, onOpenSettings, onOpenPromptStudio, onOpenXRoll }: Props) {
  const es = language === 'es';
  const customProviders = useMemo(() => loadCustomProviders().filter((provider) => provider.capabilities.includes('assistant')), []);
  const [provider, setProvider] = useState<CopilotProvider>('builtin:nvidia');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState<Record<string, boolean>>({});
  const [rows, setRows] = useState<ChatRow[]>([
    { role: 'assistant', content: es ? 'Puedo leer el texto base y la dirección V2.5 actual, criticar el prompt, proponer cámara/luz/movimiento y preparar cambios que tú apruebas uno por uno.' : 'I can read the current V2.5 base text and direction, critique the prompt, propose camera/light/motion changes and prepare changes that you approve one by one.' },
  ]);
  const preferences = useMemo(loadAssistantPreferences, []);

  const resolveCustom = (value: CopilotProvider): CustomProvider | undefined => {
    if (!value.startsWith('custom:')) return undefined;
    const id = value.slice('custom:'.length);
    return customProviders.find((item) => item.id === id);
  };

  const send = async (preset?: string) => {
    const question = (preset ?? input).trim();
    if (!question || busy) return;
    setBusy(true); setError(''); setInput('');
    const userRow: ChatRow = { role: 'user', content: question };
    const conversation: AssistantMessage[] = [...rows.filter((row) => row.role === 'user' || row.role === 'assistant').map(({ role, content }) => ({ role, content })), userRow].slice(-10);
    try {
      const enriched = `${question}\n\nCURRENT VISION PROJECT CONTEXT:\n${contextBlock()}`;
      conversation[conversation.length - 1] = { role: 'user', content: enriched };
      const systemPrompt = buildVisionAssistantSystemPrompt(language);
      let envelope: VisionAssistantEnvelope;
      const custom = resolveCustom(provider);
      if (custom) {
        const raw = await runCustomAssistant(custom, { systemPrompt, messages: conversation });
        envelope = parseAssistantEnvelope(raw);
      } else {
        const builtin = provider.replace('builtin:', '') as AssistantProviderId;
        envelope = await runVisionAssistant({ provider: builtin, systemPrompt, messages: conversation, preferences });
      }
      setRows((current) => [...current, userRow, { role: 'assistant', content: envelope.message, envelope }]);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : String(reason);
      setRows((current) => [...current, userRow]);
      setError(message);
    } finally { setBusy(false); }
  };

  const apply = (action: VisionAssistantAction, key: string) => {
    applyAssistantAction(action);
    setApplied((current) => ({ ...current, [key]: true }));
  };

  return <section className="vision-copilot-v2">
    <header className="copilot-head">
      <div><span className="micro">VISION COPILOT · DIRECTOR AI</span><h1>{es ? 'Habla con el Director.' : 'Talk to the Director.'}</h1><p>{es ? 'El asistente ve Source Truth, selección de texto y decisiones V2.5. Propone cambios estructurados; sólo se aplican cuando tú pulsas Aplicar.' : 'The assistant sees Source Truth, selected text and V2.5 decisions. It proposes structured changes; they apply only when you press Apply.'}</p></div>
      <div className="copilot-head-actions"><label><span>Engine</span><select value={provider} onChange={(event) => setProvider(event.target.value as CopilotProvider)}><option value="builtin:nvidia">NVIDIA NIM</option><option value="builtin:gemini-cli">Gemini {typeof window !== 'undefined' && '__TAURI__' in window ? 'CLI' : 'Cloud'}</option>{customProviders.map((item) => <option key={item.id} value={`custom:${item.id}`}>{item.name} · {item.model}</option>)}</select></label><button className="subtle-button" type="button" onClick={onOpenSettings}><Settings2 size={15}/>{es ? 'Conexiones' : 'Connections'}</button></div>
    </header>

    <div className="copilot-grid">
      <main className="copilot-chat">
        <div className="copilot-thread">
          {rows.map((row, index) => <article className={`copilot-message ${row.role}`} key={index}>
            <div className="copilot-avatar">{row.role === 'assistant' ? <Bot size={16}/> : <span>YOU</span>}</div>
            <div className="copilot-bubble"><p>{row.content}</p>{row.envelope?.references?.length ? <div className="copilot-reference-list">{row.envelope.references.map((reference) => <div key={`${reference.title}-${reference.why}`}><strong>{reference.title}</strong><span>{reference.why}</span>{reference.camera && <small>Camera: {reference.camera}</small>}{reference.light && <small>Light: {reference.light}</small>}{reference.composition && <small>Composition: {reference.composition}</small>}{reference.motion && <small>Motion: {reference.motion}</small>}</div>)}</div> : null}{row.envelope?.actions?.length ? <div className="copilot-actions"><span className="micro">{es ? 'CAMBIOS PROPUESTOS' : 'PROPOSED CHANGES'}</span>{row.envelope.actions.map((action, actionIndex) => { const actionKey = `${index}-${actionIndex}`; return <div className="copilot-action" key={actionKey}><div><strong>{actionTitle(action)}</strong><p>{actionValue(action)}</p>{action.reason && <small>{action.reason}</small>}</div><button type="button" disabled={applied[actionKey]} onClick={() => apply(action, actionKey)}><Check size={14}/>{applied[actionKey] ? (es ? 'Aplicado' : 'Applied') : (es ? 'Aplicar' : 'Apply')}</button></div>; })}</div> : null}</div>
          </article>)}
          {busy && <article className="copilot-message assistant"><div className="copilot-avatar"><Cpu size={16}/></div><div className="copilot-bubble thinking"><span/><span/><span/></div></article>}
        </div>
        {error && <div className="copilot-error"><strong>{es ? 'No se pudo usar el engine.' : 'Could not use the engine.'}</strong><span>{error}</span><button type="button" onClick={onOpenSettings}>{es ? 'Abrir conexiones' : 'Open connections'}</button></div>}
        <div className="copilot-composer"><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder={es ? 'Ej: mantén mi texto, pero dame 3 decisiones de iluminación más cinematográficas; cambia sólo la focal; haz la duda observable…' : 'Example: keep my text, but give me 3 more cinematic lighting choices; change only the lens; make indecision observable…'}/><button type="button" disabled={busy || !input.trim()} onClick={() => void send()}><Send size={17}/></button></div>
      </main>

      <aside className="copilot-side">
        <section><span className="micro">QUICK TASKS</span><button type="button" onClick={() => void send(es ? 'Audita Source Truth y la dirección V2.5 actual. Dime los 3 problemas que más reducen calidad y propón set-v25-option concretos sin alterar la tesis.' : 'Audit Source Truth and the current V2.5 direction. Tell me the 3 issues that most reduce quality and propose concrete set-v25-option changes without altering the thesis.')}><WandSparkles size={16}/><div><strong>{es ? 'Auditar y mejorar' : 'Audit & improve'}</strong><span>{es ? 'Diagnóstico + patches V2.5' : 'Diagnosis + V2.5 patches'}</span></div></button><button type="button" onClick={() => void send(es ? 'Dame tres referencias internas realmente diferentes para esta idea. Varía lente, composición, luz y movimiento; explica el efecto de cada una.' : 'Give me three genuinely different internal references for this idea. Vary lens, composition, light and movement; explain the effect of each.')}><Sparkles size={16}/><div><strong>{es ? 'Dame referencias' : 'Suggest references'}</strong><span>{es ? 'Recetas visuales internas' : 'Internal visual recipes'}</span></div></button><button type="button" onClick={() => void send(es ? 'Convierte la idea actual en un XRoll por capas. Explica mecanismo visual, layers, parallax y qué debe animarse, sin inventar dashboards falsos.' : 'Turn the current idea into a layered XRoll. Explain visual mechanism, layers, parallax and what should animate, without inventing fake dashboards.')}><Cpu size={16}/><div><strong>{es ? 'Pensar como XRoll' : 'Think as XRoll'}</strong><span>{es ? 'Mecanismo · layers · motion' : 'Mechanism · layers · motion'}</span></div></button></section>
        <section><span className="micro">SCENE REFERENCES</span><div className="scene-recipe-mini">{sceneRecipes.slice(0, 8).map((recipe) => <button type="button" key={recipe.id} onClick={() => void send(`${es ? 'Usa esta receta como referencia, adáptala al Source Truth y devuelve opciones V2.5 exactas' : 'Use this recipe as a reference, adapt it to Source Truth and return exact V2.5 options'}: ${recipe.name}. ${recipe.purpose}. ${recipe.focal}, ${recipe.framing}, ${recipe.lighting}, ${recipe.movement}.`)}><strong>{recipe.name}</strong><span>{recipe.focal} · {recipe.framing}</span><small>{recipe.purpose}</small></button>)}</div></section>
        <section className="copilot-module-links"><span className="micro">HANDOFF</span><button type="button" onClick={onOpenPromptStudio}><Copy size={15}/>{es ? 'Volver al Director' : 'Back to Director'}</button><button type="button" onClick={onOpenXRoll}><ExternalLink size={15}/>XRoll Studio</button></section>
      </aside>
    </div>
  </section>;
}
