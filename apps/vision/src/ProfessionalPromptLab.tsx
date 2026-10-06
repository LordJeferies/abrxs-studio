import { CheckCircle2, ChevronDown, Copy, RefreshCw, ShieldAlert, Sparkles, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useVisionI18n } from './i18n';
import { getOutputProfile, outputProfiles, type PromptOutputProfileId } from './outputProfiles';
import { defaults, type DirectorState } from './promptEngine';
import {
  compileProfessionalPrompt,
  professionalBriefDefaults,
  professionalTargetProfiles,
  type ProfessionalPromptBrief,
} from './professionalPromptEngine';
import { generationIntents, type GenerationIntent, type GenerationMode, type GenerationTargetId } from './skillEngine';

export const PROFESSIONAL_BRIEF_STORAGE_KEY = 'abrxsVisionProfessionalBriefV1';
export const PROFESSIONAL_BRIEF_EVENT = 'abrxs-vision-professional-brief';
const TARGET_KEY = 'abrxsVisionProfessionalTargetV1';
const MODE_KEY = 'abrxsVisionProfessionalModeV1';
const INTENT_KEY = 'abrxsVisionProfessionalIntentV1';

const MODES: GenerationMode[] = ['text-to-image', 'image-to-image', 'text-to-video', 'image-to-video', 'video-edit'];
const LEGACY_OUTPUTS: Record<string, PromptOutputProfileId> = {
  'cinematic-video': 'cinematic-shot',
  xroll: 'xroll-video',
  'carousel-frame': 'carousel-slide',
  'product-shot': 'product-hero',
};

function loadJson<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? { ...fallback as object, ...JSON.parse(raw) as object } as T : fallback; } catch { return fallback; }
}

function loadBrief(): ProfessionalPromptBrief {
  const loaded = loadJson(PROFESSIONAL_BRIEF_STORAGE_KEY, professionalBriefDefaults);
  const rawType = String(loaded.outputType ?? 'hero-image');
  const outputType = LEGACY_OUTPUTS[rawType] ?? getOutputProfile(rawType).id;
  return { ...professionalBriefDefaults, ...loaded, outputType };
}

function loadDirector(): DirectorState {
  try {
    const raw = localStorage.getItem('abrxsVisionDirectorV1');
    return raw ? { ...defaults, ...JSON.parse(raw) as DirectorState } : defaults;
  } catch { return defaults; }
}

function modeLabel(mode: GenerationMode, es: boolean) {
  const labels: Record<GenerationMode, [string, string]> = {
    'text-to-image': ['Text → Image', 'Texto → Imagen'],
    'image-to-image': ['Image → Image', 'Imagen → Imagen'],
    'text-to-video': ['Text → Video', 'Texto → Video'],
    'image-to-video': ['Image → Video', 'Imagen → Video'],
    'video-edit': ['Video edit', 'Edición de video'],
  };
  return es ? labels[mode][1] : labels[mode][0];
}

