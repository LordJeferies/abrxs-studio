import { Check, Copy, Download, Layers3, Plus, Save, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { compileXRoll, xrollPresets, type XRollPreset } from './xrollEngine';

type Props = {
  language: 'es' | 'en';
  onCopy?: (value: string) => void;
};

type SavedPreset = XRollPreset & { custom?: true };

const STORE = 'abrxsVisionXRollPresetsV2';

function loadSaved(): SavedPreset[] {
  try {
    const raw = localStorage.getItem(STORE);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function download(filename: string, content: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

export function XRollStudio({ language, onCopy }: Props) {
  const es = language === 'es';
  const [presetId, setPresetId] = useState(xrollPresets[0].id);
  const [idea, setIdea] = useState(es ? 'El cliente tiene muchas opciones, pero ninguna forma clara de compararlas.' : 'The customer has many options but no clear way to compare them.');
  const [duration, setDuration] = useState(6);
  const [aspect, setAspect] = useState('9:16');
  const [layerMode, setLayerMode] = useState<'auto' | 'manual'>('auto');
  const [layerCount, setLayerCount] = useState(4);
  const [brand, setBrand] = useState('JOC / current Brand Vision');
  const [style, setStyle] = useState(xrollPresets[0].style);
  const [camera, setCamera] = useState(xrollPresets[0].camera);
  const [motion, setMotion] = useState(xrollPresets[0].motion);
  const [saved, setSaved] = useState<SavedPreset[]>(loadSaved);
  const [name, setName] = useState('');

  const presets = useMemo(() => [...xrollPresets, ...saved], [saved]);
  const selected = presets.find((item) => item.id === presetId) ?? presets[0];
  const effectiveCount = layerMode === 'auto' ? selected.layerCount : layerCount;
  const spec = useMemo(() => compileXRoll({ idea, duration, aspect, brand, style, layerCount: effectiveCount, camera, motion, preset: selected }), [idea, duration, aspect, brand, style, effectiveCount, camera, motion, selected]);

  useEffect(() => {
    const preset = presets.find((item) => item.id === presetId);
    if (!preset) return;
    setDuration(preset.duration);
    setAspect(preset.aspect);
    setLayerCount(preset.layerCount);
    setStyle(preset.style);
    setCamera(preset.camera);
    setMotion(preset.motion);
  // intentionally react only to preset selection
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetId]);

  const savePreset = () => {
    const label = name.trim() || `${selected.name} · ${effectiveCount}L`;
    const preset: SavedPreset = {
      id: `custom-${Date.now()}`,
      name: label,
      family: selected.family,
      duration,
      aspect,
      layerCount: effectiveCount,
      camera,
      motion,
      textMode: selected.textMode,
      style,
      custom: true,
    };
    const next = [...saved, preset];
    setSaved(next);
    localStorage.setItem(STORE, JSON.stringify(next));
    setPresetId(preset.id);
    setName('');
  };

  const exportPack = () => {
    const pack = [
      '# ABRXS VISION V2 · XROLL PACKAGE',
      '',
      '## MASTER',
      spec.masterPrompt,
      '',
      '## MOTION',
      spec.motionPrompt,
      '',
      '## COMPOSITE',
      spec.compositeSpec,
      '',
      '## LAYERS',
      ...spec.layers.flatMap((layer) => ['', `### ${layer.id} · ${layer.label}`, layer.prompt]),
      '',
      '## QA',
      ...spec.qa.map((item) => `- ${item}`),
    ].join('\n');
    download(`${spec.id}_PROMPT_PACK.md`, pack, 'text/markdown');
    download(`${spec.id}_SPEC.json`, JSON.stringify(spec, null, 2), 'application/json');
  };

  return <section className="xroll-studio-v2">
    <div className="section-heading">
      <div>
        <span className="micro">VISION V2 · XROLL STUDIO</span>
        <h1>{es ? 'Diseña el XR como sistema de capas, no como una sola imagen.' : 'Design the XRoll as a layer system, not a single image.'}</h1>
        <p>{es ? 'Define la idea; Vision recomienda una estructura, genera un prompt maestro, prompts por layer y un handoff para Dresser.' : 'Define the idea; Vision recommends a structure, compiles a master prompt, per-layer prompts and a Dresser handoff.'}</p>
      </div>
      <button className="primary-button" type="button" onClick={exportPack}><Download size={15}/>{es ? 'Exportar paquete XR' : 'Export XR pack'}</button>
    </div>

    <div className="xroll-grid">
      <aside className="xroll-controls">
        <label className="field"><span>{es ? 'Preset' : 'Preset'}</span><select value={presetId} onChange={(event) => setPresetId(event.target.value)}>{presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.name}</option>)}</select></label>
        <label className="field"><span>{es ? 'Idea / texto' : 'Idea / text'}</span><textarea value={idea} onChange={(event) => setIdea(event.target.value)}/></label>
        <div className="xroll-two"><label className="field"><span>{es ? 'Duración' : 'Duration'}</span><input type="number" min={2} max={20} step={0.5} value={duration} onChange={(event) => setDuration(Number(event.target.value))}/></label><label className="field"><span>{es ? 'Formato' : 'Aspect'}</span><select value={aspect} onChange={(event) => setAspect(event.target.value)}><option>9:16</option><option>16:9</option><option>4:5</option><option>1:1</option><option>2.39:1</option></select></label></div>
        <div className="field"><span>{es ? 'Layers' : 'Layers'}</span><div className="segmented"><button type="button" className={layerMode === 'auto' ? 'active' : ''} onClick={() => setLayerMode('auto')}>AUTO · {selected.layerCount}</button><button type="button" className={layerMode === 'manual' ? 'active' : ''} onClick={() => setLayerMode('manual')}>{es ? 'MANUAL' : 'MANUAL'}</button></div>{layerMode === 'manual' && <div className="layer-count-row">{[2,3,4,5,6,7,8].map((count) => <button key={count} type="button" className={layerCount === count ? 'active' : ''} onClick={() => setLayerCount(count)}>{count}</button>)}</div>}</div>
        <label className="field"><span>Brand / Vision DNA</span><input value={brand} onChange={(event) => setBrand(event.target.value)}/></label>
        <label className="field"><span>{es ? 'Estilo' : 'Style'}</span><input value={style} onChange={(event) => setStyle(event.target.value)}/></label>
        <label className="field"><span>{es ? 'Cámara' : 'Camera'}</span><input value={camera} onChange={(event) => setCamera(event.target.value)}/></label>
        <label className="field"><span>{es ? 'Movimiento' : 'Motion'}</span><textarea value={motion} onChange={(event) => setMotion(event.target.value)}/></label>
        <div className="preset-save"><input value={name} onChange={(event) => setName(event.target.value)} placeholder={es ? 'Nombre del preset combinado' : 'Combined preset name'}/><button type="button" className="subtle-button" onClick={savePreset}><Save size={14}/>{es ? 'Guardar combinación' : 'Save combination'}</button></div>
      </aside>

      <main className="xroll-output">
        <div className="xroll-summary">
          <article><span className="micro">{es ? 'FUNCIÓN' : 'FUNCTION'}</span><strong>{spec.visualFunction}</strong></article>
          <article><span className="micro">{es ? 'MECANISMO' : 'MECHANISM'}</span><p>{spec.metaphor}</p></article>
          <article><span className="micro">{es ? 'CAPAS' : 'LAYERS'}</span><strong>{spec.layers.length}</strong></article>
        </div>
        <div className="xroll-stack-preview">
          {spec.layers.map((layer, index) => <div className={`xroll-plane role-${layer.role}`} key={layer.id} style={{ transform: `translate(${index * 5}px, ${index * -5}px)` }}><span>{layer.id}</span><strong>{layer.label}</strong><small>{layer.parallax}×</small></div>)}
        </div>
        <article className="xroll-prompt-card"><div className="card-head"><div><span className="micro">ABRAXAS</span><h3>Master XRoll Prompt</h3></div><button className="icon-button" type="button" onClick={() => onCopy?.(spec.masterPrompt)}><Copy size={15}/></button></div><pre>{spec.masterPrompt}</pre></article>
        <article className="xroll-prompt-card"><div className="card-head"><div><span className="micro">MOTION</span><h3>{es ? 'Especificación temporal' : 'Temporal specification'}</h3></div><button className="icon-button" type="button" onClick={() => onCopy?.(spec.motionPrompt)}><Copy size={15}/></button></div><pre>{spec.motionPrompt}</pre></article>
        <div className="xroll-layer-cards">{spec.layers.map((layer) => <article key={layer.id} className={`xroll-layer-card role-${layer.role}`}><div className="xroll-layer-head"><Layers3 size={16}/><div><span className="micro">{layer.id}</span><strong>{layer.label}</strong></div><i>{layer.alpha ? 'ALPHA' : 'BASE'}</i></div><p>{layer.purpose}</p><details><summary>{es ? 'Prompt de esta capa' : 'Layer prompt'}</summary><pre>{layer.prompt}</pre><button className="subtle-button" type="button" onClick={() => onCopy?.(layer.prompt)}><Copy size={14}/>{es ? 'Copiar' : 'Copy'}</button></details></article>)}</div>
        <article className="xroll-qa"><div className="card-head"><div><span className="micro">QA</span><h3>{es ? 'Antes de enviarlo a Dresser' : 'Before Dresser handoff'}</h3></div><Sparkles size={16}/></div>{spec.qa.map((item) => <p key={item}><Check size={13}/>{item}</p>)}</article>
      </main>
    </div>
  </section>;
}
