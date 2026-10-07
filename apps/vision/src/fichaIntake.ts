export type FichaSourceType = 'html' | 'json' | 'txt';

export type FichaPromptKind =
  | 'part-override'
  | 'asset-override'
  | 'asset-prompt'
  | 'asset-prompt-no-text'
  | 'asset-prompt-with-text'
  | 'cover-prompt'
  | 'carousel-prompt'
  | 'composition-prompt'
  | 'generic-prompt'
  | 'text-prompt';

export type FichaPromptSlot = {
  id: string;
  label: string;
  breadcrumb: string;
  path: Array<string | number>;
  kind: FichaPromptKind;
  prompt: string;
  context: {
    title?: string;
    thesis?: string;
    objective?: string;
    role?: string;
    visual?: string;
    composition?: string;
    continuity?: string;
    purpose?: string;
    description?: string;
    visualSystem?: string;
  };
  textRange?: { start: number; end: number };
};

export type FichaDocument = {
  filename: string;
  sourceType: FichaSourceType;
  schema: string;
  scriptId?: string;
  rawSource: string;
  data?: unknown;
  slots: FichaPromptSlot[];
  pieceCount: number;
  warnings: string[];
};

export type FichaPromptPatch = {
  slotId: string;
  before: string;
  after: string;
};

const PROMPT_KEYS = new Set([
  'prompt',
  'prompt_override',
  'promptNoText',
  'promptWithText',
  'compositionPrompt',
]);

function sourceTypeFromName(name: string): FichaSourceType {
  const lower = name.toLowerCase();
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'html';
  if (lower.endsWith('.json')) return 'json';
  return 'txt';
}

function promptKind(path: Array<string | number>, key: string): FichaPromptKind {
  const joined = path.join('.').toLowerCase();
  if (key === 'prompt_override' && joined.includes('.assets.')) return 'asset-override';
  if (key === 'prompt_override') return 'part-override';
  if (key === 'promptNoText') return 'asset-prompt-no-text';
  if (key === 'promptWithText') return 'asset-prompt-with-text';
  if (key === 'compositionPrompt') return 'composition-prompt';
  if (joined.includes('.cover.')) return 'cover-prompt';
  if (joined.includes('.slides.') || joined.includes('.staticproduction.')) return 'carousel-prompt';
  if (joined.includes('.assets.')) return 'asset-prompt';
  return 'generic-prompt';
}

function textValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function summarizeContinuity(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return textValue(value);
  if (typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  return ['receives', 'adds', 'opens', 'locked', 'continuity']
    .map((key) => textValue(record[key]))
    .filter(Boolean)
    .join(' · ') || undefined;
}

function nearestContext(root: unknown, path: Array<string | number>) {
  const objects: Record<string, unknown>[] = [];
  let cursor: unknown = root;
  if (cursor && typeof cursor === 'object' && !Array.isArray(cursor)) objects.push(cursor as Record<string, unknown>);
  for (const segment of path.slice(0, -1)) {
    if (cursor == null || typeof cursor !== 'object') break;
    cursor = (cursor as Record<string | number, unknown>)[segment];
    if (cursor && typeof cursor === 'object' && !Array.isArray(cursor)) objects.push(cursor as Record<string, unknown>);
  }
  const pick = (...keys: string[]) => {
    for (let i = objects.length - 1; i >= 0; i -= 1) {
      for (const key of keys) {
        const value = textValue(objects[i][key]);
        if (value) return value;
      }
    }
    return undefined;
  };
  let continuity: string | undefined;
  for (let i = objects.length - 1; i >= 0; i -= 1) {
    continuity = summarizeContinuity(objects[i].continuity);
    if (continuity) break;
  }
  return {
    title: pick('title', 'headline', 'label'),
    thesis: pick('thesis'),
    objective: pick('objective', 'standard_requirement', 'intention'),
    role: pick('role', 'function', 'category', 'family', 'xrFamily'),
    visual: pick('visual', 'shortDescription'),
    composition: pick('composition', 'layout', 'layoutGuide'),
    continuity,
    purpose: pick('purpose', 'visual_function', 'function'),
    description: pick('description', 'shortDescription'),
    visualSystem: pick('visual_system'),
  };
}

function pathLabel(path: Array<string | number>, context: ReturnType<typeof nearestContext>) {
  const idPart = path
    .filter((part) => typeof part === 'string')
    .slice(-4, -1)
    .join(' › ');
  return context.title || context.description || context.role || idPart || 'Prompt';
}

function scanPromptSlots(root: unknown): FichaPromptSlot[] {
  const slots: FichaPromptSlot[] = [];
  const visit = (value: unknown, path: Array<string | number>) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, [...path, index]));
      return;
    }
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      const childPath = [...path, key];
      if (PROMPT_KEYS.has(key) && typeof child === 'string') {
        const context = nearestContext(root, childPath);
        slots.push({
          id: childPath.map(String).join('/'),
          label: pathLabel(childPath, context),
          breadcrumb: childPath.map(String).join(' › '),
          path: childPath,
          kind: promptKind(childPath, key),
          prompt: child,
          context,
        });
      }
      if (typeof child === 'object' && child !== null) visit(child, childPath);
    }
  };
  visit(root, []);
  return slots;
}

