import { Copy, Film, Image as ImageIcon, ShieldCheck, Sparkles, Timer, Workflow } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
  const es = language === 'es';

  useEffect(() => localStorage.setItem('abrxsVisionSkillTargetV1', target), [target]);
  useEffect(() => localStorage.setItem('abrxsVisionSkillModeV1', mode), [mode]);
  useEffect(() => localStorage.setItem('abrxsVisionSkillIntentV1', intent), [intent]);

  const normalizedRefs = useMemo(
    () => references.map((reference) => ({ ...reference, role: normalizeReferenceRole(reference.role) })),
    [references],
  );
  const compilation = useMemo(() => compileSkillPrompt({
    director,
    mode,
    target,
    intent,
    duration,
    references: normalizedRefs,
    startImageProvided: normalizedRefs.some((reference) => ['first-frame', 'identity', 'look'].includes(reference.role)),
  }), [director, mode, target, intent, duration, normalizedRefs]);
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

  return (
    <section className="skill-engine-panel">
      <div className="skill-engine-head">
        <div>
          <span className="micro">VISUAL GENERATION SKILL ENGINE · V0.4</span>
          <h2>{es ? 'Compila para el modelo, no sólo “un prompt”.' : 'Compile for the model, not just “a prompt”.'}</h2>
          <p>{es
            ? 'Vision conserva una especificación ABRAXAS canónica y la traduce a una gramática adecuada para Higgsfield/Seedance/Kling/Veo/ComfyUI sin perder intención, continuidad ni restricciones.'
            : 'Vision keeps one canonical ABRAXAS production spec and translates it into the target grammar for Higgsfield/Seedance/Kling/Veo/ComfyUI without losing intent, continuity or constraints.'}</p>
        </div>
        <div className={`skill-score grade-${compilation.quality.grade.toLowerCase()}`}>
          <strong>{compilation.quality.grade}</strong><span>{compilation.quality.score}/100</span>
        </div>
      </div>

      <div className="skill-engine-grid">
        <div className="skill-controls-card">
          <label><span>{es ? 'Destino' : 'Target'}</span><select value={target} onChange={(event) => setTarget(event.target.value as GenerationTargetId)}>{targetProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.label}</option>)}</select></label>
          <label><span>{es ? 'Modo' : 'Mode'}</span><select value={mode} onChange={(event) => setMode(event.target.value as GenerationMode)}>{MODES.map((value) => <option key={value} value={value}>{modeLabel(value)}</option>)}</select></label>
          <label><span>{es ? 'Intención' : 'Intent'}</span><select value={intent} onChange={(event) => setIntent(event.target.value as GenerationIntent)}>{generationIntents.map((value) => <option key={value} value={value}>{intentLabel(value)}</option>)}</select></label>
          <label><span>{es ? 'Duración' : 'Duration'}</span><div className="skill-duration"><Timer size={14}/><input type="number" min={2} max={60} value={duration} disabled={!mode.includes('video')} onChange={(event) => setDuration(Math.max(2, Math.min(60, Number(event.target.value) || 8)))}/><small>s</small></div></label>

          <div className="route-card">
            <Workflow size={16}/><div><span className="micro">{es ? 'RUTA SUGERIDA' : 'SUGGESTED ROUTE'}</span><strong>{targetProfiles.find((profile) => profile.id === route.primary)?.label ?? route.primary}</strong><p>{route.rationale[0]}</p></div>
          </div>

          <div className="skill-badges"><span>MCSLA</span><span>I2V Δ</span><span>CONTINUITY</span><span>QA GATES</span><span>PROVIDER-AWARE</span></div>
        </div>

        <article className="skill-output-card">
          <div className="skill-output-head"><div><span className="micro">{es ? 'PROMPT DEL DESTINO' : 'TARGET PROMPT'}</span><strong>{compilation.target.label}</strong></div><button className="icon-button" type="button" onClick={() => onCopy(compilation.providerPrompt)} aria-label="Copy target prompt"><Copy size={15}/></button></div>
          <pre>{compilation.providerPrompt}</pre>
        </article>
      </div>

      <div className="quality-gates">
        {compilation.quality.gates.map((gate) => <div className={gate.passed ? 'quality-gate pass' : 'quality-gate fail'} key={gate.id}><ShieldCheck size={14}/><div><strong>{gate.label}</strong><span>{gate.detail}</span></div></div>)}
      </div>

      {compilation.quality.warnings.length > 0 && <div className="skill-warning-list">{compilation.quality.warnings.map((warning) => <p key={warning}><Sparkles size={13}/>{warning}</p>)}</div>}

      <div className="skill-foot">
        <span><ImageIcon size={13}/>{normalizedRefs.length} {es ? 'referencias con rol' : 'role-tagged references'}</span>
        <span><Film size={13}/>{compilation.timeline.length} {es ? 'beats temporales' : 'temporal beats'}</span>
        <span>{compilation.provenance.slice(0, 5).join(' · ')}</span>
      </div>
    </section>
  );
}
