import { Copy, HelpCircle, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';

type Props = { language: 'es' | 'en'; onCopy?: (value: string) => void };

type AnatomyKey = 'intent' | 'subject' | 'scene' | 'composition' | 'camera' | 'light' | 'material' | 'brand' | 'text' | 'motion' | 'constraints' | 'output' | 'other';

type Block = { heading: string; body: string; category: AnatomyKey };

const categoryInfo: Record<AnatomyKey, { es: string; en: string; helpEs: string; helpEn: string }> = {
  intent: { es: 'Intención', en: 'Intent', helpEs: 'Qué debe comunicar o hacer visualmente la pieza. Si desaparece esta parte, debe perderse una función real.', helpEn: 'What the visual must communicate or do. Removing it should remove a real function.' },
  subject: { es: 'Sujeto', en: 'Subject', helpEs: 'Quién u objeto domina la escena, su identidad y la acción/estado observable.', helpEn: 'Who or what dominates the scene, identity and observable action/state.' },
  scene: { es: 'Escena', en: 'Scene', helpEs: 'Lugar, tiempo, objetos y condiciones físicas del mundo.', helpEn: 'Location, time, props and physical world conditions.' },
  composition: { es: 'Composición', en: 'Composition', helpEs: 'Dónde están las cosas dentro del cuadro, jerarquía, profundidad y espacio para texto.', helpEn: 'Where elements sit in frame, hierarchy, depth and text-safe space.' },
  camera: { es: 'Cámara', en: 'Camera', helpEs: 'Plano, focal, apertura, altura y ángulo. Debe explicar un efecto visual, no sólo sonar cinematográfico.', helpEn: 'Shot size, focal length, aperture, height and angle. It should create an observable effect, not just sound cinematic.' },
  light: { es: 'Luz', en: 'Light', helpEs: 'Fuente, dirección, dureza, contraste y motivación física de la luz.', helpEn: 'Source, direction, hardness, contrast and physical motivation of light.' },
  material: { es: 'Material', en: 'Material', helpEs: 'Textura, superficie, reflejos, bordes, peso y respuesta física.', helpEn: 'Texture, surface, reflections, edges, weight and physical response.' },
  brand: { es: 'Marca', en: 'Brand', helpEs: 'Paleta, tipografía, motivos, densidad y lenguaje visual heredado del cliente.', helpEn: 'Palette, typography, motifs, density and inherited client visual language.' },
  text: { es: 'Texto', en: 'Text', helpEs: 'Texto exacto, zonas seguras y decisión de integrarlo o mantenerlo editable.', helpEn: 'Exact copy, safe zones and whether it should be generated or remain editable.' },
  motion: { es: 'Movimiento', en: 'Motion', helpEs: 'Qué cambia en el tiempo: sujeto, cámara, entorno, timing, audio y estado final.', helpEn: 'What changes over time: subject, camera, environment, timing, audio and end state.' },
  constraints: { es: 'Restricciones', en: 'Constraints', helpEs: 'Qué debe mantenerse, qué evitar y qué no puede inventarse.', helpEn: 'What must remain fixed, what to avoid and what cannot be fabricated.' },
  output: { es: 'Entrega', en: 'Output', helpEs: 'Formato, ratio, resolución, layers, archivos, QA y handoff requerido.', helpEn: 'Format, aspect, resolution, layers, files, QA and required handoff.' },
  other: { es: 'Otro', en: 'Other', helpEs: 'Bloque no reconocido automáticamente. Puedes conservarlo y editarlo.', helpEn: 'Block not recognized automatically. Keep and edit it as needed.' },
};

const headingRules: Array<[RegExp, AnatomyKey]> = [
  [/^(ROLE|ROL|PURPOSE|PROPÓSITO|OBJECTIVE|OBJETIVO|VISUAL FUNCTION|FUNCIÓN|IDEA|CONTEXT|CONTEXTO)/i, 'intent'],
  [/^(SUBJECT|SUJETO|IDENTITY|IDENTIDAD|ACTION|ACCIÓN|PERFORMANCE|ACTUACIÓN)/i, 'subject'],
  [/^(SCENE|ESCENA|ENVIRONMENT|ENTORNO|WORLD|LOCATION|LOCACIÓN|LUGAR)/i, 'scene'],
  [/^(COMPOSITION|COMPOSICIÓN|FRAMING|ENCUADRE|BLOCKING|GEOGRAPHY|GEOGRAFÍA)/i, 'composition'],
  [/^(CAMERA|CÁMARA|LENS|LENTE|FOCAL|APERTURE|APERTURA|ANGLE|ÁNGULO|SHOT)/i, 'camera'],
  [/^(LIGHT|LIGHTING|LUZ|ILUMINACIÓN)/i, 'light'],
  [/^(MATERIAL|TEXTURE|TEXTURA|PHYSICS|FÍSICA)/i, 'material'],
  [/^(BRAND|MARCA|PALETTE|PALETA|COLOR)/i, 'brand'],
  [/^(TEXT|TEXTO|TYPOGRAPHY|TIPOGRAFÍA|SAFE ZONE|ZONA)/i, 'text'],
  [/^(MOTION|MOVIMIENTO|TIMING|TIEMPO|AUDIO|SOUND|SONIDO|SFX)/i, 'motion'],
  [/^(CONSTRAINT|RESTRICTION|RESTRICCIÓN|NEGATIVE|NEGATIVO|AVOID|EVITAR|MUST NOT|NO DEBE|LOCK|BLOQUEO)/i, 'constraints'],
  [/^(OUTPUT|ENTREGA|DELIVERY|HANDOFF|QA|ACCEPTANCE|ACEPTACIÓN|FORMAT|FORMATO|CANVAS)/i, 'output'],
];

const SAMPLE = `ROL\nDirector visual ABRAXAS.\n\nOBJETIVO / FUNCIÓN VISUAL\nMostrar que un criterio organiza varias opciones equivalentes.\n\nSUJETO / ACCIÓN\nJoc mueve una tarjeta de criterio por encima de tres tarjetas de opciones.\n\nESCENA\nMesa editorial real, materiales mate, entorno sobrio.\n\nCOMPOSICIÓN\nJoc en tercio izquierdo, tarjetas en primer plano derecho y espacio negativo superior.\n\nCÁMARA\n50 mm, f/2.8, medium close-up, eye level.\n\nLUZ\nKey lateral suave motivada por ventana, fill negativo sutil.\n\nMATERIAL / TEXTURA\nPapel mate, madera real, piel natural y grano fino.\n\nMARCA / PALETA\nCarbón, marfil y vino controlado JOC.\n\nTEXTO / ZONAS SEGURAS\nNo generar body copy; dejar zona superior derecha limpia.\n\nCONTINUIDAD / RESTRICCIONES\nBloquear rostro, vestuario, objetos y dirección de luz. No inventar UI, cifras ni logos.\n\nOUTPUT / ENTREGA\n4:5, hero frame y clean plate, listo para composición.`;

function classify(heading: string): AnatomyKey {
  return headingRules.find(([pattern]) => pattern.test(heading.trim()))?.[1] ?? 'other';
}

function parsePrompt(value: string): Block[] {
  const normalized = value.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];
  const chunks = normalized.split(/\n\s*\n/).filter(Boolean);
  const blocks: Block[] = [];
  for (const chunk of chunks) {
    const lines = chunk.split('\n');
    const candidate = lines[0].trim();
    const looksLikeHeading = candidate.length < 70 && (/^[A-ZÁÉÍÓÚÜÑ0-9 /·+&→_-]+$/.test(candidate) || headingRules.some(([rule]) => rule.test(candidate)));
    if (looksLikeHeading) blocks.push({ heading: candidate, body: lines.slice(1).join('\n').trim(), category: classify(candidate) });
    else if (blocks.length) blocks[blocks.length - 1].body += `${blocks[blocks.length - 1].body ? '\n\n' : ''}${chunk}`;
    else blocks.push({ heading: 'PROMPT', body: chunk, category: 'other' });
  }
  return blocks;
}