function findJsonScript(html: string): { id: string; json: string; start: number; end: number } | null {
  const tag = /<script\b([^>]*\btype=["']application\/json["'][^>]*)>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = tag.exec(html))) {
    const attrs = match[1];
    const json = match[2].trim();
    const idMatch = attrs.match(/\bid=["']([^"']+)["']/i);
    if (!json.startsWith('{') && !json.startsWith('[')) continue;
    try {
      const parsed = JSON.parse(json) as Record<string, unknown>;
      if (!parsed || typeof parsed !== 'object') continue;
      if (!('pieces' in parsed) && !('schema' in parsed) && !('schemaVersion' in parsed) && !('projectId' in parsed)) continue;
      const full = match[0];
      const innerOffset = full.indexOf(match[2]);
      return {
        id: idMatch?.[1] || 'application-json',
        json,
        start: match.index + innerOffset,
        end: match.index + innerOffset + match[2].length,
      };
    } catch {
      // keep looking for another JSON script
    }
  }
  return null;
}

function txtPromptSlots(text: string): FichaPromptSlot[] {
  const slots: FichaPromptSlot[] = [];
  const regex = /(^|\n)(PROMPT(?:\s+DE\s+[^:\n]+|\s+VISUAL|\s+ACTUAL|\s+DE\s+IMAGEN)?\s*:\s*)([\s\S]*?)(?=\n[A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ0-9 _/·.-]{2,}\s*:\s*|\n={5,}|$)/gim;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = regex.exec(text))) {
    const prompt = match[3].trim();
    if (!prompt) continue;
    const promptStart = match.index + match[1].length + match[2].length + match[3].indexOf(prompt);
    slots.push({
      id: `text-prompt/${index}`,
      label: `${match[2].replace(/[:\s]+$/g, '').trim()} ${index + 1}`,
      breadcrumb: `TXT › ${index + 1}`,
      path: ['text', index],
      kind: 'text-prompt',
      prompt,
      context: {},
      textRange: { start: promptStart, end: promptStart + prompt.length },
    });
    index += 1;
  }
  return slots;
}

function pieceCount(data: unknown): number {
  if (!data || typeof data !== 'object') return 0;
  const record = data as Record<string, unknown>;
  return Array.isArray(record.pieces) ? record.pieces.length : 0;
}

function schemaOf(data: unknown): string {
  if (!data || typeof data !== 'object') return 'unknown';
  const record = data as Record<string, unknown>;
  return String(record.schemaVersion ?? record.schema ?? record.documentType ?? 'unknown');
}

export function parseFichaDocument(filename: string, source: string): FichaDocument {
  const sourceType = sourceTypeFromName(filename);
  const warnings: string[] = [];
  if (sourceType === 'txt') {
    const slots = txtPromptSlots(source);
    if (!slots.length) warnings.push('No se detectaron bloques PROMPT: editables de forma segura en este TXT.');
    return { filename, sourceType, schema: 'abrxs-ficha-txt', rawSource: source, slots, pieceCount: 0, warnings };
  }

  let data: unknown;
  let scriptId: string | undefined;
  if (sourceType === 'json') {
    data = JSON.parse(source);
  } else {
    const script = findJsonScript(source);
    if (!script) throw new Error('No se encontró un bloque application/json compatible dentro del HTML.');
    data = JSON.parse(script.json);
    scriptId = script.id;
  }
  const slots = scanPromptSlots(data);
  if (!slots.length) warnings.push('La ficha es válida, pero no contiene campos de prompt reconocidos.');
  return {
    filename,
    sourceType,
    schema: schemaOf(data),
    scriptId,
    rawSource: source,
    data,
    slots,
    pieceCount: pieceCount(data),
    warnings,
  };
}

