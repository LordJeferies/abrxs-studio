import { useEffect, useMemo, useState } from 'react';
import { Check, Eye, Info, ImageOff, ShieldCheck } from 'lucide-react';
import { GROUPS, optionFor, type Category, type DirectionState } from './engine';
import VisualInfographic from './VisualInfographic';
import { GROUP_GUIDE } from './visualCatalog';
import { REFERENCE_FALLBACK, referenceFor, validateReferenceCatalog, warmReferenceCache } from './referenceRuntime';

type Props = {
  direction: DirectionState;
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  onSelect: (category: Category, optionId: string) => void;
};

function ReferenceImage({ src, alt, position, duplicateForSubject = false }: { src: string; alt: string; position?: string; duplicateForSubject?: boolean }) {
  const [failed, setFailed] = useState(false);
  const actualSrc = failed ? REFERENCE_FALLBACK : src;
  const style = { objectPosition: position ?? 'center' };

  return (
    <>
      <img
        className={`visual-photo-base ${failed ? 'reference-failed' : ''}`}
        src={actualSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={style}
        onError={() => setFailed(true)}
      />
      {duplicateForSubject && (
        <img
          className="visual-photo-subject"
          src={actualSrc}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          style={style}
        />
      )}
      {failed && <span className="reference-error-badge"><ImageOff size={12} /> Fallback seguro</span>}
    </>
  );
}

export default function VisualPicker({ direction, activeCategory, onCategoryChange, onSelect }: Props) {
  const group = GROUPS.find(item => item.id === activeCategory)!;
  const guide = GROUP_GUIDE[activeCategory];
  const selected = optionFor(activeCategory, direction[activeCategory]);
  const selectedVisual = referenceFor(activeCategory, selected.id);
  const report = useMemo(() => validateReferenceCatalog(), []);

  useEffect(() => {
    warmReferenceCache(activeCategory, selected.id);
  }, [activeCategory, selected.id]);

  return (
    <section className={`visual-picker visual-picker-${activeCategory}`} aria-label="Selector visual de dirección">
      <div className="visual-category-tabs" role="tablist" aria-label="Categorías visuales">
        {GROUPS.map(item => {
          const current = optionFor(item.id, direction[item.id]);
          return (
            <button key={item.id} role="tab" aria-selected={activeCategory === item.id} className={activeCategory === item.id ? 'active' : ''} onClick={() => onCategoryChange(item.id)}>
              <span>{item.label}</span><small>{current.label}</small>
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
          <span>Actual</span><strong>{selected.label}</strong><small>{selectedVisual.cue}</small>
          <em className={report.issues.length ? 'catalog-warning' : 'catalog-ok'}><ShieldCheck size={11} /> {report.uniqueImages}/{report.totalOptions} referencias únicas</em>
        </div>
      </div>

      <div className="visual-card-track">
        {group.options.map(option => {
          const meta = referenceFor(activeCategory, option.id);
          const active = direction[activeCategory] === option.id;
          return (
            <button key={option.id} className={`visual-option-card visual-option-${activeCategory} ${active ? 'active' : ''}`} data-option={option.id} onClick={() => onSelect(activeCategory, option.id)} aria-pressed={active}>
              <div className="visual-option-image" data-category={activeCategory} data-option={option.id}>
                <div className="reference-skeleton" aria-hidden="true" />
                <ReferenceImage src={meta.image} alt={`Referencia visual para ${option.label}: ${meta.cue}`} position={meta.imagePosition} duplicateForSubject={activeCategory === 'aperture'} />
                <div className="visual-option-gradient" />
                <span className="reference-badge">Referencia + explicación técnica</span>
                {active && <span className="selected-badge"><Check size={13} /> Seleccionado</span>}
                <VisualInfographic spec={meta.infographic} />
              </div>

              <div className="visual-card-footer">
                <div><strong>{option.label}</strong><span>{option.short}</span></div>
                <small>{meta.cue}</small>
              </div>

              <div className="visual-option-copy">
                <span className="notice-label">Qué debes notar</span>
                <p>{meta.notice}</p>
                <div className="visual-explanation"><Info size={12} /><span>{meta.explanation}</span></div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="visual-selected-explainer">
        <div><span>Qué aporta</span><p>{selected.why}</p></div>
        <div><span>Tradeoff</span><p>{selected.tradeoff}</p></div>
        <div className="visual-selected-learning"><span>Cómo leer la referencia</span><p>{selectedVisual.explanation}</p></div>
      </div>
    </section>
  );
}
