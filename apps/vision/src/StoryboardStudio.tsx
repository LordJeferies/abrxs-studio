import { Copy, Film, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useVisionI18n } from './i18n';
import type { DirectorState } from './promptEngine';
import {
  compileShotPrompt,
  generateStoryboard,
  storyboardGrammars,
  type StoryboardGrammarId,
} from './storyboard';

export function StoryboardStudio({
  idea,
  director,
  onCopy,
}: {
  idea: string;
  director: DirectorState;
  onCopy: (value: string) => void;
}) {
  const { t, option } = useVisionI18n();
  const [grammar, setGrammar] = useState<StoryboardGrammarId>('classical');
  const [sceneCount, setSceneCount] = useState(2);
  const [shotsPerScene, setShotsPerScene] = useState(4);
  const board = useMemo(
    () => generateStoryboard(idea, grammar, sceneCount, shotsPerScene, director),
    [idea, grammar, sceneCount, shotsPerScene, director],
  );
  const grammarInfo = storyboardGrammars.find((item) => item.id === grammar) ?? storyboardGrammars[0];

  return (
    <section className="scene-view storyboard-studio">
      <div className="section-heading">
        <div>
          <span className="micro">{t('story.kicker')}</span>
          <h1>{t('story.title')}</h1>
          <p>{t(`grammar.${grammarInfo.id}.description`)}</p>
        </div>
        <button className="subtle-button" type="button" onClick={() => { setSceneCount(2); setShotsPerScene(4); setGrammar('classical'); }}>
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
        </div>
      </div>

      <div className="storyboard-scenes">
        {Array.from({ length: board.sceneCount }, (_, sceneIndex) => {
          const sceneNumber = sceneIndex + 1;
          const shots = board.shots.filter((shot) => shot.scene === sceneNumber);
          return (
            <section className="storyboard-scene" key={sceneNumber}>
              <div className="storyboard-scene-head">
                <span className="micro">{t('story.scene')} {String(sceneNumber).padStart(2, '0')}</span>
                <strong>{t(`grammar.${grammarInfo.id}.name`)}</strong>
              </div>
              <div className="scene-board">
                {shots.map((shot) => {
                  const shotPrompt = compileShotPrompt(shot, director, idea);
                  return (
                    <article className="shot-card" key={shot.id}>
                      <div className="shot-media">
                        <span className="shot-index">{shot.scene}.{shot.shot}</span>
                        <div className="shot-frame-guide">
                          <span>{option(shot.framing)}</span>
                        </div>
                      </div>
                      <div className="shot-meta">
                        <strong>{option(shot.narrativeRole)}</strong>
                        <span>{shot.focal} · {option(shot.angle)}</span>
                        <span>{option(shot.movement)} · {shot.duration.toFixed(1)}s</span>
                      </div>
                      <p className="shot-direction">{shot.promptHint}</p>
                      <button className="icon-button shot-copy" type="button" onClick={() => onCopy(shotPrompt)} aria-label={`${t('story.copyShot')} ${shot.scene}.${shot.shot}`}>
                        <Copy size={14} />
                      </button>
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
