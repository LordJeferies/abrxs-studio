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
  ecu: 1.72,
  cu: 1.46,
  mcu: 1.24,
  medium: 1,
  full: .76,
  wide: .56,
  ews: .38,
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

function selectedOption(
  category: DirectorCategory,
  selections: DirectorSelections,
  override?: DirectorOption,
) {
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
  const shotScale = SHOT_SCALE[shot?.id ?? 'medium'] ?? 1;

  // Keep the subject approximately the same framing while focal length changes.
  // Moving the camera back for longer focal lengths makes foreground/background
  // magnification converge, demonstrating real perspective compression.
  const cameraDistance = clamp(4.8 * (focal / 50) / shotScale, 1.5, 18);
  const bgDistance = cameraDistance + 5.5;
  const fgDistance = Math.max(.65, cameraDistance - 1.3);
  const backgroundScale = clamp(cameraDistance / bgDistance, .28, .86);
  const foregroundScale = clamp(cameraDistance / fgDistance, 1.06, 3.2);

  const focusId = focus?.id ?? 'subject';
  const focusDistance = focusId === 'foreground'
    ? fgDistance
    : focusId === 'deep'
      ? (cameraDistance + bgDistance) / 2
      : cameraDistance;

  const dofStrength = Math.pow(focal / 50, .82) * (2.8 / aperture);
  const blurFor = (distance: number) => clamp(Math.abs(distance - focusDistance) / Math.max(.8, distance) * 13 * dofStrength, 0, 14);

  let backgroundBlur = focusId === 'deep' ? 0 : blurFor(bgDistance);
  let foregroundBlur = focusId === 'deep' ? 0 : blurFor(fgDistance);
  let subjectBlur = focusId === 'foreground' ? blurFor(cameraDistance) : 0;

  if (focusId === 'split') {
    backgroundBlur *= .25;
    foregroundBlur *= .25;
    subjectBlur = 0;
  }
  if (focusId === 'rack') {
    backgroundBlur *= .65;
    foregroundBlur *= .65;
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
    subjectY: angleId === 'overhead' ? 13 : angleId === 'high' ? 5 : angleId === 'low' || angleId === 'ground' ? -5 : 0,
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

function temperatureOverlay(id: string) {
  if (id === '3200k') return { fill: '#6f9ee8', opacity: .16 };
  if (id === '4300k') return { fill: '#b8b9df', opacity: .08 };
  if (id === '6500k') return { fill: '#f0b16c', opacity: .12 };
  if (id === 'mixed') return { fill: 'url(#mixed)', opacity: .22 };
  return { fill: '#ffffff', opacity: 0 };
}

export function CameraSceneV26({ selections, override, label, compact = false, showHud = true }: Props) {
  const uid = useId().replace(/:/g, '');
  const state = useMemo(() => buildState(selections, override), [selections, override]);
  const light = lightGradient(state.lighting);
  const temp = temperatureOverlay(state.whiteBalance);

  const subjectHeight = 170 * state.shotScale;
  const subjectWidth = subjectHeight * .42;
  const subjectY = 298 - subjectHeight + state.subjectY;
  const subjectX = 480 - subjectWidth / 2 + state.subjectX * 3.1;

  const bgW = 510 * (state.backgroundScale / .5);
  const bgH = 255 * (state.backgroundScale / .5);
  const bgX = 480 - bgW / 2;
  const bgY = state.horizon - 10;

  const fgW = 190 * Math.min(2, state.foregroundScale);
  const fgX = 120 - (fgW - 190) * .35;
  const fgY = 330 - 28 * Math.min(1.8, state.foregroundScale);

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
        <linearGradient id="mixed" x1="0" y1="0" x2="1" y2="0">
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

        {/* Perspective floor lines converge on a real vanishing point. */}
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

        {/* Foreground prop grows strongly on wide lenses because the camera is physically closer. */}
        <g filter={fgFilter} transform={`translate(${fgX} ${fgY}) scale(${Math.min(2.1, state.foregroundScale / 1.35)})`}>
          <rect x="0" y="0" width="190" height="54" rx="6" fill="#70513a"/>
          <rect x="18" y="8" width="48" height="30" rx="2" fill="#d3c6aa" transform="rotate(-5 42 23)"/>
          <rect x="73" y="10" width="48" height="30" rx="2" fill="#c3baa5" transform="rotate(2 97 25)"/>
          <rect x="128" y="7" width="48" height="30" rx="2" fill="#d8ccb6" transform="rotate(5 152 22)"/>
        </g>

        {/* Human subject: technical mannequin, not a fake photographic reference. */}
        {Array.from({ length: ghostCount }).map((_, index) => <g key={index} opacity={.16 - index * .035} transform={`translate(${motionDistance * (index + 1)} 0)`} filter={subjectFilter}>
          <ellipse cx={subjectX + subjectWidth / 2} cy={subjectY + 35} rx={subjectWidth * .26} ry="35" fill="#8f6d5c"/>
          <path d={`M${subjectX + subjectWidth*.15} ${subjectY + 65} Q${subjectX + subjectWidth*.5} ${subjectY + 44} ${subjectX + subjectWidth*.85} ${subjectY + 65} L${subjectX + subjectWidth} ${subjectY + subjectHeight} H${subjectX} Z`} fill="#30343a"/>
        </g>)}

        <g filter={subjectFilter} transform={`translate(${motionDistance} 0)`}>
          <ellipse cx={subjectX + subjectWidth / 2} cy={subjectY + 35} rx={subjectWidth * .26} ry="35" fill="#a07a66" filter={`url(#${uid}-shadow)`}/>
          <path d={`M${subjectX + subjectWidth*.15} ${subjectY + 65} Q${subjectX + subjectWidth*.5} ${subjectY + 44} ${subjectX + subjectWidth*.85} ${subjectY + 65} L${subjectX + subjectWidth} ${subjectY + subjectHeight} H${subjectX} Z`} fill="#353a42" filter={`url(#${uid}-shadow)`}/>
          <path d={`M${subjectX + subjectWidth*.30} ${subjectY + 27} Q${subjectX + subjectWidth*.5} ${subjectY + 17} ${subjectX + subjectWidth*.70} ${subjectY + 27}`} stroke="#201b19" strokeWidth="5" fill="none" strokeLinecap="round"/>
          <circle cx={subjectX + subjectWidth*.41} cy={subjectY + 37} r="2.2" fill="#171717"/>
          <circle cx={subjectX + subjectWidth*.59} cy={subjectY + 37} r="2.2" fill="#171717"/>
          <path d={`M${subjectX + subjectWidth*.43} ${subjectY + 51} Q${subjectX + subjectWidth*.5} ${subjectY + 54} ${subjectX + subjectWidth*.57} ${subjectY + 51}`} stroke="#563e35" strokeWidth="2" fill="none"/>
        </g>

        {state.composition === 'thirds' && <g stroke="#ffffff45" strokeWidth="1"><line x1="320" y1="0" x2="320" y2="540"/><line x1="640" y1="0" x2="640" y2="540"/><line x1="0" y1="180" x2="960" y2="180"/><line x1="0" y1="360" x2="960" y2="360"/></g>}
        {state.composition === 'symmetry' && <line x1="480" y1="0" x2="480" y2="540" stroke="#ffffff52" strokeDasharray="5 5"/>}
        {state.composition === 'leading' && <g stroke="#ffffff36" strokeWidth="2"><line x1="0" y1="520" x2="480" y2="210"/><line x1="960" y1="520" x2="480" y2="210"/></g>}

        <rect width="960" height="540" fill={`url(#${uid}-light)`} style={{ mixBlendMode: 'screen' }}/>
        <rect width="960" height="540" fill={temp.fill} opacity={temp.opacity} style={{ mixBlendMode: 'color' }}/>

        {state.lighting === 'noir' && <rect x="0" y="0" width="470" height="540" fill="#000" opacity=".42"/>}
        {state.lighting === 'backlight' && <ellipse cx="480" cy={subjectY + 70} rx={subjectWidth*.8} ry={subjectHeight*.62} fill="none" stroke="#ffe5ab99" strokeWidth="9" filter={`url(#${uid}-bgblur)`}/>} 
      </g>

      {showHud && <g className="v26-camera-hud">
        <rect x="18" y="18" width="330" height="36" rx="12" fill="#08090bd9" stroke="#ffffff22"/>
        <text x="34" y="41" fill="#f4f4f2" fontSize="14" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">{state.focal}mm   f/{state.aperture}   {state.shutter}°   {fpsLabel}</text>
        <rect x="18" y="66" width="208" height="27" rx="10" fill="#08090bbd" stroke="#ffffff18"/>
        <text x="31" y="84" fill="#aeb5bf" fontSize="11" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">DIST {state.cameraDistance.toFixed(1)}m · {state.focus.toUpperCase()}</text>
        <rect x="725" y="18" width="216" height="36" rx="12" fill="#08090bd9" stroke="#ffffff22"/>
        <text x="744" y="41" fill="#c8d2dc" fontSize="12" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">CAMERA VIEW · TECHNICAL</text>
      </g>}

      {state.movement !== 'static' && <g>
        <path d={state.movement === 'truck' || state.movement === 'pan' ? 'M350 500 H610' : state.movement === 'pull' ? 'M610 500 H390' : 'M390 500 H610'} stroke="#f0eee9" strokeWidth="2" strokeDasharray="8 7"/>
        <path d="M610 500 l-12 -7 v14 z" fill="#f0eee9"/>
      </g>}
    </svg>
    {!compact && <div className="v26-camera-scene-caption"><strong>{label ?? 'Camera simulation'}</strong><span>{state.focal}mm · f/{state.aperture} · distance {state.cameraDistance.toFixed(1)}m</span></div>}
  </div>;
}
