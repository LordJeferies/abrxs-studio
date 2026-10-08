import { Camera, Eye, MoveHorizontal, MoveRight, SunMedium, LockKeyhole } from 'lucide-react';
import type { InfographicSpec } from './visualCatalog';

type Props = { spec: InfographicSpec };

function Label({ x, y, children, align = 'start', emphasis = false }: { x: number; y: number; children: string; align?: 'start' | 'middle' | 'end'; emphasis?: boolean }) {
  return <text x={x} y={y} textAnchor={align} className={`inf-label ${emphasis ? 'inf-label-emphasis' : ''}`}>{children}</text>;
}

function FovGraphic({ spec }: Props) {
  const value = Math.max(18, Math.min(88, spec.value ?? 50));
  const halfWidth = 12 + value * .36;
  const left = 50 - halfWidth;
  const right = 50 + halfWidth;
  const wide = value >= 60;
  const narrow = value <= 38;
  return (
    <div className="photo-infographic photo-infographic-fov">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={`fov-${value}`} x1="0" x2="0" y1="1" y2="0">
            <stop offset="0" stopColor="rgba(121,205,255,.26)" />
            <stop offset="1" stopColor="rgba(121,205,255,.02)" />
          </linearGradient>
        </defs>
        <path className="guide-cone" fill={`url(#fov-${value})`} d={`M50 90 L${left} 26 L${right} 26 Z`} />
        <circle className="camera-node" cx="50" cy="90" r="3.5" />
        <line className="guide-line" x1="50" y1="86" x2="50" y2="62" />
        <Label x={50} y={58} align="middle" emphasis>{wide ? 'CAMPO AMPLIO' : narrow ? 'CAMPO ESTRECHO' : 'CAMPO NATURAL'}</Label>
        <line className="guide-line" x1={left + 2} y1="30" x2="13" y2="18" />
        <circle className="anchor-dot" cx={left + 2} cy="30" r="1.3" />
        <Label x="10" y="15">{wide ? 'Más entorno' : narrow ? 'Menos entorno' : 'Contexto equilibrado'}</Label>
        <line className="guide-line" x1={right - 2} y1="30" x2="88" y2="18" />
        <circle className="anchor-dot" cx={right - 2} cy="30" r="1.3" />
        <Label x="91" y="15" align="end">{wide ? 'Perspectiva marcada' : narrow ? 'Fondo comprimido' : 'Profundidad natural'}</Label>
        <path className="fov-bracket" d={`M${left} 78 Q50 70 ${right} 78`} />
        <Label x="50" y="82" align="middle">{spec.label}</Label>
      </svg>
      <div className="camera-chip"><Camera size={15} /><b>{spec.label}</b></div>
    </div>
  );
}

function DepthGraphic({ spec }: Props) {
  const amount = Math.max(20, Math.min(86, spec.value ?? 50));
  const width = 12 + amount * .42;
  const left = 50 - width / 2;
  const right = 50 + width / 2;
  const shallow = amount < 40;
  return (
    <div className="photo-infographic photo-infographic-depth">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <rect className="focus-zone" x={left} y="10" width={right - left} height="68" rx="2" />
        <line className="focus-boundary" x1={left} y1="10" x2={left} y2="78" />
        <line className="focus-boundary" x1={right} y1="10" x2={right} y2="78" />
        <circle className="plane-dot plane-foreground" cx="22" cy="72" r="1.7" />
        <circle className="plane-dot plane-subject" cx="50" cy="55" r="2.1" />
        <circle className="plane-dot plane-background" cx="79" cy="36" r="1.7" />
        <Label x="18" y="80" align="middle">Primer plano</Label>
        <Label x="50" y="64" align="middle" emphasis>Sujeto</Label>
        <Label x="82" y="44" align="middle">Fondo</Label>
        <path className="focus-range" d={`M${left} 88 H${right}`} />
        <line className="focus-cap" x1={left} y1="84" x2={left} y2="92" />
        <line className="focus-cap" x1={right} y1="84" x2={right} y2="92" />
        <Label x="50" y="97" align="middle">{shallow ? 'Zona nítida muy estrecha' : 'Zona nítida más amplia'}</Label>
        <line className="guide-line" x1={right} y1="22" x2="87" y2="13" />
        <Label x="91" y="11" align="end">{shallow ? 'Fondo se disuelve' : 'Más planos legibles'}</Label>
      </svg>
      <div className="info-chip"><Eye size={14} /><span>{spec.label}</span></div>
    </div>
  );
}

function AngleGraphic({ spec }: Props) {
  const deg = spec.value ?? 0;
  const low = deg < -8;
  const overhead = deg >= 70;
  const high = deg > 8 && !overhead;
  const camX = overhead ? 50 : 18;
  const camY = low ? 79 : overhead ? 12 : high ? 20 : 50;
  const targetX = 52;
  const targetY = overhead ? 52 : 45;
  return (
    <div className="photo-infographic photo-infographic-angle">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line className="horizon-line" x1="8" y1="50" x2="92" y2="50" />
        <circle className="camera-node" cx={camX} cy={camY} r="5" />
        <path className="angle-ray" d={`M${camX + (overhead ? 0 : 5)} ${camY} L${targetX} ${targetY}`} />
        <circle className="anchor-dot" cx={targetX} cy={targetY} r="1.7" />
        <path className="angle-arc" d={low ? 'M23 79 Q34 76 39 62' : overhead ? 'M46 17 Q50 28 50 40' : high ? 'M23 21 Q33 28 38 41' : 'M23 50 Q31 50 39 50'} />
        <Label x={overhead ? 58 : 25} y={Math.max(9, camY - 9)}>{overhead ? 'Cámara cenital' : low ? 'Cámara baja' : high ? 'Cámara alta' : 'Nivel de ojos'}</Label>
        <line className="guide-line" x1={targetX} y1={targetY} x2="88" y2="28" />
        <Label x="91" y="25" align="end" emphasis>{low ? 'AUTORIDAD' : high ? 'VULNERABILIDAD' : overhead ? 'LECTURA GRÁFICA' : 'NEUTRALIDAD'}</Label>
        <Label x="50" y="94" align="middle">{spec.label}</Label>
      </svg>
      <div className="camera-icon-float"><Camera size={18} /></div>
    </div>
  );
}

