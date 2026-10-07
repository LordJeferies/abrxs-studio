import { Bot, Check, Copy, Cpu, ExternalLink, Send, Settings2, Sparkles, WandSparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { buildVisionAssistantSystemPrompt, sceneRecipes, type AssistantProviderId, type VisionAssistantEnvelope } from './assistantCore';
import { applyAssistantAction, currentAssistantContext, loadAssistantPreferences, runVisionAssistant, type AssistantMessage } from './assistantBridge';

type Props = {
  language: 'es' | 'en';
  onOpenSettings: () => void;
  onOpenPromptStudio: () => void;
  onOpenXRoll: () => void;
};

type ChatRow = AssistantMessage & { envelope?: VisionAssistantEnvelope };

function contextBlock() {
  const { director, brief } = currentAssistantContext();
  return JSON.stringify({
    director: {
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

export function VisionCopilot({ language, onOpenSettings, onOpenPromptStudio, onOpenXRoll }: Props) {
  const es = language === 'es';
  const [provider, setProvider] = useState<AssistantProviderId>('nvidia');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<ChatRow[]>([
    { role: 'assistant', content: es ? 'Puedo revisar el proyecto actual, mejorar un prompt, proponer cambios de cámara/luz, sugerir referencias de escena y preparar acciones que tú decides si aplicar.' : 'I can inspect the current project, improve a prompt, propose camera/light changes, suggest scene references and prepare actions that you decide whether to apply.' },
  ]);
  const preferences = useMemo(loadAssistantPreferences, []);

  const send = async (preset?: string) => {
    const question = (preset ?? input).trim();
    if (!question || busy) return;
    setBusy(true); setError(''); setInput('');
    const userRow: ChatRow = { role: 'user', content: question };
    const conversation: AssistantMessage[] = [...rows.filter((row) => row.role === 'user' || row.role === 'assistant').map(({ role, content }) => ({ role, content })), userRow]
      .slice(-10);
    try {
      const enriched = `${question}\n\nCURRENT VISION PROJECT CONTEXT:\n${contextBlock()}`;
      conversation[conversation.length - 1] = { role: 'user', content: enriched };
      const envelope = await runVisionAssistant({ provider, systemPrompt: buildVisionAssistantSystemPrompt(language), messages: conversation, preferences });
      setRows((current) => [...current, userRow, { role: 'assistant', content: envelope.message, envelope }]);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : String(reason);
      setRows((current) => [...current, userRow]);
      setError(message);
    } finally { setBusy(false); }
  };

  return <section className="vision-copilot-v2">
    <header className="copilot-head">
      <div><span className="micro">VISION COPILOT · AI ASSISTANT</span><h1>{es ? 'Habla con el Director.' : 'Talk to the Director.'}</h1><p>{es ? 'El asistente ve el contexto actual de Vision y puede sugerir cambios aplicables. No ejecuta generación ni gasta créditos sin pasar por el módulo de creación.' : 'The assistant sees current Vision context and can propose applicable changes. It never executes generation or spends credits without the creation module.'}</p></div>
      <div className="copilot-head-actions"><label><span>Engine</span><select value={provider} onChange={(event) => setProvider(event.target.value as AssistantProviderId)}><option value="nvidia">NVIDIA NIM</option><option value="gemini-cli">Gemini CLI</option></select></label><button className="subtle-button" type="button" onClick={onOpenSettings}><Settings2 size={15}/>{es ? 'Conexiones' : 'Connections'}</button></div>
    </header>

    <div className="copilot-grid">
      <main className="copilot-chat">
        <div className="copilot-thread">
          {rows.map((row, index) => <article className={`copilot-message ${row.role}`} key={index}>
            <div className="copilot-avatar">{row.role === 'assistant' ? <Bot size={16}/> : <span>YOU</span>}</div>
            <div className="copilot-bubble"><p>{row.content}</p>{row.envelope?.references?.length ? <div className="copilot-reference-list">{row.envelope.references.map((reference) => <div key={`${reference.title}-${reference.why}`}><strong>{reference.title}</strong><span>{reference.why}</span>{reference.camera && <small>Camera: {reference.camera}</small>}{reference.light && <small>Light: {reference.light}</small>}{reference.composition && <small>Composition: {reference.composition}</small>}{reference.motion && <small>Motion: {reference.motion}</small>}</div>)}</div> : null}{row.envelope?.actions?.length ? <div className="copilot-actions"><span className="micro">{es ? 'CAMBIOS PROPUESTOS' : 'PROPOSED CHANGES'}</span>{row.envelope.actions.map((action, actionIndex) => <div className="copilot-action" key={`${action.type}-${String(action.field)}-${actionIndex}`}><div><strong>{action.type === 'set-director' ? `Director · ${String(action.field)}` : `Prompt brief · ${String(action.field)}`}</strong><p>{String(action.value)}</p>{action.reason && <small>{action.reason}</small>}</div><button type="button" onClick={() => applyAssistantAction(action)}><Check size={14}/>{es ? 'Aplicar' : 'Apply'}</button></div>)}</div> : null}</div>
          </article>)}
          {busy && <article className="copilot-message assistant"><div className="copilot-avatar"><Cpu size={16}/></div><div className="copilot-bubble thinking"><span/><span/><span/></div></article>}
        </div>
        {error && <div className="copilot-error"><strong>{es ? 'No se pudo usar el engine.' : 'Could not use the engine.'}</strong><span>{error}</span><button type="button" onClick={onOpenSettings}>{es ? 'Abrir conexiones' : 'Open connections'}</button></div>}
        <div className="copilot-composer"><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder={es ? 'Ej: mejora este prompt sin cambiar la composición; dame 3 referencias para una escena de tensión; haz la luz más editorial…' : 'Example: improve this prompt without changing composition; give me 3 references for a tense scene; make the light more editorial…'}/><button type="button" disabled={busy || !input.trim()} onClick={() => void send()}><Send size={17}/></button></div>
      </main>

      <aside className="copilot-side">
        <section><span className="micro">QUICK TASKS</span><button type="button" onClick={() => void send(es ? 'Revisa el prompt y el Director actuales. Dime los 3 problemas que más reducen calidad y propón cambios aplicables sin alterar la intención.' : 'Review the current prompt and Director. Tell me the 3 issues that most reduce quality and propose applicable changes without altering intent.')}><WandSparkles size={16}/><div><strong>{es ? 'Auditar y mejorar' : 'Audit & improve'}</strong><span>{es ? 'Diagnóstico + cambios aplicables' : 'Diagnosis + applicable changes'}</span></div></button><button type="button" onClick={() => void send(es ? 'Dame referencias internas de estilo/escena para esta idea actual. Quiero opciones realmente diferentes de cámara, luz y composición.' : 'Give me internal style/scene references for the current idea. I want genuinely different camera, light and composition options.')}><Sparkles size={16}/><div><strong>{es ? 'Dame referencias' : 'Suggest references'}</strong><span>{es ? 'Recetas visuales internas' : 'Internal visual recipes'}</span></div></button><button type="button" onClick={() => void send(es ? 'Convierte la idea actual en un XR por capas. Explica el mecanismo visual, qué layers usar y qué debe animarse.' : 'Turn the current idea into a layered XRoll. Explain the visual mechanism, layers and what should animate.')}><Cpu size={16}/><div><strong>{es ? 'Pensar como XR' : 'Think as XRoll'}</strong><span>{es ? 'Mecanismo · layers · motion' : 'Mechanism · layers · motion'}</span></div></button></section>
        <section><span className="micro">SCENE REFERENCES</span><div className="scene-recipe-mini">{sceneRecipes.slice(0, 6).map((recipe) => <button type="button" key={recipe.id} onClick={() => void send(`${es ? 'Usa esta receta como referencia, adáptala a mi idea actual y propón los cambios necesarios' : 'Use this recipe as a reference, adapt it to my current idea and propose the necessary changes'}: ${recipe.name}. ${recipe.purpose}. ${recipe.focal}, ${recipe.framing}, ${recipe.lighting}, ${recipe.movement}.`)}><strong>{recipe.name}</strong><span>{recipe.focal} · {recipe.framing}</span><small>{recipe.purpose}</small></button>)}</div></section>
        <section className="copilot-module-links"><span className="micro">HANDOFF</span><button type="button" onClick={onOpenPromptStudio}><Copy size={15}/>{es ? 'Abrir Prompt Studio' : 'Open Prompt Studio'}</button><button type="button" onClick={onOpenXRoll}><ExternalLink size={15}/>XRoll Studio</button></section>
      </aside>
    </div>
  </section>;
}
