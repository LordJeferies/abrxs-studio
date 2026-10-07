import { Check, Copy, Download, FileCode2, FileJson2, FileText, RefreshCw, Sparkles, Upload, WandSparkles } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import {
  applyFichaPatches,
  fichaSummary,
  improveFichaPrompt,
  parseFichaDocument,
  type FichaDocument,
  type FichaPromptPatch,
} from './fichaIntake';

type Props = {
  language: 'es' | 'en';
  onCopy?: (value: string) => void;
};

type ImportedFicha = {
  id: string;
  document: FichaDocument;
  patches: Map<string, FichaPromptPatch>;
};

function saveText(filename: string, content: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function extensionType(filename: string) {
  if (/\.html?$/i.test(filename)) return 'text/html';
  if (/\.json$/i.test(filename)) return 'application/json';
  return 'text/plain';
}

function SourceIcon({ type }: { type: FichaDocument['sourceType'] }) {
  if (type === 'html') return <FileCode2 size={17}/>;
  if (type === 'json') return <FileJson2 size={17}/>;
  return <FileText size={17}/>;
}

export function FichaIntakePanel({ language, onCopy }: Props) {
  const es = language === 'es';
  const fileRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<ImportedFicha[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string>('');
  const [activeSlotId, setActiveSlotId] = useState<string>('');
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState('');

  const active = documents.find((item) => item.id === activeDocumentId) ?? documents[0];
  const slot = active?.document.slots.find((item) => item.id === activeSlotId) ?? active?.document.slots[0];
  const patch = active && slot ? active.patches.get(slot.id) : undefined;
  const currentDraft = draft || patch?.after || slot?.prompt || '';
  const summary = useMemo(() => active ? fichaSummary(active.document) : null, [active]);

  const loadFiles = async (files: File[]) => {
    const imported: ImportedFicha[] = [];
    const errors: string[] = [];
    for (const file of files) {
      try {
        const document = parseFichaDocument(file.name, await file.text());
        imported.push({ id: `${Date.now()}-${imported.length}-${file.name}`, document, patches: new Map() });
      } catch (error) {
        errors.push(`${file.name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    if (imported.length) {
      setDocuments((current) => [...current, ...imported]);
      setActiveDocumentId(imported[0].id);
      setActiveSlotId(imported[0].document.slots[0]?.id ?? '');
      setDraft('');
    }
    setMessage(errors.length ? errors.join(' · ') : (es ? `${imported.length} ficha(s) importada(s).` : `${imported.length} ficha(s) imported.`));
  };

  const chooseDocument = (id: string) => {
    const next = documents.find((item) => item.id === id);
    setActiveDocumentId(id);
    setActiveSlotId(next?.document.slots[0]?.id ?? '');
    setDraft('');
  };

  const chooseSlot = (id: string) => {
    setActiveSlotId(id);
    const next = active?.document.slots.find((item) => item.id === id);
    setDraft(active?.patches.get(id)?.after ?? next?.prompt ?? '');
  };

  const autoImprove = () => {
    if (!slot) return;
    setDraft(improveFichaPrompt(slot, { language }));
  };

  const stagePatch = () => {
    if (!active || !slot) return;
    const after = currentDraft.trim();
    if (!after || after === slot.prompt) {
      setMessage(es ? 'No hay un cambio de prompt que aplicar.' : 'There is no prompt change to apply.');
      return;
    }
    setDocuments((items) => items.map((item) => {
      if (item.id !== active.id) return item;
      const patches = new Map(item.patches);
      patches.set(slot.id, { slotId: slot.id, before: slot.prompt, after });
      return { ...item, patches };
    }));
    setMessage(es ? 'Cambio preparado. El original sigue intacto hasta exportar.' : 'Patch staged. The original stays untouched until export.');
  };

  const clearPatch = () => {
    if (!active || !slot) return;
    setDocuments((items) => items.map((item) => {
      if (item.id !== active.id) return item;
      const patches = new Map(item.patches);
      patches.delete(slot.id);
      return { ...item, patches };
    }));
    setDraft(slot.prompt);
  };

  const improveAll = () => {
    if (!active) return;
    setDocuments((items) => items.map((item) => {
      if (item.id !== active.id) return item;
      const patches = new Map(item.patches);
      for (const candidate of item.document.slots) {
        const after = improveFichaPrompt(candidate, { language });
        if (after !== candidate.prompt) patches.set(candidate.id, { slotId: candidate.id, before: candidate.prompt, after });
      }
      return { ...item, patches };
    }));
    setDraft(slot ? improveFichaPrompt(slot, { language }) : '');
    setMessage(es ? 'Mejoras automáticas preparadas para todos los prompts; revisa antes de exportar.' : 'Automatic improvements staged for every prompt; review before export.');
  };

  const exportActive = () => {
    if (!active) return;
    try {
      const output = applyFichaPatches(active.document, Array.from(active.patches.values()));
      const ext = active.document.filename.replace(/(\.[^.]+)?$/, '');
      const suffix = active.document.sourceType === 'html' ? '.html' : active.document.sourceType === 'json' ? '.json' : '.txt';
      saveText(`${ext}_VISION_V2${suffix}`, output, extensionType(active.document.filename));
      setMessage(es ? 'Ficha actualizada exportada. El archivo original no fue modificado.' : 'Updated ficha exported. The original file was not modified.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  };

  const exportPatchManifest = () => {
    if (!active) return;
    const manifest = {
      schema: 'abrxs.vision.ficha-patch.v2',
      source: active.document.filename,
      sourceSchema: active.document.schema,
      createdAt: new Date().toISOString(),
      patches: Array.from(active.patches.values()).map((item) => ({ slotId: item.slotId, before: item.before, after: item.after })),
    };
    saveText(`${active.document.filename.replace(/\.[^.]+$/, '')}_VISION_PATCH.json`, JSON.stringify(manifest, null, 2), 'application/json');
  };

  return <section className="ficha-intake-v2">
    <div className="section-heading ficha-heading">
      <div>
        <span className="micro">VISION V2 · FICHA INTAKE</span>
        <h1>{es ? 'Mejora fichas sin romper el lienzo original.' : 'Improve fichas without breaking the original canvas.'}</h1>
        <p>{es ? 'Importa HTML, JSON o TXT. Vision detecta los prompts embebidos, muestra su contexto y sólo escribe los cambios que apruebes.' : 'Import HTML, JSON or TXT. Vision detects embedded prompts, shows their context and only writes changes you approve.'}</p>
      </div>
      <div className="ficha-top-actions">
        <input ref={fileRef} hidden multiple type="file" accept=".html,.htm,.json,.txt,text/html,application/json,text/plain" onChange={(event) => { const files = Array.from(event.currentTarget.files ?? []); if (files.length) void loadFiles(files); event.currentTarget.value = ''; }}/>
        <button className="primary-button" type="button" onClick={() => fileRef.current?.click()}><Upload size={16}/>{es ? 'Importar ficha(s)' : 'Import ficha(s)'}</button>
        {active && <button className="subtle-button" type="button" onClick={exportActive}><Download size={15}/>{es ? 'Exportar actualizada' : 'Export updated'}</button>}
      </div>
    </div>

    {!active ? <div className="ficha-dropzone" onClick={() => fileRef.current?.click()} role="button" tabIndex={0}>
      <Upload size={28}/>
      <strong>{es ? 'HTML · JSON · TXT' : 'HTML · JSON · TXT'}</strong>
      <p>{es ? 'Puedes importar una ficha, un lienzo del Geómetra o un HTML con muchas piezas.' : 'Import one ficha, a Geómetra canvas or an HTML containing many pieces.'}</p>
      <small>{es ? 'Vision no ejecuta el HTML: lee de forma segura el JSON embebido y preserva el documento original.' : 'Vision does not execute the HTML: it safely reads embedded JSON and preserves the original document.'}</small>
    </div> : <div className="ficha-workspace">
      <aside className="ficha-docs">
        <span className="micro">{es ? 'DOCUMENTOS' : 'DOCUMENTS'}</span>
        {documents.map((item) => {
          const s = fichaSummary(item.document);
          return <button type="button" className={item.id === active.id ? 'ficha-doc active' : 'ficha-doc'} key={item.id} onClick={() => chooseDocument(item.id)}>
            <SourceIcon type={item.document.sourceType}/>
            <div><strong>{item.document.filename}</strong><small>{s.pieces} {es ? 'piezas' : 'pieces'} · {s.prompts} prompts · {item.patches.size} {es ? 'cambios' : 'changes'}</small></div>
          </button>;
        })}
        <div className="ficha-summary-card">
          <span>{active.document.sourceType.toUpperCase()}</span>
          <strong>{summary?.schema}</strong>
          <small>{summary?.pieces} {es ? 'piezas detectadas' : 'pieces detected'}</small>
          <small>{summary?.prompts} prompts</small>
        </div>
        <button className="wide-button" type="button" onClick={improveAll}><Sparkles size={15}/>{es ? 'Preparar mejora de todos' : 'Stage improve all'}</button>
        <button className="wide-button" type="button" onClick={exportPatchManifest}><FileJson2 size={15}/>{es ? 'Exportar manifiesto de cambios' : 'Export patch manifest'}</button>
      </aside>

      <section className="ficha-slot-list">
        <div className="ficha-slot-head"><span className="micro">{es ? 'PROMPTS DETECTADOS' : 'DETECTED PROMPTS'}</span><strong>{active.document.slots.length}</strong></div>
        {active.document.slots.map((candidate) => {
          const staged = active.patches.has(candidate.id);
          return <button type="button" className={candidate.id === slot?.id ? 'ficha-slot active' : 'ficha-slot'} key={candidate.id} onClick={() => chooseSlot(candidate.id)}>
            <span className={`prompt-kind kind-${candidate.kind}`}>{candidate.kind.replaceAll('-', ' ')}</span>
            <strong>{candidate.label}</strong>
            <small>{candidate.breadcrumb}</small>
            {staged && <i><Check size={11}/>{es ? 'cambio' : 'patch'}</i>}
          </button>;
        })}
      </section>

      <main className="ficha-editor">
        {slot ? <>
          <div className="ficha-context-grid">
            <article><span className="micro">{es ? 'FUNCIÓN / CONTEXTO' : 'FUNCTION / CONTEXT'}</span><strong>{slot.context.role || slot.context.purpose || slot.context.objective || '—'}</strong><p>{slot.context.thesis || slot.context.description || slot.context.visual || (es ? 'Sin descripción adicional.' : 'No additional description.')}</p></article>
            <article><span className="micro">{es ? 'CONTINUIDAD' : 'CONTINUITY'}</span><p>{slot.context.continuity || slot.context.visualSystem || (es ? 'Heredar continuidad de la ficha.' : 'Inherit ficha continuity.')}</p></article>
          </div>
          <div className="ficha-compare">
            <article className="ficha-prompt original">
              <div className="card-head"><div><span className="micro">{es ? 'ORIGINAL' : 'ORIGINAL'}</span><h3>{slot.label}</h3></div><button className="icon-button" type="button" onClick={() => onCopy?.(slot.prompt)}><Copy size={15}/></button></div>
              <pre>{slot.prompt || (es ? 'Sin prompt todavía.' : 'No prompt yet.')}</pre>
            </article>
            <article className="ficha-prompt improved">
              <div className="card-head"><div><span className="micro">VISION V2</span><h3>{es ? 'Prompt mejorado / editable' : 'Improved / editable prompt'}</h3></div><button className="icon-button" type="button" onClick={autoImprove} title={es ? 'Mejorar automáticamente' : 'Auto improve'}><WandSparkles size={15}/></button></div>
              <textarea value={currentDraft} onChange={(event) => setDraft(event.target.value)} placeholder={es ? 'Edita manualmente o usa la mejora automática…' : 'Edit manually or use auto improve…'}/>
              <div className="ficha-editor-actions">
                <button className="subtle-button" type="button" onClick={autoImprove}><Sparkles size={15}/>{es ? 'Mejorar automáticamente' : 'Auto improve'}</button>
                <button className="primary-button" type="button" onClick={stagePatch}><Check size={15}/>{es ? 'Preparar cambio' : 'Stage patch'}</button>
                {patch && <button className="subtle-button" type="button" onClick={clearPatch}><RefreshCw size={15}/>{es ? 'Revertir' : 'Revert'}</button>}
              </div>
            </article>
          </div>
          <div className="ficha-safety-note"><strong>{es ? 'Regla de seguridad' : 'Safety rule'}</strong><span>{es ? 'Vision nunca modifica la ficha cargada en memoria de forma destructiva. Los cambios se preparan como patches y se exporta una copia nueva.' : 'Vision never destructively mutates the loaded ficha. Changes are staged as patches and exported to a new copy.'}</span></div>
        </> : <div className="ficha-empty"><FileText size={24}/><p>{es ? 'Esta ficha no contiene prompts reconocidos todavía.' : 'This ficha does not contain recognized prompts yet.'}</p></div>}
      </main>
    </div>}
    {message && <p className="ficha-message">{message}</p>}
  </section>;
}
