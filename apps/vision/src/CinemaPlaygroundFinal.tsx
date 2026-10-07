import { Check, Copy, HelpCircle, RotateCcw, SlidersHorizontal, WandSparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DIRECTOR_CATEGORIES, DIRECTOR_OPTIONS, DIRECTOR_PRESETS, optionById, optionsFor, type DirectorCategory, type DirectorOption, type DirectorSelections } from './directorFinal';

type Props = { language: 'es' | 'en' };

type CompareCategory = 'lens' | 'angle' | 'aperture' | 'focus' | 'composition' | 'lighting' | 'movement' | 'look' | 'atmosphere' | 'fx';

const COMPARE_CATEGORIES: CompareCategory[] = ['lens','angle','aperture','focus','composition','lighting','movement','look','atmosphere','fx'];

function Stage({ option, label }: { option: DirectorOption; label: string }) {
  const p = option.preview;
  const style = {
    '--cp-subject-scale': String(p.subjectScale ?? 1),
    '--cp-subject-x': `${p.subjectX ?? 0}%`,
    '--cp-subject-y': `${p.subjectY ?? 0}%`,
    '--cp-bg-scale': String(p.backgroundScale ?? 1),
    '--cp-blur': `${Math.round((p.blur ?? 0) * 12)}px`,
    '--cp-contrast': String(p.contrast ?? 1),
    '--cp-haze': String(p.haze ?? 0),
    '--cp-vignette': String(p.vignette ?? 0),
    '--cp-grain': String(p.grain ?? 0),
    '--cp-bloom': String(p.bloom ?? 0),
  } as React.CSSProperties;
  return <article className="cp25-stage-wrap"><div className="cp25-stage" style={style} data-light={p.light ?? 'front'} data-motion={p.motion ?? 'none'}><div className="cp25-bg"/><div className="cp25-window"/><div className="cp25-table"><i/><i/><i/></div><div className="cp25-person"><span/><b/></div><div className="cp25-air"/><div className="cp25-bloom"/><div className="cp25-grain"/><div className="cp25-vignette"/><div className={`cp25-path ${p.motion ?? 'none'}`}/></div><footer><strong>{label}</strong><span>{option.label}</span></footer></article>;
}

function SelectionCard({ option, active, onSelect, onHelp }: { option: DirectorOption; active: boolean; onSelect: () => void; onHelp: () => void }) {
  return <article className={`cp25-choice ${active ? 'active' : ''}`}><button className="cp25-choice-main" onClick={onSelect}><div className="cp25-mini" data-light={option.preview.light ?? 'front'} style={{ '--mini-scale': String(option.preview.subjectScale ?? 1), '--mini-haze': String(option.preview.haze ?? 0), '--mini-contrast': String(option.preview.contrast ?? 1) } as React.CSSProperties}><span className="cp25-mini-bg"/><span className="cp25-mini-subject"/>{active ? <i><Check size={10}/></i> : null}</div><strong>{option.label}</strong><small>{option.short}</small></button><button className="cp25-help" onClick={onHelp}><HelpCircle size={13}/></button></article>;
}

