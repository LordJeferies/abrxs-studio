import { Check, X } from 'lucide-react';
import { useEffect, useMemo, useRef, type MouseEvent as ReactMouseEvent } from 'react';
import {
  optionById,
  optionsFor,
  type DirectorCategory,
  type DirectorOption,
  type DirectorSelections,
} from './directorFinal';
import { sceneForOption } from './referenceMediaV26';
import { CameraSceneV26 } from './CameraSceneV26';

type Props = {
  language: 'es' | 'en';
  selections: DirectorSelections;
  onApply: (option: DirectorOption) => void;
  onClose?: () => void;
  embedded?: boolean;
};

type ColumnSpec = {
  category: DirectorCategory;
  titleEs: string;
  titleEn: string;
};

const COLUMNS: ColumnSpec[] = [
  { category: 'shot', titleEs: 'Plano', titleEn: 'Shot' },
  { category: 'camera', titleEs: 'Cámara', titleEn: 'Camera' },
  { category: 'lens', titleEs: 'Lente / focal', titleEn: 'Lens / focal' },
  { category: 'aperture', titleEs: 'Apertura', titleEn: 'Aperture' },
  { category: 'focus', titleEs: 'Foco', titleEn: 'Focus' },
];

function Column({ spec, value, language, onSelect }: {
  spec: ColumnSpec;
  value?: string;
  language: 'es' | 'en';
  onSelect: (option: DirectorOption) => void;
}) {
  const es = language === 'es';
  const list = optionsFor(spec.category);
  const ref = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const startY = useRef(0);
  const startScroll = useRef(0);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const target = [...root.querySelectorAll<HTMLElement>('[data-option-id]')]
      .find((node) => node.dataset.optionId === value);
    target?.scrollIntoView({ block: 'center' });
  }, [value, spec.category]);

  const handleScroll = () => {
    const root = ref.current;
    if (!root) return;
    const center = root.scrollTop + root.clientHeight / 2;
    const nodes = [...root.querySelectorAll<HTMLElement>('[data-option-id]')];
    let closest: HTMLElement | null = null;
    let distance = Number.POSITIVE_INFINITY;
    for (const node of nodes) {
      const nodeCenter = node.offsetTop + node.offsetHeight / 2;
      const d = Math.abs(center - nodeCenter);
      if (d < distance) { distance = d; closest = node; }
    }
    if (!closest) return;
    const option = optionById(closest.dataset.optionId);
    if (option && option.id !== value) onSelect(option);
  };

  const mouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    const root = ref.current;
    if (!root) return;
    dragging.current = true;
    startY.current = event.pageY;
    startScroll.current = root.scrollTop;
    root.classList.add('dragging');
    event.preventDefault();
  };

  const mouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const root = ref.current;
    if (!dragging.current || !root) return;
    root.scrollTop = startScroll.current - (event.pageY - startY.current) * 1.4;
  };

  const stopDrag = () => {
    dragging.current = false;
    ref.current?.classList.remove('dragging');
  };

  return <section className="v26-wheel-column">
    <header><span>{es ? spec.titleEs : spec.titleEn}</span><i/></header>
    <div className="v26-wheel-window">
      <div className="v26-wheel-center"/>
      <div className="v26-wheel-fade top"/>
      <div className="v26-wheel-fade bottom"/>
      <div
        ref={ref}
        className="v26-wheel-list"
        role="listbox"
        aria-label={es ? spec.titleEs : spec.titleEn}
        onScroll={handleScroll}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <div className="v26-wheel-spacer" aria-hidden="true"/>
        {list.map((option) => {
          const selected = option.id === value;
          const scene = sceneForOption(option);
          return <button
            key={option.id}
            type="button"
            role="option"
            aria-selected={selected}
            data-option-id={option.id}
            data-selected={selected}
            onClick={() => onSelect(option)}
          >
            <span className="v26-wheel-thumb"><img src={scene.url} alt="" loading="lazy"/></span>
            <span className="v26-wheel-copy"><strong>{option.label}</strong><small>{option.short}</small></span>
            {selected && <Check size={13}/>} 
          </button>;
        })}
        <div className="v26-wheel-spacer" aria-hidden="true"/>
      </div>
    </div>
  </section>;
}

export function CinemaColumnsV26({ language, selections, onApply, onClose, embedded = false }: Props) {
  const es = language === 'es';
  const activeSummary = useMemo(() => COLUMNS.map(({ category }) => optionById(selections[category])).filter(Boolean) as DirectorOption[], [selections]);

  const body = <article className="v26-cinema-columns-card">
    <header className="v26-cinema-columns-head">
      <div>
        <span className="micro">CAMERA SETUP</span>
        <h2>{es ? 'Configura la cámara como una cámara profesional.' : 'Configure the shot like a professional camera.'}</h2>
        <p>{es ? 'Desplaza cada columna. La selección central se aplica al mismo estado que Director, Learn y el prompt.' : 'Scroll each column. The centered selection updates the same state used by Director, Learn and the prompt.'}</p>
      </div>
      {onClose && <button type="button" onClick={onClose}><X size={18}/></button>}
    </header>

    <div className="v26-cinema-columns-preview">
      <CameraSceneV26 selections={selections} label={es ? 'Vista técnica de cámara' : 'Technical camera view'}/>
    </div>

    <div className="v26-cinema-columns-scroll">
      {COLUMNS.map((spec) => <Column
        key={spec.category}
        spec={spec}
        value={selections[spec.category]}
        language={language}
        onSelect={onApply}
      />)}
    </div>

    <footer>
      {activeSummary.map((option) => <span key={option.category}><small>{option.category}</small><strong>{option.label}</strong></span>)}
    </footer>
  </article>;

  if (embedded) return <section className="v26-cinema-columns-embedded">{body}</section>;
  return <div className="v26-cinema-columns-overlay" role="dialog" aria-modal="true"><div className="v26-cinema-columns-backdrop" onClick={onClose}/>{body}</div>;
}
