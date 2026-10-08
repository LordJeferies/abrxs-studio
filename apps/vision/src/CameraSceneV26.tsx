import { useId, useMemo } from 'react';
import {
  optionById,
  type DirectorCategory,
  type DirectorOption,
  type DirectorSelections,
} from './directorFinal';

type Props = {
  selections: DirectorSelections;
  override?: DirectorOption;
  label?: string;
  compact?: boolean;
  showHud?: boolean;
};

type SceneState = {
  focal: number;
  aperture: number;
  shotScale: number;
  cameraDistance: number;
  backgroundScale: number;
  foregroundScale: number;
  horizon: number;
  roll: number;
  subjectX: number;
  subjectY: number;
  backgroundBlur: number;
  foregroundBlur: number;
  subjectBlur: number;
  lighting: string;
  whiteBalance: string;
  movement: string;
  shutter: string;
  fps: number;
  focus: string;
  composition: string;
};

const SHOT_SCALE: Record<string, number> = {
  ecu: 2.35,
  cu: 1.92,
  mcu: 1.5,
  medium: 1.18,
  full: .86,
  wide: .62,
  ews: .42,
};

const ANGLE_HORIZON: Record<string, number> = {
  ground: 72,
  waist: 60,
  low: 58,
  eye: 47,
  high: 34,
  overhead: 18,
  dutch: 47,
  ots: 47,
};

const COMPOSITION_X: Record<string, number> = {
  thirds: -13,
  negative: -18,
  center: 0,
  symmetry: 0,
  layered: 3,
  frame: 0,
  leading: 8,
  diagonal: 10,
};

function selectedOption(category: DirectorCategory, selections: DirectorSelections, override?: DirectorOption) {
  if (override?.category === category) return override;
  return optionById(selections[category]);
}

