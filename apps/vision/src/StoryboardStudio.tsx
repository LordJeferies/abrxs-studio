import { AlertTriangle, CheckCircle2, Copy, Film, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useVisionI18n } from './i18n';
import type { DirectorState } from './promptEngine';
import { sceneStructureFields, type SceneStructureField } from './sceneEngine';
import {
  compileShotPackage,
  generateStoryboard,
  storyboardGrammars,
  type StoryboardGrammarId,
} from './storyboard';
import { targetProfiles, type GenerationTargetId } from './skillEngine';

const STORY_TARGETS: GenerationTargetId[] = ['generic-production', 'higgsfield-seedance', 'higgsfield-kling', 'veo', 'comfyui'];

const FIELD_LABELS: Record<SceneStructureField, [string, string]> = {
  goal: ['Goal', 'Objetivo'],
  obstacle: ['Obstacle', 'Obstáculo'],
  tactic: ['Tactic', 'Táctica'],
  reversal: ['Reversal', 'Giro'],
  valueShift: ['Value shift', 'Cambio de valor'],
};

function evidenceLabel(level: 'explicit' | 'inferred' | 'unresolved', es: boolean) {
  if (level === 'explicit') return es ? 'explícito' : 'explicit';
  if (level === 'inferred') return es ? 'inferido' : 'inferred';
  return es ? 'sin resolver' : 'unresolved';
}

