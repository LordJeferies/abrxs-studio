import { ANATOMY_LEGEND, type Category, type PromptSegment } from './engine';

export type AnatomyMode = 'underline' | 'highlight' | 'off';

type Props = {
  segments: PromptSegment[];
  mode: AnatomyMode;
  onModeChange: (mode: AnatomyMode) => void;
  onOpenCategory: (category: Category) => void;
};

const LABEL_TO_CATEGORY: Partial<Record<string, Category>> = {
  Composition: 'shot',
  Camera: 'lens',
  Optics: 'aperture',
  Light: 'light',
  Motion: 'movement',
  Look: 'look'
};

function categoryForSegment(segment: PromptSegment): Category | undefined {
  return LABEL_TO_CATEGORY[segment.label];
}

export default function PromptAnatomy({ segments, mode, onModeChange, onOpenCategory }: Props) {
  return (
    <>
      <div className="anatomy-toolbar">
        <div className="anatomy-mode-switch" aria-label="Modo Prompt Anatomy">
          <button className={mode === 'underline' ? 'active' : ''} onClick={() => onModeChange('underline')}>Subrayado</button>
          <button className={mode === 'highlight' ? 'active' : ''} onClick={() => onModeChange('highlight')}>Resaltado</button>
          <button className={mode === 'off' ? 'active' : ''} onClick={() => onModeChange('off')}>Off</button>
        </div>
      </div>

      <div className="anatomy-legend-strong" aria-label="Leyenda Prompt Anatomy">
        {ANATOMY_LEGEND.map(item => (
          <span key={item.type} className={`legend-strong legend-${item.type}`}>
            <i />{item.label}
          </span>
        ))}
      </div>

      <div className={`anatomy-output anatomy-mode-${mode}`}>
        {segments.map((segment, index) => {
          const category = categoryForSegment(segment);
          const interactive = Boolean(category);
          const content = (
            <span className="segment-copy">
              <span className="segment-label-inline">{segment.label}</span>
              {segment.text}{index < segments.length - 1 ? ', ' : '.'}
            </span>
          );

          if (interactive && category) {
            return (
              <button
                key={`${segment.type}-${segment.label}-${index}`}
                className={`segment segment-${segment.type} segment-button`}
                title={`${segment.label}: abrir selector visual`}
                onClick={() => onOpenCategory(category)}
              >
                {content}
              </button>
            );
          }

          return (
            <span key={`${segment.type}-${segment.label}-${index}`} className={`segment segment-${segment.type}`} title={segment.label}>
              {content}
            </span>
          );
        })}
      </div>

      <p className="anatomy-help">Pulsa cualquier segmento de cámara, óptica, luz, movimiento o look para abrir su selector visual.</p>
    </>
  );
}