function numberFrom(value: string | undefined, fallback: number) {
  const match = value?.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function buildState(selections: DirectorSelections, override?: DirectorOption): SceneState {
  const shot = selectedOption('shot', selections, override);
  const lens = selectedOption('lens', selections, override);
  const angle = selectedOption('angle', selections, override);
  const apertureOption = selectedOption('aperture', selections, override);
  const focus = selectedOption('focus', selections, override);
  const lighting = selectedOption('lighting', selections, override);
  const balance = selectedOption('whiteBalance', selections, override);
  const movement = selectedOption('movement', selections, override);
  const shutter = selectedOption('shutter', selections, override);
  const fps = selectedOption('frameRate', selections, override);
  const composition = selectedOption('composition', selections, override);

  const focal = lens?.id === 'macro100' ? 100 : numberFrom(lens?.label ?? lens?.id, 50);
  const aperture = numberFrom(apertureOption?.label, 2.8);
  const shotScale = SHOT_SCALE[shot?.id ?? 'medium'] ?? 1.18;

  // Keep subject size broadly stable as focal length changes by moving the virtual camera.
  // This makes wide lenses expand near/far relationships and long lenses compress them.
  const cameraDistance = clamp(5.2 * (focal / 50) / Math.max(.45, shotScale), 1.35, 22);
  const bgDistance = cameraDistance + 6.2;
  const fgDistance = Math.max(.7, cameraDistance - 1.45);
  const backgroundScale = clamp(cameraDistance / bgDistance, .26, .88);
  const foregroundScale = clamp(cameraDistance / fgDistance, 1.04, 3.45);

  const focusId = focus?.id ?? 'subject';
  const focusDistance = focusId === 'foreground'
    ? fgDistance
    : focusId === 'deep'
      ? (cameraDistance + bgDistance) / 2
      : cameraDistance;

  const dofStrength = Math.pow(focal / 50, .86) * (2.8 / Math.max(1.2, aperture));
  const blurFor = (distance: number) => clamp(Math.abs(distance - focusDistance) / Math.max(.8, distance) * 13.5 * dofStrength, 0, 15);

  let backgroundBlur = focusId === 'deep' ? 0 : blurFor(bgDistance);
  let foregroundBlur = focusId === 'deep' ? 0 : blurFor(fgDistance);
  let subjectBlur = focusId === 'foreground' ? blurFor(cameraDistance) : 0;

  if (focusId === 'split') {
    backgroundBlur *= .22;
    foregroundBlur *= .22;
    subjectBlur = 0;
  }
  if (focusId === 'rack') {
    backgroundBlur *= .62;
    foregroundBlur *= .62;
  }

  const angleId = angle?.id ?? 'eye';
  const compositionId = composition?.id ?? 'center';

  return {
    focal,
    aperture,
    shotScale,
    cameraDistance,
    backgroundScale,
    foregroundScale,
    horizon: ANGLE_HORIZON[angleId] ?? 47,
    roll: angleId === 'dutch' ? -7 : 0,
    subjectX: COMPOSITION_X[compositionId] ?? 0,
    subjectY: angleId === 'overhead' ? 16 : angleId === 'high' ? 7 : angleId === 'low' || angleId === 'ground' ? -7 : 0,
    backgroundBlur,
    foregroundBlur,
    subjectBlur,
    lighting: lighting?.id ?? 'soft-side',
    whiteBalance: balance?.id ?? '5600k',
    movement: movement?.id ?? 'static',
    shutter: shutter?.id ?? '180',
    fps: numberFrom(fps?.label ?? fps?.id, 24),
    focus: focusId,
    composition: compositionId,
  };
}

function lightGradient(id: string) {
  switch (id) {
    case 'hard-side': return { x: '85%', y: '40%', color: '#fff0cd', opacity: .7 };
    case 'window': return { x: '14%', y: '30%', color: '#e7f1ff', opacity: .56 };
    case 'backlight': return { x: '52%', y: '18%', color: '#ffe4ad', opacity: .75 };
    case 'top': return { x: '50%', y: '4%', color: '#fff0c6', opacity: .72 };
    case 'beauty': return { x: '50%', y: '38%', color: '#fff5e9', opacity: .58 };
    case 'practical': return { x: '82%', y: '45%', color: '#ffb864', opacity: .7 };
    case 'noir': return { x: '82%', y: '32%', color: '#f7ddad', opacity: .76 };
    case 'overcast': return { x: '50%', y: '20%', color: '#dfe7ef', opacity: .36 };
    case 'product-rim': return { x: '51%', y: '24%', color: '#d8ecff', opacity: .8 };
    default: return { x: '16%', y: '40%', color: '#fff1d3', opacity: .58 };
  }
}

function temperatureOverlay(id: string, mixedId: string) {
  if (id === '3200k') return { fill: '#6f9ee8', opacity: .16 };
  if (id === '4300k') return { fill: '#b8b9df', opacity: .08 };
  if (id === '6500k') return { fill: '#f0b16c', opacity: .12 };
  if (id === 'mixed') return { fill: `url(#${mixedId})`, opacity: .22 };
  return { fill: '#ffffff', opacity: 0 };
}

function HumanFigure({
  x,
  y,
  width,
  height,
  filter,
  shadowId,
  opacity = 1,
  ghost = false,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  filter?: string;
  shadowId: string;
  opacity?: number;
  ghost?: boolean;
}) {
  const sx = width / 120;
  const sy = height / 300;
  const skin = ghost ? '#8c756a' : '#a77e68';
  const skinShade = ghost ? '#705c53' : '#7b594c';
  const shirt = ghost ? '#30343b' : '#3a404a';
  const trousers = ghost ? '#242831' : '#292f39';

  return <g transform={`translate(${x} ${y}) scale(${sx} ${sy})`} opacity={opacity} filter={filter}>
    {/* Hair silhouette */}
    <path d="M43 29 Q45 8 60 6 Q79 7 82 31 L77 38 Q74 19 60 18 Q48 19 45 38 Z" fill="#201b19"/>
    {/* Ears + head */}
    <ellipse cx="39" cy="48" rx="5" ry="8" fill={skinShade}/>
    <ellipse cx="81" cy="48" rx="5" ry="8" fill={skinShade}/>
    <path d="M42 31 Q43 16 60 15 Q77 16 78 31 L76 53 Q73 72 60 76 Q47 72 44 53 Z" fill={skin}/>
    {/* Face */}
    {!ghost && <>
      <path d="M49 39 Q53 36 57 39" stroke="#2a2220" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M63 39 Q67 36 71 39" stroke="#2a2220" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <circle cx="53" cy="43" r="1.8" fill="#141414"/>
      <circle cx="67" cy="43" r="1.8" fill="#141414"/>
      <path d="M60 44 L58 54 Q60 56 63 54" stroke="#714f44" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
      <path d="M53 62 Q60 66 67 62" stroke="#553b34" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </>}
    {/* Neck */}
    <path d="M51 69 L69 69 L72 86 L48 86 Z" fill={skin}/>
    {/* Torso with recognizable shoulders and waist */}
    <path d="M47 80 Q31 84 21 99 Q27 136 31 174 L42 188 L78 188 L89 174 Q93 136 99 99 Q89 84 73 80 Q67 91 60 92 Q53 91 47 80 Z" fill={shirt}/>
    <path d="M50 84 Q60 101 70 84" stroke="#59616d" strokeWidth="3" fill="none" opacity=".8"/>
    {/* Left arm, bent naturally */}
    <path d="M27 100 Q16 112 14 133 L20 171 Q23 181 31 178 Q37 176 34 166 L31 137 L40 119 Z" fill={shirt}/>
    <path d="M20 169 Q17 185 24 194 Q30 199 35 193 Q38 188 31 177 Z" fill={skin}/>
    {/* Right arm + hand */}
    <path d="M93 100 Q104 113 106 135 L100 170 Q97 180 89 177 Q83 174 87 164 L89 137 L80 118 Z" fill={shirt}/>
    <path d="M100 168 Q104 184 97 194 Q91 199 86 193 Q83 187 90 176 Z" fill={skin}/>
    {/* Hips */}
    <path d="M42 185 L78 185 L83 207 Q72 214 60 214 Q48 214 37 207 Z" fill={trousers}/>
    {/* Legs */}
    <path d="M39 204 Q47 210 58 211 L55 265 Q54 283 43 291 L34 288 Q35 278 39 264 Z" fill={trousers}/>
    <path d="M81 204 Q73 210 62 211 L65 265 Q66 283 77 291 L86 288 Q85 278 81 264 Z" fill={trousers}/>
    {/* Shoes */}
    <path d="M34 285 Q45 283 53 289 L52 296 L31 296 Q29 291 34 285 Z" fill="#171a20"/>
    <path d="M86 285 Q75 283 67 289 L68 296 L89 296 Q91 291 86 285 Z" fill="#171a20"/>
    {/* Technical silhouette edge */}
    <path d="M43 29 Q45 8 60 6 Q79 7 82 31" stroke="#ffffff18" strokeWidth="2" fill="none"/>
    {!ghost && <path d="M21 99 Q31 84 47 80 M73 80 Q89 84 99 99 M37 207 Q48 214 60 214 Q72 214 83 207" stroke="#ffffff14" strokeWidth="2" fill="none"/>}
    {!ghost && <ellipse cx="60" cy="161" rx="38" ry="120" fill="none" stroke="#ffffff0c" strokeWidth="1" filter={`url(#${shadowId})`}/>} 
  </g>;
}

export function CameraSceneV26({ selections, override, label, compact = false, showHud = true }: Props) {
  const uid = useId().replace(/:/g, '');
  const state = useMemo(() => buildState(selections, override), [selections, override]);
  const light = lightGradient(state.lighting);
  const mixedId = `${uid}-mixed`;
  const temp = temperatureOverlay(state.whiteBalance, mixedId);

  const subjectHeight = 300 * state.shotScale;
  const subjectWidth = subjectHeight * .40;
  const subjectY = 472 - subjectHeight + state.subjectY;
  const subjectX = 480 - subjectWidth / 2 + state.subjectX * 3.1;

  const bgW = 510 * (state.backgroundScale / .5);
  const bgX = 480 - bgW / 2;
  const bgY = state.horizon - 10;

  const fgW = 190 * Math.min(2, state.foregroundScale);
  const fgX = 120 - (fgW - 190) * .35;
  const fgY = 420 - 28 * Math.min(1.8, state.foregroundScale);

  const ghostCount = state.shutter === '360' ? 3 : state.shutter === '270' ? 2 : state.shutter === '90' ? 0 : 1;
  const motionDistance = state.movement === 'static' ? 0 : state.movement === 'push' ? 18 : state.movement === 'pull' ? -18 : state.movement === 'truck' || state.movement === 'pan' ? 22 : 10;
  const fpsLabel = state.fps >= 60 ? `${state.fps} fps · high temporal detail` : `${state.fps} fps`;

  const bgFilter = `url(#${uid}-bgblur)`;
  const fgFilter = `url(#${uid}-fgblur)`;
  const subjectFilter = `url(#${uid}-subblur)`;

  return <div className={`v26-camera-scene ${compact ? 'compact' : ''}`}>
    <svg viewBox="0 0 960 540" role="img" aria-label={label ?? 'ABRAXAS optical camera simulation'}>
      <defs>
        <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#262a31"/>
          <stop offset="1" stopColor="#0d0f13"/>
        </linearGradient>
        <linearGradient id={`${uid}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f2024"/>
          <stop offset="1" stopColor="#08090b"/>
        </linearGradient>
        <radialGradient id={`${uid}-light`} cx={light.x} cy={light.y} r="62%">
          <stop offset="0" stopColor={light.color} stopOpacity={light.opacity}/>
          <stop offset=".48" stopColor={light.color} stopOpacity={light.opacity * .28}/>
          <stop offset="1" stopColor={light.color} stopOpacity="0"/>
        </radialGradient>
        <linearGradient id={mixedId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#72a7e8"/>
          <stop offset="1" stopColor="#ef9c57"/>
        </linearGradient>
        <filter id={`${uid}-bgblur`}><feGaussianBlur stdDeviation={state.backgroundBlur}/></filter>
        <filter id={`${uid}-fgblur`}><feGaussianBlur stdDeviation={state.foregroundBlur}/></filter>
        <filter id={`${uid}-subblur`}><feGaussianBlur stdDeviation={state.subjectBlur}/></filter>
        <filter id={`${uid}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="11" stdDeviation="10" floodColor="#000" floodOpacity=".55"/>
        </filter>
      </defs>

      <g transform={`rotate(${state.roll} 480 270)`}>
        <rect width="960" height="540" fill="#090a0c"/>
        <rect width="960" height={state.horizon + 190} fill={`url(#${uid}-wall)`}/>
        <path d={`M0 ${state.horizon + 145} L960 ${state.horizon + 145} L960 540 L0 540 Z`} fill={`url(#${uid}-floor)`}/>

        {[80, 190, 300, 660, 770, 880].map((x) => <line key={x} x1={x} y1="540" x2="480" y2={state.horizon + 145} stroke="#ffffff13" strokeWidth="1"/>)}
        {[385, 430, 475, 515].map((y) => <line key={y} x1="0" y1={y} x2="960" y2={y} stroke="#ffffff0d" strokeWidth="1"/>)}

        <g filter={bgFilter} transform={`translate(${bgX} ${bgY}) scale(${Math.max(.55, state.backgroundScale / .5)})`}>
          <rect x="0" y="0" width="510" height="255" rx="14" fill="#202630" stroke="#ffffff1a"/>
          <rect x="34" y="25" width="128" height="172" rx="6" fill="#6f8193" opacity=".42"/>
          <path d="M98 25V197M34 110H162" stroke="#d7e3ef44" strokeWidth="3"/>
          <rect x="330" y="55" width="122" height="142" rx="9" fill="#14181e" stroke="#ffffff16"/>
          <circle cx="391" cy="100" r="29" fill="#30404f"/>
          <path d="M350 170 Q392 120 434 170" fill="#222c35"/>
        </g>

        {state.composition === 'frame' && <path d="M90 62H870V468H90Z M160 115V420H800V115Z" fill="#090a0ccc" fillRule="evenodd"/>}

        <g filter={fgFilter} transform={`translate(${fgX} ${fgY}) scale(${Math.min(2.1, state.foregroundScale / 1.35)})`}>
          <rect x="0" y="0" width="190" height="54" rx="6" fill="#70513a"/>
          <rect x="18" y="8" width="48" height="30" rx="2" fill="#d3c6aa" transform="rotate(-5 42 23)"/>
          <rect x="73" y="10" width="48" height="30" rx="2" fill="#c3baa5" transform="rotate(2 97 25)"/>
          <rect x="128" y="7" width="48" height="30" rx="2" fill="#d8ccb6" transform="rotate(5 152 22)"/>
        </g>

        {Array.from({ length: ghostCount }).map((_, index) => <HumanFigure
          key={index}
          x={subjectX + motionDistance * (index + 1)}
          y={subjectY}
          width={subjectWidth}
          height={subjectHeight}
          filter={subjectFilter}
          shadowId={`${uid}-shadow`}
          opacity={.15 - index * .035}
          ghost
        />)}

        <HumanFigure
          x={subjectX + motionDistance}
          y={subjectY}
          width={subjectWidth}
          height={subjectHeight}
          filter={subjectFilter}
          shadowId={`${uid}-shadow`}
        />

        {state.composition === 'thirds' && <g stroke="#ffffff45" strokeWidth="1"><line x1="320" y1="0" x2="320" y2="540"/><line x1="640" y1="0" x2="640" y2="540"/><line x1="0" y1="180" x2="960" y2="180"/><line x1="0" y1="360" x2="960" y2="360"/></g>}
        {state.composition === 'symmetry' && <line x1="480" y1="0" x2="480" y2="540" stroke="#ffffff52" strokeDasharray="5 5"/>}
        {state.composition === 'leading' && <g stroke="#ffffff36" strokeWidth="2"><line x1="0" y1="520" x2="480" y2="210"/><line x1="960" y1="520" x2="480" y2="210"/></g>}

        <rect width="960" height="540" fill={`url(#${uid}-light)`} style={{ mixBlendMode: 'screen' }}/>
        <rect width="960" height="540" fill={temp.fill} opacity={temp.opacity} style={{ mixBlendMode: 'color' }}/>

        {state.lighting === 'noir' && <rect x="0" y="0" width="470" height="540" fill="#000" opacity=".42"/>}
        {state.lighting === 'backlight' && <ellipse cx="480" cy={subjectY + subjectHeight * .42} rx={subjectWidth*.72} ry={subjectHeight*.43} fill="none" stroke="#ffe5ab99" strokeWidth="9" filter={`url(#${uid}-bgblur)`}/>} 
      </g>

      {showHud && <g className="v26-camera-hud">
        <rect x="18" y="18" width="330" height="36" rx="12" fill="#08090bd9" stroke="#ffffff22"/>
        <text x="34" y="41" fill="#f4f4f2" fontSize="14" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">{state.focal}mm   f/{state.aperture}   {state.shutter}°   {fpsLabel}</text>
        <rect x="18" y="66" width="208" height="27" rx="10" fill="#08090bbd" stroke="#ffffff18"/>
        <text x="31" y="84" fill="#aeb5bf" fontSize="11" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">DIST {state.cameraDistance.toFixed(1)}m · {state.focus.toUpperCase()}</text>
        <rect x="718" y="18" width="223" height="36" rx="12" fill="#08090bd9" stroke="#ffffff22"/>
        <text x="735" y="41" fill="#c8d2dc" fontSize="12" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">CAMERA VIEW · HUMAN SIM</text>
      </g>}

      {state.movement !== 'static' && <g>
        <path d={state.movement === 'truck' || state.movement === 'pan' ? 'M350 500 H610' : state.movement === 'pull' ? 'M610 500 H390' : 'M390 500 H610'} stroke="#f0eee9" strokeWidth="2" strokeDasharray="8 7"/>
        <path d="M610 500 l-12 -7 v14 z" fill="#f0eee9"/>
      </g>}
    </svg>
    {!compact && <div className="v26-camera-scene-caption"><strong>{label ?? 'Camera simulation'}</strong><span>{state.focal}mm · f/{state.aperture} · distance {state.cameraDistance.toFixed(1)}m</span></div>}
  </div>;
}
