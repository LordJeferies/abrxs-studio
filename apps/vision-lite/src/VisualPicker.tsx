import { Check, Eye, Info } from 'lucide-react';
import { GROUPS, optionFor, type Category, type DirectionState } from './engine';
import VisualInfographic from './VisualInfographic';
import { GROUP_GUIDE, visualMeta } from './visualCatalog';

type Props = {
  direction: DirectionState;
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  onSelect: (category: Category, optionId: string) => void;
};

export default function VisualPicker({ direction, activeCategory, onCategoryChange, onSelect }: Props) {
  const group = GROUPS.find(item => item.id === activeCategory)!;
  const guide = GROUP_GUIDE[activeCategory];
  const selected = optionFor(activeCategory, direction[activeCategory]);
  const selectedVisual = visualMeta(activeCategory, selected.id);

  return (
    <section className={`visual-picker visual-picker-${activeCategory}`} aria-label="Selector visual de dirección">
      <div className="visual-category-tabs" role="tablist" aria-label="Categorías visuales">
        {GROUPS.map(item => {
          const current = optionFor(item.id, direction[item.id]);
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={activeCategory === item.id}
              className={activeCategory === item.id ? 'active' : ''}
              onClick={() => onCategoryChange(item.id)}
            >
              <span>{item.label}</span>
              <small>{current.label}</small>
            </button>
          );
        })}
      </div>

      <div className="visual-picker-heading">
        <div>
          <span className="visual-kicker"><Eye size={13} /> ELIGE VIENDO EL EFECTO</span>
          <h3>{guide.question}</h3>
          <p>{guide.help}</p>
        </div>
        <div className="selected-visual-summary">
          <span>Actual</span>
          <strong>{selected.label}</strong>
          <small>{selectedVisual.cue}</small>
        </div>
      </div>

      <div className="visual-card-track">
        {group.options.map(option => {
          const meta = visualMeta(activeCategory, option.id);
          const active = direction[activeCategory] === option.id;
          return (
            <button
              key={option.id}
              className={`visual-option-card ${active ? 'active' : ''}`}
              onClick={() => onSelect(activeCategory, option.id)}
              aria-pressed={active}
            >
              <div className="visual-option-image">
                <img
                  src={meta.image}
                  alt={`Referencia visual para ${option.label}: ${meta.cue}`}
                  loading="lazy"
                  style={{ objectPosition: meta.imagePosition ?? 'center' }}
                />
                <div className="visual-option-gradient" />
                <span className="reference-badge">Foto de referencia</span>
                {active && <span className="selected-badge"><Check size={13} /> Seleccionado</span>}
                <VisualInfographic spec={meta.infographic} />
                <div className="visual-option-title">
                  <strong>{option.label}</strong>
                  <span>{option.short}</span>
                </div>
              </div>

              <div className="visual-option-copy">
                <span className="notice-label">Qué debes notar</span>
                <p>{meta.notice}</p>
                <div className="visual-cue"><span />{meta.cue}</div>
                <div className="visual-explanation">
                  <Info size={12} />
                  <span>{meta.explanation}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="visual-selected-explainer">
        <div>
          <span>Qué aporta</span>
          <p>{selected.why}</p>
        </div>
        <div>
          <span>Tradeoff</span>
          <p>{selected.tradeoff}</p>
        </div>
        <div className="visual-selected-learning">
          <span>Cómo leer la referencia</span>
          <p>{selectedVisual.explanation}</p>
        </div>
      </div>
    </section>
  );
}
