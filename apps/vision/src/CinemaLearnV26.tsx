import { Check, Copy, WandSparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  DIRECTOR_CATEGORIES,
  optionById,
  optionsFor,
  type DirectorCategory,
  type DirectorOption,
  type DirectorSelections,
} from './directorFinal';
import { CameraSceneV26 } from './CameraSceneV26';
import { sceneForOption } from './referenceMediaV26';

const LEARN_CATEGORIES: DirectorCategory[] = [
  'shot','lens','angle','aperture','focus','composition','lighting','whiteBalance','shutter','frameRate','movement','look','atmosphere','fx',
];

function loadSelections(): DirectorSelections {
  try { return JSON.parse(localStorage.getItem('abrxsVisionV26Selections') || '{}') as DirectorSelections; }
  catch { return {}; }
}

function RealExample({ option }: { option: DirectorOption }) {
  const scene = sceneForOption(option);
  return <figure className="v26-learn-photo">
    <img src={scene.url} alt={`${option.label} visual reference`} loading="lazy" style={{ objectPosition: scene.objectPosition }}/>
    <figcaption><span>{scene.fidelity === 'curated-effect-reference' ? 'CURATED EFFECT REF' : 'PHOTO EXAMPLE'}</span><small>{scene.credit}</small></figcaption>
  </figure>;
}

export function CinemaLearnV26({ language }: { language: 'es' | 'en' }) {
  const es = language === 'es';
  const [selections, setSelections] = useState<DirectorSelections>(loadSelections);
  const [category, setCategory] = useState<DirectorCategory>('lens');
  const choices = useMemo(() => optionsFor(category), [category]);
  const current = optionById(selections[category]) ?? choices[0];
  const [aId, setAId] = useState(() => current?.id ?? '');
  const [bId, setBId] = useState(() => choices.find((option) => option.id !== current?.id)?.id ?? current?.id ?? '');
  const a = optionById(aId) ?? choices[0];
  const b = optionById(bId) ?? choices[1] ?? choices[0];

  const changeCategory = (next: DirectorCategory) => {
    const list = optionsFor(next);
    const selected = optionById(selections[next]) ?? list[0];
    setCategory(next);
    setAId(selected?.id ?? '');
    setBId(list.find((option) => option.id !== selected?.id)?.id ?? selected?.id ?? '');
  };

  const apply = (option: DirectorOption) => {
    const next = { ...selections, [option.category]: option.id };
    setSelections(next);
    localStorage.setItem('abrxsVisionV26Selections', JSON.stringify(next));
  };

  if (!a || !b) return null;

  return <section className="v26-learn-shell">
    <header className="v26-learn-head">
      <div><span className="micro">REFERENCE LAB · SAME ENGINE AS DIRECTOR</span><h1>{es ? 'Aprende viendo qué cambia de verdad.' : 'Learn by seeing what actually changes.'}</h1><p>{es ? 'Camera View usa la misma selección de Director. Photo Reference añade ejemplos reales/curados. No se usa el antiguo muñeco V2.5.' : 'Camera View uses the same Director selections. Photo Reference adds real/curated examples. The old V2.5 mannequin is not used.'}</p></div>
    </header>

    <nav className="v26-learn-categories">
      {LEARN_CATEGORIES.map((id) => <button key={id} className={category === id ? 'active' : ''} onClick={() => changeCategory(id)}>{DIRECTOR_CATEGORIES.find((item) => item.id === id)?.label}</button>)}
    </nav>

    <div className="v26-learn-compare">
      <article>
        <header><span>A</span><strong>{a.label}</strong><button onClick={() => apply(a)}><WandSparkles size={13}/>{es ? 'Usar en Director' : 'Use in Director'}</button></header>
        <CameraSceneV26 selections={selections} override={a} label={`A · ${a.label}`}/>
        <RealExample option={a}/>
        <dl><div><dt>{es ? 'Qué cambia' : 'What changes'}</dt><dd>{a.effect}</dd></div><div><dt>{es ? 'Sensación' : 'Feel'}</dt><dd>{a.feel}</dd></div><div><dt>{es ? 'Úsalo para' : 'Use for'}</dt><dd>{a.useFor}</dd></div></dl>
      </article>

      <div className="v26-learn-vs">VS</div>

      <article>
        <header><span>B</span><strong>{b.label}</strong><button onClick={() => apply(b)}><WandSparkles size={13}/>{es ? 'Usar en Director' : 'Use in Director'}</button></header>
        <CameraSceneV26 selections={selections} override={b} label={`B · ${b.label}`}/>
        <RealExample option={b}/>
        <dl><div><dt>{es ? 'Qué cambia' : 'What changes'}</dt><dd>{b.effect}</dd></div><div><dt>{es ? 'Sensación' : 'Feel'}</dt><dd>{b.feel}</dd></div><div><dt>{es ? 'Úsalo para' : 'Use for'}</dt><dd>{b.useFor}</dd></div></dl>
      </article>
    </div>

    <section className="v26-learn-selector">
      <header><span className="micro">SELECTOR</span><strong>{DIRECTOR_CATEGORIES.find((item) => item.id === category)?.description}</strong></header>
      <div>{choices.map((option) => <button key={option.id} className={option.id === a.id || option.id === b.id ? 'active' : ''} onClick={() => option.id === a.id ? setBId(option.id) : setBId(option.id)}>
        <span>{option.id === a.id ? 'A' : option.id === b.id ? 'B' : ''}</span><strong>{option.label}</strong><small>{option.short}</small>
        {selections[category] === option.id && <i><Check size={10}/> Director</i>}
      </button>)}</div>
    </section>

    <section className="v26-learn-prompt-language">
      <article><strong>A · {a.label}</strong><code>{a.prompt}</code><button onClick={() => navigator.clipboard.writeText(a.prompt)}><Copy size={13}/></button></article>
      <article><strong>B · {b.label}</strong><code>{b.prompt}</code><button onClick={() => navigator.clipboard.writeText(b.prompt)}><Copy size={13}/></button></article>
    </section>
  </section>;
}