function LightGraphic({ spec }: Props) {
  const d = spec.direction ?? 'left';
  const right = d === 'right';
  const back = d === 'back';
  const ambient = d === 'ambient';
  const side = right ? 88 : back ? 50 : 12;
  const sourceY = back ? 12 : 22;
  return (
    <div className={`photo-infographic photo-infographic-light light-${d}`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <circle className="light-node" cx={side} cy={sourceY} r="4.3" />
        {!ambient && <path className="light-cone" d={right ? 'M84 25 L58 36 L58 69 Z' : back ? 'M50 16 L37 44 L63 44 Z' : 'M16 25 L42 36 L42 69 Z'} />}
        <circle className="face-model" cx="50" cy="52" r="16" />
        {!ambient && <path className={`face-lit-side face-lit-${d}`} d={right ? 'M50 36 A16 16 0 0 1 50 68 Z' : back ? 'M50 36 A16 16 0 1 0 50 68 A16 16 0 1 0 50 36' : 'M50 36 A16 16 0 0 0 50 68 Z'} />}
        <line className="face-divider" x1="50" y1="36" x2="50" y2="68" />
        <line className="guide-line" x1={side} y1={sourceY} x2={right ? 72 : back ? 65 : 28} y2={back ? 17 : 17} />
        <Label x={right ? 77 : back ? 70 : 24} y="14" align={right ? 'end' : 'start'}>{ambient ? 'Fuente enorme y difusa' : back ? 'Fuente detrás del sujeto' : 'Key lateral'}</Label>
        <Label x="36" y="77" align="middle">{ambient ? 'Suave' : 'Lado iluminado'}</Label>
        <Label x="66" y="77" align="middle">{ambient ? 'Uniforme' : 'Lado en sombra'}</Label>
        <Label x="50" y="92" align="middle" emphasis>{spec.label.toUpperCase()}</Label>
      </svg>
      <div className="light-icon-float"><SunMedium size={18} /></div>
    </div>
  );
}

function FramingGraphic({ spec }: Props) {
  const v = spec.value ?? 18;
  const insetY = v < 15 ? 15 : v > 26 ? 7 : 11;
  const insetX = v < 15 ? 22 : v > 26 ? 33 : 27;
  return (
    <div className="photo-infographic photo-infographic-framing">
      <div className="thirds-grid" aria-hidden="true"><i /><i /><b /><b /></div>
      <div className="subject-frame" style={{ inset: `${insetY}% ${insetX}%` }} />
      <div className="callout callout-top">{v < 15 ? 'Entorno protagonista' : v > 26 ? 'Rostro protagonista' : 'Persona + contexto'}</div>
      <div className="framing-measure"><span>{v < 15 ? 'CUERPO + ESPACIO' : v > 26 ? 'ROSTRO' : 'TORSO'}</span><strong>{spec.label}</strong></div>
    </div>
  );
}

function MotionGraphic({ spec }: Props) {
  const d = spec.direction ?? 'static';
  const label = d === 'push' ? 'Entrar hacia el sujeto' : d === 'truck' ? 'Desplazamiento lateral' : d === 'handheld' ? 'Microvariación orgánica' : 'Sin desplazamiento';
  return (
    <div className={`photo-infographic photo-infographic-motion motion-${d}`}>
      <svg className="motion-path-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {d === 'push' && <><path className="motion-trajectory" d="M14 82 C34 74 48 62 62 44" /><circle className="motion-target" cx="64" cy="42" r="2" /></>}
        {d === 'truck' && <><path className="motion-trajectory" d="M12 80 C35 72 62 72 88 80" /><circle className="motion-target" cx="88" cy="80" r="2" /></>}
        {d === 'handheld' && <path className="motion-trajectory motion-wobble" d="M16 78 C28 65 37 82 50 68 C62 55 73 77 86 61" />}
        {d === 'static' && <><line className="motion-static-line" x1="19" y1="70" x2="19" y2="88" /><line className="motion-static-line" x1="12" y1="79" x2="26" y2="79" /></>}
      </svg>
      <div className="motion-origin"><Camera size={17} /></div>
      {d === 'static' ? <div className="motion-lock-label"><LockKeyhole size={12} /> LOCKED</div> : <div className="motion-arrow">{d === 'truck' ? <MoveHorizontal size={38} /> : <MoveRight size={38} />}</div>}
      <div className="motion-copy"><strong>{label}</strong><span>{spec.label}</span></div>
    </div>
  );
}

function GradeGraphic({ spec }: Props) {
  return (
    <div className={`photo-infographic photo-infographic-grade grade-${spec.direction ?? 'neutral'}`}>
      <div className="grade-divider" />
      <span className="grade-left">BASE</span><span className="grade-right">LOOK</span>
      <div className="grade-swatch-row"><i /><i /><i /><i /></div>
      <div className="grade-caption"><strong>{spec.label}</strong><span>Contraste · temperatura · saturación</span></div>
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
