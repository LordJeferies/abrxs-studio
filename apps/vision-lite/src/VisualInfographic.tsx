import { Camera, Eye, MoveHorizontal, MoveRight, SunMedium } from 'lucide-react';
import type { InfographicSpec } from './visualCatalog';

type Props = { spec: InfographicSpec };

function Label({ x, y, children, align = 'start' }: { x: number; y: number; children: string; align?: 'start' | 'middle' | 'end' }) {
  return <text x={x} y={y} textAnchor={align} className="inf-label">{children}</text>;
}

function FovGraphic({ spec }: Props) {
  const wide = (spec.value ?? 50) >= 60;
  const narrow = (spec.value ?? 50) <= 38;
  const edge = wide ? 92 : narrow ? 68 : 80;
  return (
    <div className="photo-infographic photo-infographic-fov">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path className="guide-cone" d={`M10 88 L${100 - edge} 26 L${edge} 26 Z`} />
        <circle className="anchor-dot" cx="10" cy="88" r="1.8" />
        <line className="guide-line" x1="12" y1="86" x2="32" y2="70" />
        <Label x={34} y={69}>{wide ? 'Campo de visión más amplio' : narrow ? 'Campo de visión más estrecho' : 'Campo de visión equilibrado'}</Label>
        <line className="guide-line" x1="72" y1="30" x2="89" y2="18" />
        <circle className="anchor-dot" cx="72" cy="30" r="1.3" />
        <Label x={90} y={16} align="end">{wide ? 'Más entorno visible' : narrow ? 'Fondo más comprimido' : 'Perspectiva natural'}</Label>
      </svg>
      <div className="camera-chip"><Camera size={15} /><b>{spec.label.split('·')[0]}</b></div>
    </div>
  );
}

function DepthGraphic({ spec }: Props) {
  const amount = Math.max(20, Math.min(86, spec.value ?? 50));
  const left = 50 - amount / 4;
  const right = 50 + amount / 4;
  const shallow = amount < 40;
  return (
    <div className="photo-infographic photo-infographic-depth">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line className="focus-boundary" x1={left} y1="12" x2={left} y2="76" />
        <line className="focus-boundary" x1={right} y1="12" x2={right} y2="76" />
        <line className="guide-line" x1={left} y1="35" x2="17" y2="25" />
        <circle className="anchor-dot" cx={left} cy="35" r="1.5" />
        <Label x={15} y={23}>{shallow ? 'Fondo desenfocado' : 'Primer plano nítido'}</Label>
        <line className="guide-line" x1={right} y1="35" x2="83" y2="27" />
        <circle className="anchor-dot" cx={right} cy="35" r="1.5" />
        <Label x={85} y={25} align="end">{shallow ? 'Franja de enfoque' : 'Fondo legible'}</Label>
        <path className="focus-range" d={`M${left} 84 H${right}`} />
        <Label x={50} y={91} align="middle">{shallow ? 'Zona nítida estrecha' : 'Zona de enfoque más amplia'}</Label>
      </svg>
      <div className="info-chip"><Eye size={14} /><span>{spec.label}</span></div>
    </div>
  );
}

function AngleGraphic({ spec }: Props) {
  const deg = spec.value ?? 0;
  const low = deg < -8;
  const high = deg > 8 && deg < 70;
  const overhead = deg >= 70;
  const camY = low ? 76 : overhead ? 12 : high ? 20 : 50;
  const targetY = overhead ? 50 : 42;
  return (
    <div className="photo-infographic photo-infographic-angle">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <circle className="camera-node" cx="16" cy={camY} r="5" />
        <path className="angle-ray" d={`M21 ${camY} L56 ${targetY}`} />
        <path className="angle-arc" d={low ? 'M22 77 Q34 72 39 60' : overhead ? 'M20 17 Q31 27 34 39' : high ? 'M22 23 Q31 30 36 40' : 'M22 50 Q30 50 38 50'} />
        <Label x={24} y={Math.max(10, camY - 9)}>{overhead ? 'Cenital' : low ? 'Cámara baja' : high ? 'Cámara alta' : 'Nivel de ojos'}</Label>
        <line className="guide-line" x1="60" y1={targetY} x2="86" y2="32" />
        <circle className="anchor-dot" cx="60" cy={targetY} r="1.4" />
        <Label x={89} y={30} align="end">{low ? 'Más autoridad' : high ? 'Más vulnerabilidad' : overhead ? 'Lectura gráfica' : 'Relación neutral'}</Label>
      </svg>
      <div className="camera-icon-float"><Camera size={18} /></div>
    </div>
  );
}