function setAtPath(root: unknown, path: Array<string | number>, value: string) {
  let cursor = root as Record<string | number, unknown>;
  for (const segment of path.slice(0, -1)) {
    cursor = cursor[segment] as Record<string | number, unknown>;
  }
  cursor[path[path.length - 1]] = value;
}

function escapeScriptJson(json: string) {
  return json.replace(/<\//g, '<\\/');
}

export function applyFichaPatches(document: FichaDocument, patches: FichaPromptPatch[]): string {
  const byId = new Map(patches.map((patch) => [patch.slotId, patch]));
  if (document.sourceType === 'txt') {
    const replacements = document.slots
      .filter((slot) => slot.textRange && byId.has(slot.id))
      .map((slot) => ({ ...slot.textRange!, value: byId.get(slot.id)!.after }))
      .sort((a, b) => b.start - a.start);
    let output = document.rawSource;
    for (const replacement of replacements) output = output.slice(0, replacement.start) + replacement.value + output.slice(replacement.end);
    return output;
  }
  if (!document.data) throw new Error('La ficha no contiene datos estructurados.');
  const cloned = structuredClone(document.data);
  for (const slot of document.slots) {
    const patch = byId.get(slot.id);
    if (!patch) continue;
    if (slot.prompt !== patch.before) throw new Error(`El prompt ${slot.label} cambió desde que se preparó el patch.`);
    setAtPath(cloned, slot.path, patch.after);
  }
  const serialized = JSON.stringify(cloned, null, document.sourceType === 'json' ? 2 : 0);
  if (document.sourceType === 'json') return serialized;

  const scriptId = document.scriptId;
  const scriptPattern = scriptId
    ? new RegExp(`(<script\\b[^>]*\\bid=["']${scriptId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>)([\\s\\S]*?)(<\\/script>)`, 'i')
    : /(<script\b[^>]*\btype=["']application\/json["'][^>]*>)([\s\S]*?)(<\/script>)/i;
  if (!scriptPattern.test(document.rawSource)) throw new Error('No se pudo localizar nuevamente el bloque JSON original dentro del HTML.');
  return document.rawSource.replace(scriptPattern, (_full, open, _old, close) => `${open}${escapeScriptJson(serialized)}${close}`);
}

function line(label: string, value?: string) {
  return value ? `${label}: ${value}` : '';
}

export function improveFichaPrompt(slot: FichaPromptSlot, options?: { language?: 'es' | 'en'; keepOriginal?: boolean }) {
  const es = (options?.language ?? 'es') === 'es';
  const c = slot.context;
  const original = slot.prompt.trim();
  const alreadyStructured = /\b(ROL|ROLE|OBJETIVO|OBJECTIVE|PROPÓSITO|PURPOSE|CÁMARA|CAMERA|LUZ|LIGHT|RESTRICCIONES|CONSTRAINTS|OUTPUT|ENTREGA)\b/i.test(original);
  const role = es ? 'Director visual y de arte ABRAXAS. Ejecuta una especificación de producción, no una imagen decorativa.' : 'ABRAXAS visual and art director. Execute a production specification, not decorative imagery.';
  const purpose = c.purpose || c.objective || c.thesis || (es ? 'Hacer visible la función narrativa indicada por la ficha.' : 'Make the narrative function in the ficha visible.');
  const scene = c.description || c.visual || c.visualSystem || (es ? 'Conservar la escena y los hechos definidos por la ficha; no inventar evidencia.' : 'Preserve the scene and facts defined by the ficha; do not invent evidence.');
  const composition = c.composition || (es ? 'Una jerarquía visual dominante, espacio de lectura útil y composición coherente con el formato.' : 'One dominant visual hierarchy, usable reading space and format-aware composition.');
  const continuity = c.continuity || (es ? 'Mantener identidad, objetos, geografía, paleta, perspectiva y dirección de luz entre assets relacionados.' : 'Preserve identity, props, geography, palette, perspective and light direction across related assets.');

  const sections = es ? [
    'ROL', 'OBJETIVO / FUNCIÓN VISUAL', 'CONTEXTO DE FICHA', 'SUJETO / OBJETO', 'ESCENA', 'COMPOSICIÓN', 'CÁMARA', 'LUZ', 'MATERIAL / TEXTURA', 'MARCA / PALETA', 'TEXTO / ZONAS SEGURAS', 'CONTINUIDAD', 'RESTRICCIONES', 'OUTPUT / ENTREGA', 'QA',
  ] : [
    'ROLE', 'OBJECTIVE / VISUAL FUNCTION', 'FICHA CONTEXT', 'SUBJECT / OBJECT', 'SCENE', 'COMPOSITION', 'CAMERA', 'LIGHT', 'MATERIAL / TEXTURE', 'BRAND / PALETTE', 'TEXT / SAFE ZONES', 'CONTINUITY', 'CONSTRAINTS', 'OUTPUT / DELIVERY', 'QA',
  ];

  if (alreadyStructured) {
    const tail = es
      ? `\n\n# VISION V2 · QA / HANDOFF\nFUNCIÓN VISUAL: ${purpose}\nCONTINUIDAD: ${continuity}\nREGLA: conservar hechos, texto exacto, IDs y restricciones de la ficha. Si falta un dato de cámara/luz, usar una decisión físicamente plausible y marcarla como dirección visual, nunca como evidencia factual.\nQA: una idea dominante; acción/estado observable; geometría y anatomía coherentes; sin AI-slop; output utilizable por Dresser.`
      : `\n\n# VISION V2 · QA / HANDOFF\nVISUAL FUNCTION: ${purpose}\nCONTINUITY: ${continuity}\nRULE: preserve ficha facts, exact text, IDs and constraints. If camera/light data is missing, use a physically plausible visual direction and never present it as factual evidence.\nQA: one dominant idea; observable action/state; coherent geometry/anatomy; no AI slop; Dresser-ready output.`;
    return `${original}${tail}`;
  }

  const values = [
    role,
    purpose,
    [c.title, c.thesis, c.objective, c.role].filter(Boolean).join(' · ') || (es ? 'Usar la ficha importada como fuente de verdad.' : 'Use the imported ficha as source of truth.'),
    c.description || c.visual || (es ? 'Identificar el sujeto u objeto principal desde la ficha; no inventar uno si no existe.' : 'Resolve the primary subject/object from the ficha; do not invent one if absent.'),
    scene,
    composition,
    es ? 'Elegir focal, altura y movimiento por función. Evitar lenguaje vacío como “cinemático” sin una decisión observable.' : 'Choose focal length, height and movement by function. Avoid empty “cinematic” language without an observable decision.',
    es ? 'Luz motivada y físicamente plausible; declarar fuente, dirección, dureza y contraste cuando la ficha lo permita.' : 'Motivated, physically plausible light; state source, direction, hardness and contrast when the ficha supports it.',
    es ? 'Materiales reales, bordes, superficies y respuesta de luz coherentes. Evitar brillo plástico de IA.' : 'Real materials, edges, surfaces and coherent light response. Avoid synthetic AI gloss.',
    c.visualSystem || (es ? 'Heredar Brand Vision / preset del proyecto.' : 'Inherit Brand Vision / project preset.'),
    es ? 'Preservar áreas seguras. Texto exacto sólo cuando la ficha lo exija; preferir capa editable si la fidelidad tipográfica es crítica.' : 'Preserve safe areas. Exact text only when required; prefer editable typography layers when spelling fidelity matters.',
    continuity,
    es ? 'No inventar marcas, cifras, resultados, testimonios, interfaces propietarias ni evidencia. Sin collage si la ficha pide assets independientes.' : 'Do not invent brands, figures, outcomes, testimonials, proprietary UI or evidence. No collage when the ficha requests separate assets.',
    es ? 'Entregar el asset solicitado en el formato/ID de la ficha; limpio, versionable y apto para composición posterior.' : 'Deliver the requested asset using the ficha format/ID; clean, versionable and ready for downstream compositing.',
    es ? 'Comprobar función visual, fidelidad a la ficha, continuidad, legibilidad, anatomía/geometría, ausencia de elementos inventados y preparación para el siguiente paso.' : 'Check visual function, ficha fidelity, continuity, readability, anatomy/geometry, absence of invented elements and downstream readiness.',
  ];
  const body = sections.map((section, index) => `${section}\n${values[index]}`).join('\n\n');
  return options?.keepOriginal === false ? body : `${body}\n\n${es ? 'PROMPT ORIGINAL / INTENCIÓN HEREDADA' : 'ORIGINAL PROMPT / INHERITED INTENT'}\n${original}`;
}

export function fichaSummary(document: FichaDocument) {
  const byKind = document.slots.reduce<Record<string, number>>((acc, slot) => {
    acc[slot.kind] = (acc[slot.kind] ?? 0) + 1;
    return acc;
  }, {});
  return { schema: document.schema, pieces: document.pieceCount, prompts: document.slots.length, byKind };
}
