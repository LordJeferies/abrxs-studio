import { Camera, Focus, LockKeyhole, MoveHorizontal, MoveRight, Sparkles, SunMedium } from 'lucide-react';
import type { InfographicSpec } from './visualCatalog';

type Props = {
  spec: InfographicSpec;
};

function FramingGraphic({ spec }: Props) {
  const inset = Math.max(6, Math.min(28, 30 - (spec.value ?? 16)));
  return (
    <div className="mini-graphic mini-framing" style={{ '--frame-inset': `${inset}%` } as React.CSSProperties}>
      <div className="frame-box"><i /><i /><i /><i /></div>
      <div className="frame-caption"><Camera size={12} /> {spec.label}</div>
    </div>
  );
}

function FovGraphic({ spec }: Props) {
  const spread = Math.max(20, Math.min(84, spec.value ?? 50));
  const left = 50 - spread / 2;
  const right = 50 + spread / 2;
  return (
    <div className="mini-graphic mini-fov">
      <svg viewBox="0 0 100 52" preserveAspectRatio="none" aria-hidden="true">
        <path className="fov-cone" d={`M50 50 L${left} 5 L${right} 5 Z`} />
        <line className="fov-center" x1="50" y1="50" x2="50" y2="5" />
      </svg>
      <div className="fov-camera"><Camera size={13} /></div>
      <div className="graphic-badge">{spec.label}</div>
    </div>
  );
}

function DepthGraphic({ spec }: Props) {
  const focusWidth = Math.max(18, Math.min(84, spec.value ?? 42));
  return (
    <div className="mini-graphic mini-depth" style={{ '--focus-width': `${focusWidth}%` } as React.CSSProperties}>
      <div className="depth-plane near">1</div>
      <div className="depth-plane subject"><Focus size={12} /> sujeto</div>
      <div className="depth-plane far">3</div>
      <div className="focus-band" />
      <div className="graphic-badge">{spec.label}</div>
    </div>
  );
}

function AngleGraphic({ spec }: Props) {
  const rotate = spec.value ?? 0;
  return (
    <div className="mini-graphic mini-angle">
      <div className="angle-horizon" />
      <div className="angle-camera" style={{ transform: `rotate(${rotate}deg)` }}><Camera size={15} /></div>
      <div className="angle-ray" style={{ transform: `rotate(${rotate}deg)` }} />
      <div className="graphic-badge">{spec.label}</div>
    </div>
  );
}

function LightGraphic({ spec }: Props) {
  return (
    <div className={`mini-graphic mini-light light-${spec.direction ?? 'left'}`}>
      <div className="light-source"><SunMedium size={14} /></div>
      <div className="light-beam" />
      <div className="light-face"><span /></div>
      <div className="graphic-badge">{spec.label}</div>
    </div>
  );
}

function MotionGraphic({ spec }: Props) {
  const motion = spec.direction ?? 'static';
  return (
    <div className={`mini-graphic mini-motion motion-${motion}`}>
      <div className="motion-grid"><i /><i /><i /></div>
      <div className="motion-camera"><Camera size={15} /></div>
      {motion === 'static' ? (
        <div className="motion-lock"><LockKeyhole size={12} /> fijo</div>
      ) : motion === 'truck' ? (
        <div className="motion-path horizontal"><MoveHorizontal size={28} /></div>
      ) : motion === 'handheld' ? (
        <div className="motion-path handheld"><Sparkles size={22} /></div>
      ) : (
        <div className="motion-path push"><MoveRight size={27} /></div>
      )}
      <div className="graphic-badge">{spec.label}</div>
    </div>
  );
}

function GradeGraphic({ spec }: Props) {
  return (
    <div className={`mini-graphic mini-grade grade-${spec.direction ?? 'neutral'}`}>
      <div className="grade-before">RAW</div>
      <div className="grade-after">LOOK</div>
      <div className="grade-wipe" />
      <div className="graphic-badge">{spec.label}</div>
    </div>
  );
}

export default function VisualInfographic({ spec }: Props) {
  switch (spec.kind) {
    case 'framing': return <FramingGraphic spec={spec} />;
    case 'fov': return <FovGraphic spec={spec} />;
    case 'depth': return <DepthGraphic spec={spec} />;
    case 'angle': return <AngleGraphic spec={spec} />;
    case 'light': return <LightGraphic spec={spec} />;
    case 'motion': return <MotionGraphic spec={spec} />;
    case 'grade': return <GradeGraphic spec={spec} />;
    default: return <div className="mini-graphic"><MoveRight size={18} /></div>;
  }
}