function serialize(blocks: Block[]) {
  return blocks.map((block) => `${block.heading}\n${block.body}`.trim()).join('\n\n');
}

export function PromptAnatomy({ language, onCopy }: Props) {
  const es = language === 'es';
  const [source, setSource] = useState(SAMPLE);
  const [blocks, setBlocks] = useState<Block[]>(() => parsePrompt(SAMPLE));
  const [help, setHelp] = useState<AnatomyKey | null>(null);
  const output = useMemo(() => serialize(blocks), [blocks]);

  const reparse = () => setBlocks(parsePrompt(source));
  const update = (index: number, patch: Partial<Block>) => setBlocks((current) => current.map((block, i) => i === index ? { ...block, ...patch } : block));

  return <section className="prompt-anatomy-v2">
    <div className="anatomy-head"><div><span className="micro">PROMPT ANATOMY</span><h2>{es ? 'Ve qué hace cada parte del prompt.' : 'See what every part of the prompt does.'}</h2><p>{es ? 'Pega un prompt estructurado, sepáralo por función y edita sólo el bloque que quieras cambiar.' : 'Paste a structured prompt, split it by function and edit only the block you want to change.'}</p></div><div className="anatomy-actions"><button className="subtle-button" type="button" onClick={() => { setSource(SAMPLE); setBlocks(parsePrompt(SAMPLE)); }}><RotateCcw size={14}/>{es ? 'Ejemplo' : 'Example'}</button><button className="primary-button" type="button" onClick={() => onCopy?.(output)}><Copy size={14}/>{es ? 'Copiar prompt' : 'Copy prompt'}</button></div></div>
    <div className="anatomy-legend">{(Object.keys(categoryInfo) as AnatomyKey[]).filter((key) => key !== 'other').map((key) => <button type="button" className={`legend-chip anatomy-${key}`} key={key} onClick={() => setHelp(key)}><i/>{es ? categoryInfo[key].es : categoryInfo[key].en}</button>)}</div>
    {help && <div className={`anatomy-help anatomy-${help}`}><HelpCircle size={16}/><div><strong>{es ? categoryInfo[help].es : categoryInfo[help].en}</strong><p>{es ? categoryInfo[help].helpEs : categoryInfo[help].helpEn}</p></div><button type="button" onClick={() => setHelp(null)}>×</button></div>}
    <div className="anatomy-source"><textarea value={source} onChange={(event) => setSource(event.target.value)} placeholder={es ? 'Pega aquí un prompt…' : 'Paste a prompt here…'}/><button className="subtle-button" type="button" onClick={reparse}>{es ? 'Analizar estructura' : 'Analyze structure'}</button></div>
    <div className="anatomy-blocks">{blocks.map((block, index) => <article className={`anatomy-block anatomy-${block.category}`} key={`${block.heading}-${index}`}><div className="anatomy-block-head"><i/><input value={block.heading} onChange={(event) => update(index, { heading: event.target.value, category: classify(event.target.value) })}/><button type="button" title={es ? '¿Qué hace este bloque?' : 'What does this block do?'} onClick={() => setHelp(block.category)}><HelpCircle size={14}/></button></div><textarea value={block.body} onChange={(event) => update(index, { body: event.target.value })}/></article>)}</div>
  </section>;
}