export function ProfessionalPromptLab() {
  const { language } = useVisionI18n();
  const es = language === 'es';
  const [open, setOpen] = useState(false);
  const [director, setDirector] = useState<DirectorState>(loadDirector);
  const [brief, setBrief] = useState<ProfessionalPromptBrief>(loadBrief);
  const [target, setTarget] = useState<GenerationTargetId>(() => (localStorage.getItem(TARGET_KEY) as GenerationTargetId) || 'higgsfield-seedance');
  const [mode, setMode] = useState<GenerationMode>(() => (localStorage.getItem(MODE_KEY) as GenerationMode) || 'text-to-video');
  const [intent, setIntent] = useState<GenerationIntent>(() => (localStorage.getItem(INTENT_KEY) as GenerationIntent) || 'cinematic');
  const [duration, setDuration] = useState(8);
  const [activeOutput, setActiveOutput] = useState<'target' | 'positive' | 'negative' | 'contract' | 'spec' | 'qa'>('target');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem(PROFESSIONAL_BRIEF_STORAGE_KEY, JSON.stringify(brief));
    window.dispatchEvent(new CustomEvent(PROFESSIONAL_BRIEF_EVENT, { detail: brief }));
  }, [brief]);
  useEffect(() => localStorage.setItem(TARGET_KEY, target), [target]);
  useEffect(() => localStorage.setItem(MODE_KEY, mode), [mode]);
  useEffect(() => localStorage.setItem(INTENT_KEY, intent), [intent]);
  useEffect(() => { if (open) setDirector(loadDirector()); }, [open]);

  const compiled = useMemo(() => compileProfessionalPrompt({ director, target, mode, intent, duration, brief }), [director, target, mode, intent, duration, brief]);
  const profiles = professionalTargetProfiles();
  const activeProfile = getOutputProfile(brief.outputType);

  const change = <K extends keyof ProfessionalPromptBrief>(key: K, value: ProfessionalPromptBrief[K]) => setBrief((current) => ({ ...current, [key]: value }));
  const sync = () => setDirector(loadDirector());
  const selectOutput = (id: PromptOutputProfileId) => {
    const profile = getOutputProfile(id);
    change('outputType', id);
    setMode(profile.defaultMode);
  };
  const copyCurrent = async () => {
    const value = activeOutput === 'target'
      ? compiled.targetPrompt
      : activeOutput === 'positive'
        ? compiled.positivePrompt
        : activeOutput === 'negative'
          ? compiled.negativePrompt
          : activeOutput === 'contract'
            ? compiled.outputContract
            : activeOutput === 'spec'
              ? compiled.productionSpec
              : JSON.stringify({ quality: compiled.quality, parameters: compiled.parameterPack, constraints: compiled.constraintPack }, null, 2);
    await navigator.clipboard.writeText(value);
    setCopied(true); window.setTimeout(() => setCopied(false), 1200);
  };

  return <>
    <button className="professional-lab-launcher" type="button" onClick={() => setOpen(true)}><Sparkles size={16}/><span>Prompt Lab</span><em>{compiled.quality.grade}</em></button>
    {open && <div className="professional-lab-backdrop" role="dialog" aria-modal="true" aria-label="Professional Prompt Lab">
      <section className="professional-lab">
        <header className="professional-lab-head">
          <div><span className="micro">ABRXS VISION · PROFESSIONAL PROMPT LAB · V0.6</span><h2>{es ? 'Dirige el resultado, no una bolsa de palabras.' : 'Direct the result, not a bag of prompt words.'}</h2><p>{es ? 'Vision mantiene un brief canónico: qué quieres, qué no quieres, qué output esperas, qué debe permanecer estable y cómo se debe comportar. Luego lo traduce a la gramática del target.' : 'Vision keeps one canonical brief: what you want, what you do not want, the expected output, what must stay stable and how it should behave. It then translates that brief into the target grammar.'}</p></div>
          <div className="professional-head-actions"><button type="button" className="subtle-button" onClick={sync}><RefreshCw size={14}/>{es ? 'Sincronizar Director' : 'Sync Director'}</button><button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Close"><X size={18}/></button></div>
        </header>

        <div className="professional-lab-grid">
          <aside className="professional-brief">
            <section className="brief-section want"><span className="micro">01 · {es ? 'QUÉ QUIERO' : 'WHAT I WANT'}</span><label><strong>{es ? 'Objetivo visual' : 'Visual objective'}</strong><textarea value={brief.objective} onChange={(event) => change('objective', event.target.value)}/></label><label><strong>{es ? 'Debe incluir' : 'Must have'}</strong><textarea value={brief.mustHave} onChange={(event) => change('mustHave', event.target.value)}/></label><small>{es ? 'Usa esta lista para decisiones obligatorias, no para repetir todo el prompt.' : 'Use this list for mandatory decisions, not to repeat the full prompt.'}</small></section>

            <section className="brief-section avoid"><span className="micro">02 · NO PROMPT</span><label><strong>{es ? 'Qué no quiero / fallos / clichés' : 'What I do not want / failures / clichés'}</strong><textarea value={brief.doNotWant} onChange={(event) => change('doNotWant', event.target.value)}/></label><small>{es ? 'Esta lista NO se pega ciegamente al modelo. Vision la conserva como intención de exclusión y la transforma en restricciones positivas, negative conditioning o reglas del workflow según el target.' : 'This list is NOT blindly appended to the model. Vision keeps it as exclusion intent and maps it to positive constraints, negative conditioning or workflow rules according to the target.'}</small></section>

            <section className="brief-section output"><span className="micro">03 · OUTPUT CONTRACT</span><div className="brief-two"><label><strong>{es ? 'Tipo de output' : 'Output type'}</strong><select value={brief.outputType} onChange={(event) => selectOutput(event.target.value as PromptOutputProfileId)}>{outputProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.label[language]}</option>)}</select></label><label><strong>{es ? 'Duración' : 'Duration'}</strong><input type="number" min={2} max={60} value={duration} disabled={!mode.includes('video')} onChange={(event) => setDuration(Math.max(2, Math.min(60, Number(event.target.value) || 8)))}/></label></div><small>{activeProfile.description[language]}</small><label><strong>{es ? 'Requisitos extra de entrega' : 'Additional delivery requirements'}</strong><textarea value={brief.outputRequirements} onChange={(event) => change('outputRequirements', event.target.value)}/></label><label><strong>{es ? 'Texto literal exacto (opcional)' : 'Exact literal text (optional)'}</strong><input value={brief.literalText} onChange={(event) => change('literalText', event.target.value)} placeholder={es ? 'Déjalo vacío si el texto se agregará luego como capa.' : 'Leave blank when typography will be added later as a layer.'}/></label><div className="prompt-profile-meta"><span>{es ? 'Entregables' : 'Deliverables'}: {activeProfile.deliverables.join(' · ')}</span><span>{es ? 'Texto' : 'Text'}: {activeProfile.textPolicy}</span><span>Alpha: {activeProfile.alpha ? (es ? 'sí' : 'yes') : 'no'}</span></div></section>

            <section className="brief-section motion"><span className="micro">04 · {es ? 'ACTUACIÓN / FÍSICA' : 'PERFORMANCE / PHYSICS'}</span><label><strong>{es ? 'Microcomportamiento' : 'Micro-behavior'}</strong><textarea value={brief.performance} onChange={(event) => change('performance', event.target.value)} placeholder={es ? 'Mirada, respiración, postura, manos, microexpresión…' : 'Eyes, breath, posture, hands, micro-expression…'}/></label><label><strong>{es ? 'Comportamiento físico/material' : 'Physics / material behavior'}</strong><textarea value={brief.physicsNotes} onChange={(event) => change('physicsNotes', event.target.value)}/></label></section>

            <section className="brief-section continuity"><span className="micro">05 · CONTINUITY / REFERENCES</span><label><strong>{es ? 'Prioridad de continuidad' : 'Continuity priority'}</strong><textarea value={brief.continuityPriority} onChange={(event) => change('continuityPriority', event.target.value)}/></label><label><strong>{es ? 'Cómo usar referencias' : 'Reference instructions'}</strong><textarea value={brief.referenceInstructions} onChange={(event) => change('referenceInstructions', event.target.value)}/></label></section>

            <section className="brief-section motion"><span className="micro">06 · MOTION / AUDIO</span><label><strong>{es ? 'Intención de movimiento' : 'Motion intent'}</strong><textarea value={brief.motionIntent} onChange={(event) => change('motionIntent', event.target.value)} disabled={!mode.includes('video')}/></label><label><strong>{es ? 'Intención sonora' : 'Audio intent'}</strong><textarea value={brief.audioIntent} onChange={(event) => change('audioIntent', event.target.value)} disabled={!mode.includes('video')}/></label></section>
          </aside>

          <main className="professional-output">
            <div className="professional-routing">
              <label><span>Target</span><div className="select-wrap"><select value={target} onChange={(event) => setTarget(event.target.value as GenerationTargetId)}>{profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.label}</option>)}</select><ChevronDown size={14}/></div></label>
              <label><span>{es ? 'Modo' : 'Mode'}</span><div className="select-wrap"><select value={mode} onChange={(event) => setMode(event.target.value as GenerationMode)}>{MODES.map((item) => <option key={item} value={item}>{modeLabel(item, es)}</option>)}</select><ChevronDown size={14}/></div></label>
              <label><span>{es ? 'Intención' : 'Intent'}</span><div className="select-wrap"><select value={intent} onChange={(event) => setIntent(event.target.value as GenerationIntent)}>{generationIntents.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown size={14}/></div></label>
              <div className={`professional-score grade-${compiled.quality.grade.toLowerCase()}`}><strong>{compiled.quality.grade}</strong><span>{compiled.quality.score}/100</span></div>
            </div>

            <div className="professional-policy"><ShieldAlert size={16}/><div><strong>{compiled.targetPolicy.promptRegime}</strong><span>{es ? 'Política de exclusiones:' : 'Exclusion policy:'} {compiled.targetPolicy.negativePolicy} · {compiled.constraintPack.strategy}</span>{compiled.targetPolicy.notes.map((note) => <small key={note}>{note}</small>)}</div></div>

            <nav className="professional-tabs">{(['target','positive','negative','contract','spec','qa'] as const).map((tab) => <button key={tab} type="button" className={activeOutput === tab ? 'active' : ''} onClick={() => setActiveOutput(tab)}>{tab === 'target' ? (es ? 'Prompt target' : 'Target prompt') : tab === 'positive' ? 'Positive' : tab === 'negative' ? 'No Prompt' : tab === 'contract' ? (es ? 'Contrato' : 'Contract') : tab === 'spec' ? 'Production spec' : 'QA'}</button>)}</nav>

            <article className="professional-prompt-view">
              <div className="professional-prompt-head"><div><span className="micro">{activeOutput.toUpperCase()}</span><strong>{profiles.find((profile) => profile.id === target)?.label ?? target} · {activeProfile.label[language]}</strong></div><button type="button" className="subtle-button" onClick={() => void copyCurrent()}>{copied ? <CheckCircle2 size={14}/> : <Copy size={14}/>} {copied ? (es ? 'Copiado' : 'Copied') : (es ? 'Copiar' : 'Copy')}</button></div>
              <pre>{activeOutput === 'target' ? compiled.targetPrompt : activeOutput === 'positive' ? compiled.positivePrompt : activeOutput === 'negative' ? compiled.negativePrompt : activeOutput === 'contract' ? compiled.outputContract : activeOutput === 'spec' ? compiled.productionSpec : JSON.stringify({ quality: compiled.quality, parameters: compiled.parameterPack, constraints: compiled.constraintPack, provenance: compiled.provenance }, null, 2)}</pre>
            </article>

            <div className="professional-gates">{compiled.quality.gates.map((gate) => <div className={gate.passed ? 'professional-gate pass' : 'professional-gate fail'} key={gate.id}><span>{gate.passed ? '✓' : '!'}</span><div><strong>{gate.label}</strong><small>{gate.detail}</small></div></div>)}</div>
            {compiled.quality.warnings.length > 0 && <div className="professional-warning-list">{compiled.quality.warnings.map((warning) => <p key={warning}>{warning}</p>)}</div>}
          </main>
        </div>
      </section>
    </div>}
  </>;
}
