import { Copy, GripHorizontal, Maximize2, Minimize2, PanelBottom, PanelRight, X } from 'lucide-react';
import { useMemo, useRef, useState, type PointerEvent } from 'react';
import type { PromptAnatomySegment } from './promptAnatomyV25';
import { anatomyGroup } from './v26Core';

type Props = {
  language: 'es' | 'en';
  prompt: string;
  segments: PromptAnatomySegment[];
  open: boolean;
  onClose: () => void;
};

type Dock = 'floating' | 'right' | 'bottom';

const COLORS: Record<string, string> = {
  intent:'#c49aee', subject:'#75d7e7', action:'#f0a66d', scene:'#70c9b4', shot:'#8bb6ff', camera:'#8bb6ff',
  angle:'#8bb6ff', lens:'#8ed29a', aperture:'#8ed29a', focus:'#8ed29a', shutter:'#7bbbd5', frameRate:'#7bbbd5',
  whiteBalance:'#efc36f', lighting:'#efc36f', composition:'#80a9ef', movement:'#ee9b64', subjectMotion:'#ee9b64',
  environmentMotion:'#d59e72', look:'#d79cd0', atmosphere:'#78b8b0', material:'#c5a27a', fx:'#e48b9c', output:'#aab4c5',
  continuity:'#b9a6db', constraints:'#e58f8f', text:'#df9fcf',
};

const LEGEND = [
  ['intent', 'Idea / intención'],
  ['subject', 'Sujeto'],
  ['action', 'Acción'],
  ['scene', 'Escena'],
  ['camera', 'Cámara / plano / ángulo'],
  ['lens', 'Lente / apertura / foco'],
  ['lighting', 'Luz / balance'],
  ['composition', 'Composición'],
  ['movement', 'Movimiento'],
  ['look', 'Look / material / FX'],
  ['continuity', 'Continuidad'],
  ['constraints', 'Restricciones'],
  ['output', 'Output'],
] as const;

export function PromptMonitorV26({ language, prompt, segments, open, onClose }: Props) {
  const es = language === 'es';
  const [dock, setDock] = useState<Dock>('floating');
  const [minimized, setMinimized] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [position, setPosition] = useState({ x: 92, y: 96 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const anatomy = useMemo(() => segments.map((segment, index) => (
    <span
      key={`${index}-${segment.category}`}
      className="v26-prompt-token"
      style={{ textDecorationColor: COLORS[segment.category] ?? '#808894' }}
      title={anatomyGroup(segment.category)}
    >{segment.text}</span>
  )), [segments]);

  if (!open) return null;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (dock !== 'floating') return;
    const target = event.target as HTMLElement;
    if (target.closest('button')) return;
    drag.current = { x: event.clientX, y: event.clientY, px: position.x, py: position.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || dock !== 'floating') return;
    const nextX = Math.max(12, Math.min(window.innerWidth - 360, drag.current.px + event.clientX - drag.current.x));
    const nextY = Math.max(66, Math.min(window.innerHeight - 160, drag.current.py + event.clientY - drag.current.y));
    setPosition({ x: nextX, y: nextY });
  };

  const onPointerUp = () => { drag.current = null; };

  return <section
    className={`v26-prompt-monitor dock-${dock} ${minimized ? 'minimized' : ''}`}
    style={dock === 'floating' ? { left: position.x, top: position.y } : undefined}
  >
    <header
      className="v26-prompt-monitor-head"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="v26-prompt-drag"><GripHorizontal size={16}/><span><small>LIVE PROMPT</small><strong>{es ? 'Prompt Monitor' : 'Prompt Monitor'}</strong></span></div>
      <nav>
        <button type="button" onClick={() => navigator.clipboard.writeText(prompt)} title={es ? 'Copiar prompt' : 'Copy prompt'}><Copy size={14}/></button>
        <button type="button" onClick={() => setDock(dock === 'right' ? 'floating' : 'right')} title={es ? 'Acoplar a la derecha' : 'Dock right'}><PanelRight size={14}/></button>
        <button type="button" onClick={() => setDock(dock === 'bottom' ? 'floating' : 'bottom')} title={es ? 'Acoplar abajo' : 'Dock bottom'}><PanelBottom size={14}/></button>
        <button type="button" onClick={() => setMinimized((value) => !value)} title={minimized ? (es ? 'Expandir' : 'Expand') : (es ? 'Minimizar' : 'Minimize')}>{minimized ? <Maximize2 size={14}/> : <Minimize2 size={14}/>}</button>
        <button type="button" onClick={onClose} title={es ? 'Cerrar' : 'Close'}><X size={15}/></button>
      </nav>
    </header>

    {!minimized && <>
      <div className="v26-prompt-monitor-toolbar">
        <span>{es ? 'Se actualiza mientras diriges.' : 'Updates while you direct.'}</span>
        <button type="button" className={showLegend ? 'active' : ''} onClick={() => setShowLegend((value) => !value)}>{es ? 'Leyenda' : 'Legend'}</button>
      </div>

      <div className="v26-prompt-monitor-body">
        <div className="v26-prompt-monitor-text">{anatomy}</div>
      </div>

      {showLegend && <footer className="v26-prompt-monitor-legend">
        {LEGEND.map(([category, label]) => <span key={category}><i style={{ background: COLORS[category] ?? '#808894' }}/>{label}</span>)}
      </footer>}
    </>}
  </section>;
}