export function CinemaPlaygroundFinal({ language }: Props) {
  const es = language === 'es';
  const [category, setCategory] = useState<CompareCategory>('lens');
  const initial = optionsFor('lens');
  const [a, setA] = useState(initial.find((item) => item.id === '35mm')?.id || initial[0]?.id || '');
  const [b, setB] = useState(initial.find((item) => item.id === '85mm')?.id || initial[1]?.id || initial[0]?.id || '');
  const [target, setTarget] = useState<'a' | 'b'>('b');
  const [help, setHelp] = useState<DirectorOption | null>(null);
  const [preset, setPreset] = useState('intimate-pressure');

  const choices = useMemo(() => optionsFor(category), [category]);
  const optionA = optionById(a) || choices[0] || DIRECTOR_OPTIONS[0];
  const optionB = optionById(b) || choices[1] || choices[0] || DIRECTOR_OPTIONS[0];

  const setCategorySafe = (next: CompareCategory) => {
    const list = optionsFor(next); setCategory(next); setA(list[0]?.id || ''); setB(list[1]?.id || list[0]?.id || ''); setTarget('b'); setHelp(null);
  };
  const setChoice = (id: string) => target === 'a' ? setA(id) : setB(id);
  const applyToDirector = (option: DirectorOption) => {
    let selections: DirectorSelections = {};
    try { selections = JSON.parse(localStorage.getItem('abrxsVisionV25FinalSelections') || '{}') as DirectorSelections; } catch { /* noop */ }
    const next = { ...selections, [option.category]: option.id };
    localStorage.setItem('abrxsVisionV25FinalSelections', JSON.stringify(next));
  };
  const applyPreset = () => {
    const found = DIRECTOR_PRESETS.find((item) => item.id === preset); if (!found) return;
    localStorage.setItem('abrxsVisionV25FinalSelections', JSON.stringify(found.values));
  };

  return <section className="cp25-shell">
    <header className="cp25-head"><div><span className="micro">CINEMA PLAYGROUND V2.5</span><h1>{es ? 'Aprende comparando la misma escena.' : 'Learn by comparing the same scene.'}</h1><p>{es ? 'Cambia una decisión a la vez. Las referencias programáticas explican jerarquía, luz, profundidad y movimiento sin fingir una simulación óptica físicamente perfecta. Para focales, una sola imagen 2D sólo puede aproximar el efecto.' : 'Change one decision at a time. Programmatic references explain hierarchy, light, depth and motion without pretending to be a physically perfect optical simulation. With focal length, a single 2D image can only approximate the effect.'}</p></div><button onClick={() => setCategorySafe('lens')}><RotateCcw size={14}/>{es ? 'Reset' : 'Reset'}</button></header>

    <div className="cp25-compare"><Stage option={optionA} label="A"/><div className="cp25-vs">VS</div><Stage option={optionB} label="B"/></div>

    <div className="cp25-toolbar"><div className="cp25-target"><span>{es ? 'Editar' : 'Edit'}</span><button className={target === 'a' ? 'active' : ''} onClick={() => setTarget('a')}>A</button><button className={target === 'b' ? 'active' : ''} onClick={() => setTarget('b')}>B</button></div><div className="cp25-category-scroll">{COMPARE_CATEGORIES.map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategorySafe(item)}>{DIRECTOR_CATEGORIES.find((categoryItem) => categoryItem.id === item)?.label}</button>)}</div></div>

    <div className="cp25-main"><main><div className="cp25-title"><div><span className="micro">REFERENCE SELECTOR</span><h2>{DIRECTOR_CATEGORIES.find((item) => item.id === category)?.label}</h2></div><p>{DIRECTOR_CATEGORIES.find((item) => item.id === category)?.description}</p></div><div className="cp25-grid">{choices.map((option) => <SelectionCard key={option.id} option={option} active={(target === 'a' ? a : b) === option.id} onSelect={() => setChoice(option.id)} onHelp={() => setHelp(option)}/>)}</div></main><aside><section><span className="micro">A</span><h3>{optionA.label}</h3><p>{optionA.effect}</p><small>{optionA.feel}</small><button onClick={() => applyToDirector(optionA)}><WandSparkles size={13}/>{es ? 'Usar A en Director' : 'Use A in Director'}</button></section><section><span className="micro">B</span><h3>{optionB.label}</h3><p>{optionB.effect}</p><small>{optionB.feel}</small><button onClick={() => applyToDirector(optionB)}><WandSparkles size={13}/>{es ? 'Usar B en Director' : 'Use B in Director'}</button></section><section><span className="micro">FULL RECIPE</span><select value={preset} onChange={(e) => setPreset(e.target.value)}>{DIRECTOR_PRESETS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><button onClick={applyPreset}><SlidersHorizontal size={13}/>{es ? 'Aplicar receta completa' : 'Apply full recipe'}</button></section></aside></div>

    {help ? <div className="cp25-sheet" role="dialog" aria-modal="true"><button className="cp25-backdrop" onClick={() => setHelp(null)}/><article><Stage option={help} label={DIRECTOR_CATEGORIES.find((item) => item.id === help.category)?.label || ''}/><header><div><span className="micro">REFERENCE EXPLAINER</span><h2>{help.label}</h2></div><button onClick={() => setHelp(null)}>×</button></header><dl><div><dt>{es ? 'Qué cambia' : 'What changes'}</dt><dd>{help.effect}</dd></div><div><dt>{es ? 'Sensación' : 'Feel'}</dt><dd>{help.feel}</dd></div><div><dt>{es ? 'Úsalo para' : 'Use it for'}</dt><dd>{help.useFor}</dd></div><div><dt>{es ? 'Evita cuando' : 'Avoid when'}</dt><dd>{help.avoidWhen}</dd></div></dl><div className="cp25-prompt-language"><strong>{es ? 'Lenguaje que entra al prompt' : 'Prompt language'}</strong><code>{help.prompt}</code><button onClick={() => navigator.clipboard.writeText(help.prompt)}><Copy size={13}/>{es ? 'Copiar' : 'Copy'}</button></div></article></div> : null}
  </section>;
}