export function StoryboardStudio({
  idea,
  director,
  onCopy,
}: {
  idea: string;
  director: DirectorState;
  onCopy: (value: string) => void;
}) {
  const { language, t, option } = useVisionI18n();
  const es = language === 'es';
  const [grammar, setGrammar] = useState<StoryboardGrammarId>('classical');
  const [sceneCount, setSceneCount] = useState(2);
  const [shotsPerScene, setShotsPerScene] = useState(4);
  const [target, setTarget] = useState<GenerationTargetId>('higgsfield-seedance');
  const board = useMemo(
    () => generateStoryboard(idea, grammar, sceneCount, shotsPerScene, director),
    [idea, grammar, sceneCount, shotsPerScene, director],
  );
  const grammarInfo = storyboardGrammars.find((item) => item.id === grammar) ?? storyboardGrammars[0];

  return (
    <section className="scene-view storyboard-studio">
      <div className="section-heading">
        <div>
          <span className="micro">{t('story.kicker')} · SCENE ENGINE · SKILL ENGINE V0.4</span>
          <h1>{t('story.title')}</h1>
          <p>{t(`grammar.${grammarInfo.id}.description`)}</p>
        </div>
        <button className="subtle-button" type="button" onClick={() => { setSceneCount(2); setShotsPerScene(4); setGrammar('classical'); setTarget('higgsfield-seedance'); }}>
          <RefreshCw size={15} /> {t('common.reset')}
        </button>
      </div>

      <div className="storyboard-controls">
        <label className="field">
          <span>{t('story.grammar')}</span>
          <div className="select-wrap">
            <select value={grammar} onChange={(event) => setGrammar(event.target.value as StoryboardGrammarId)}>
              {storyboardGrammars.map((item) => <option key={item.id} value={item.id}>{t(`grammar.${item.id}.name`)}</option>)}
            </select>
          </div>
        </label>
        <label className="field storyboard-target">
          <span>{es ? 'Destino de prompt' : 'Prompt target'}</span>
          <div className="select-wrap">
            <select value={target} onChange={(event) => setTarget(event.target.value as GenerationTargetId)}>
              {STORY_TARGETS.map((id) => <option key={id} value={id}>{targetProfiles.find((profile) => profile.id === id)?.label ?? id}</option>)}
            </select>
          </div>
        </label>
        <label className="field">
          <span>{t('story.scenes')}</span>
          <input type="number" min={1} max={12} value={sceneCount} onChange={(event) => setSceneCount(Number(event.target.value) || 1)} />
        </label>
        <label className="field">
          <span>{t('story.shotsPerScene')}</span>
          <input type="number" min={1} max={12} value={shotsPerScene} onChange={(event) => setShotsPerScene(Number(event.target.value) || 1)} />
        </label>
        <div className="storyboard-summary">
          <Film size={17} />
          <strong>{board.shots.length} {t('story.shots')}</strong>
          <span>{board.shots.reduce((total, shot) => total + shot.duration, 0).toFixed(1)}s {t('story.coverage')}</span>
          <span className={`scene-readiness-score grade-${board.readinessScore >= 88 ? 'a' : board.readinessScore >= 68 ? 'b' : board.readinessScore >= 48 ? 'c' : 'd'}`}>{es ? 'estructura' : 'structure'} {board.readinessScore}/100</span>
        </div>
      </div>

      <div className="scene-engine-intro">
        <div><span className="micro">{es ? 'ANTES DE GASTAR CRÉDITOS' : 'BEFORE SPENDING CREDITS'}</span><strong>{es ? 'Una escena visualmente bonita puede seguir estando muerta.' : 'A visually clean scene can still be structurally dead.'}</strong></div>
        <p>{es ? 'Vision revisa Objetivo · Obstáculo · Táctica · Giro · Cambio de valor. Si la fuente no define algo, lo marca como sin resolver en lugar de inventarlo.' : 'Vision checks Goal · Obstacle · Tactic · Reversal · Value Shift. If the source does not define something, it marks it unresolved instead of inventing it.'}</p>
      </div>

      <div className="storyboard-scenes">
        {Array.from({ length: board.sceneCount }, (_, sceneIndex) => {
          const sceneNumber = sceneIndex + 1;
          const shots = board.shots.filter((shot) => shot.scene === sceneNumber);
          const structure = board.sceneStructures[sceneIndex];
          return (
            <section className="storyboard-scene" key={sceneNumber}>
              <div className="storyboard-scene-head">
                <span className="micro">{t('story.scene')} {String(sceneNumber).padStart(2, '0')} · {structure.phase.toUpperCase()}</span>
                <strong>{t(`grammar.${grammarInfo.id}.name`)}</strong>
              </div>

              <details className="scene-readiness" open={sceneNumber === 1 || structure.unresolved.length > 0}>
                <summary>
                  <span className={`scene-grade grade-${structure.grade.toLowerCase()}`}>{structure.grade}</span>
                  <strong>{es ? 'Motor estructural de escena' : 'Scene structure engine'}</strong>
                  <span>{structure.readinessScore}/100</span>
                  <em>{structure.unresolved.length ? `${structure.unresolved.length} ${es ? 'sin resolver' : 'unresolved'}` : (es ? 'lista para planificar' : 'ready to plan')}</em>
                </summary>
                <div className="scene-structure-grid">
                  {sceneStructureFields(structure).map(([field, value]) => (
                    <article className={`scene-structure-field ${value.level}`} key={field}>
                      <div><strong>{es ? FIELD_LABELS[field][1] : FIELD_LABELS[field][0]}</strong><span>{evidenceLabel(value.level, es)}</span></div>
                      <p>{value.value || (es ? 'No está definido en la idea ni en la dirección actual.' : 'Not defined in the source idea or current direction.')}</p>
                    </article>
                  ))}
                </div>
                {structure.warnings.length > 0 && <div className="scene-warning-list">{structure.warnings.map((warning) => <p key={warning}><AlertTriangle size={13}/>{es ? warning
                  .replace('No concrete obstacle is explicit in the source. Do not invent one silently before expensive generation.', 'No hay un obstáculo concreto explícito en la fuente. No lo inventes silenciosamente antes de una generación costosa.')
                  .replace('No reversal/turn is explicit. A visually clean scene can still feel structurally dead without a change in information or pressure.', 'No hay un giro explícito. Una escena visualmente limpia puede sentirse muerta si no cambia la información o la presión.')
                  .replace('The value shift is unresolved. Define what changes from the beginning to the end of the scene.', 'El cambio de valor está sin resolver. Define qué cambia entre el inicio y el final de la escena.')
                  .replace('The scene has no source idea; structural readiness cannot be assessed reliably.', 'La escena no tiene una idea fuente; no se puede evaluar la estructura de forma fiable.') : warning}</p>)}</div>}
                {!structure.unresolved.length && <div className="scene-ready-note"><CheckCircle2 size={14}/>{es ? 'Los cinco elementos tienen soporte suficiente para pasar al shot planning.' : 'All five elements have enough support to proceed to shot planning.'}</div>}
              </details>

              <div className="scene-board">
                {shots.map((shot) => {
                  const shotPackage = compileShotPackage(shot, director, idea, target);
                  return (
                    <article className="shot-card" key={shot.id}>
                      <div className="shot-media">
                        <span className="shot-index">{shot.scene}.{shot.shot}</span>
                        <div className="shot-frame-guide"><span>{option(shot.framing)}</span></div>
                      </div>
                      <div className="shot-meta">
                        <strong>{option(shot.narrativeRole)}</strong>
                        <span>{shot.focal} · {option(shot.angle)}</span>
                        <span>{option(shot.movement)} · {shot.duration.toFixed(1)}s</span>
                        <span className="shot-quality">{shotPackage.quality.grade} · {shotPackage.quality.score}/100</span>
                      </div>
                      <p className="shot-direction">{shot.promptHint}</p>
                      <button className="icon-button shot-copy" type="button" onClick={() => onCopy(shotPackage.providerPrompt)} aria-label={`${t('story.copyShot')} ${shot.scene}.${shot.shot}`}><Copy size={14} /></button>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
