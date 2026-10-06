import { Copy, Film, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
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
          <span className="micro">STORYBOARD STUDIO · OFFLINE</span>
          <h1>Turn one idea into deliberate cinematic coverage.</h1>
          <p>{grammarInfo.description}</p>
        </div>
        <button className="subtle-button" type="button" onClick={() => { setSceneCount(2); setShotsPerScene(4); setGrammar('classical'); }}>
          <RefreshCw size={15} /> Reset
        </button>
      </div>

      <div className="storyboard-controls">
        <label className="field">
          <span>Cinema grammar</span>
          <div className="select-wrap">
            <select value={grammar} onChange={(event) => setGrammar(event.target.value as StoryboardGrammarId)}>
              {storyboardGrammars.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
        </label>
        <label className="field">
          <span>Scenes</span>
          <input type="number" min={1} max={12} value={sceneCount} onChange={(event) => setSceneCount(Number(event.target.value) || 1)} />
        </label>
        <label className="field">
          <span>Shots / scene</span>
          <input type="number" min={1} max={12} value={shotsPerScene} onChange={(event) => setShotsPerScene(Number(event.target.value) || 1)} />
        </label>
        <div className="storyboard-summary">
          <Film size={17} />
          <strong>{board.shots.length} shots</strong>
          <span>{board.shots.reduce((total, shot) => total + shot.duration, 0).toFixed(1)}s estimated coverage</span>
        </div>
      </div>

      <div className="storyboard-scenes">
        {Array.from({ length: board.sceneCount }, (_, sceneIndex) => {
          const sceneNumber = sceneIndex + 1;
          const shots = board.shots.filter((shot) => shot.scene === sceneNumber);
          return (
            <section className="storyboard-scene" key={sceneNumber}>
              <div className="storyboard-scene-head">
                <span className="micro">SCENE {String(sceneNumber).padStart(2, '0')}</span>
                <strong>{grammarInfo.name}</strong>
              </div>
              <div className="scene-board">
                {shots.map((shot) => {
                  const shotPrompt = compileShotPrompt(shot, director, idea);
                  return (
                    <article className="shot-card" key={shot.id}>
                      <div className="shot-media">
                        <span className="shot-index">{shot.scene}.{shot.shot}</span>
                        <div className="shot-frame-guide">
                          <span>{shot.framing}</span>
                        </div>
                      </div>
                      <div className="shot-meta">
                        <strong>{shot.narrativeRole}</strong>
                        <span>{shot.focal} · {shot.angle}</span>
                        <span>{shot.movement} · {shot.duration.toFixed(1)}s</span>
                      </div>
                      <p className="shot-direction">{shot.promptHint}</p>
                      <button className="icon-button shot-copy" type="button" onClick={() => onCopy(shotPrompt)} aria-label={`Copy shot ${shot.scene}.${shot.shot} prompt`}>
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