function LightGraphic({ spec }: Props) {
  const d = spec.direction ?? 'left';
  const side = d === 'right' ? 86 : d === 'back' ? 50 : 14;
  const sourceY = d === 'back' ? 12 : 24;
  return (
    <div className={`photo-infographic photo-infographic-light light-${d}`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <circle className="light-node" cx={side} cy={sourceY} r="4" />
        {d !== 'ambient' && <path className="light-cone" d={d === 'right' ? 'M82 28 L58 38 L58 67 Z' : d === 'back' ? 'M50 17 L38 42 L62 42 Z' : 'M18 28 L42 38 L42 67 Z'} />}
        <line className="guide-line" x1={side} y1={sourceY} x2={d === 'right' ? 72 : d === 'back' ? 66 : 28} y2={d === 'back' ? 16 : 18} />
        <Label x={d === 'right' ? 78 : d === 'back' ? 70 : 25} y={15} align={d === 'right' ? 'end' : 'start'}>{d === 'ambient' ? 'Luz envolvente' : d === 'back' ? 'Fuente detrás' : 'Luz principal lateral'}</Label>
        <line className="face-divider" x1="50" y1="32" x2="50" y2="68" />
        <Label x={38} y={76} align="middle">{d === 'ambient' ? 'Suave' : 'Luz'}</Label>
        <Label x={64} y={76} align="middle">{d === 'ambient' ? 'Uniforme' : 'Sombra'}</Label>
      </svg>
      <div className="light-icon-float"><SunMedium size={18} /></div>
    </div>
  );
}

function FramingGraphic({ spec }: Props) {
  const v = spec.value ?? 18;
  const inset = Math.max(8, 30 - v * .7);
  return (
    <div className="photo-infographic photo-infographic-framing">
      <div className="subject-frame" style={{ inset: `${Math.max(6, inset)}% ${Math.max(10, inset * .72)}%` }} />
      <div className="callout callout-top">{v < 15 ? 'Más entorno' : v > 26 ? 'Rostro dominante' : 'Sujeto + contexto'}</div>
      <div className="callout callout-bottom">{spec.label}</div>
    </div>
  );
}

function MotionGraphic({ spec }: Props) {
  const d = spec.direction ?? 'static';
  return (
    <div className={`photo-infographic photo-infographic-motion motion-${d}`}>
      <div className="motion-origin"><Camera size={17} /></div>
      {d === 'static' ? <div className="motion-lock-label">LOCKED · sin desplazamiento</div> : <div className="motion-arrow">{d === 'truck' ? <MoveHorizontal size={42} /> : <MoveRight size={42} />}</div>}
      <div className="motion-copy">{d === 'push' ? 'La cámara entra hacia el sujeto' : d === 'truck' ? 'La cámara se desplaza lateralmente' : d === 'handheld' ? 'Microvariación orgánica' : 'Composición estable'}</div>
    </div>
  );
}

function GradeGraphic({ spec }: Props) {
  return (
    <div className={`photo-infographic photo-infographic-grade grade-${spec.direction ?? 'neutral'}`}>
      <div className="grade-divider" />
      <span className="grade-left">RAW</span><span className="grade-right">LOOK</span>
      <div className="grade-caption">{spec.label}</div>
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
  }
}
