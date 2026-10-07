import type { DirectorState } from './promptEngine';
import type { ProfessionalPromptBrief } from './professionalPromptEngine';
import { DIRECTOR_CATEGORIES, DIRECTOR_OPTIONS, type DirectorCategory } from './directorFinal';

export type AssistantProviderId = 'nvidia' | 'gemini-cli';

export type VisionAssistantAction =
  | { type: 'set-director'; field: keyof DirectorState; value: string | boolean; reason?: string }
  | { type: 'set-brief'; field: keyof ProfessionalPromptBrief; value: string; reason?: string }
  | { type: 'set-v25-option'; category: DirectorCategory; optionId: string; reason?: string }
  | { type: 'replace-v25-source'; value: string; reason?: string };

export type VisionAssistantReference = {
  title: string;
  why: string;
  camera?: string;
  light?: string;
  composition?: string;
  motion?: string;
};

export type VisionAssistantEnvelope = {
  message: string;
  actions: VisionAssistantAction[];
  references: VisionAssistantReference[];
};

export type SceneRecipe = {
  id: string;
  name: string;
  purpose: string;
  framing: string;
  focal: string;
  angle: string;
  movement: string;
  lighting: string;
  composition: string;
  useWhen: string;
};

export const sceneRecipes: SceneRecipe[] = [
  { id: 'clean-decision', name: 'Clean Decision', purpose: 'Make one criterion visibly dominate several equivalent options.', framing: 'Medium close-up', focal: '50mm', angle: 'Eye level', movement: 'Slow dolly in', lighting: 'Soft motivated side key', composition: 'Subject on left third, decision objects right, protected negative space above.', useWhen: 'criteria, comparison, sales decisions, practical educational visuals' },
  { id: 'intimate-proof', name: 'Intimate Proof', purpose: 'Turn a personal claim into observable behavior rather than a posed portrait.', framing: 'Close-up', focal: '85mm', angle: 'Eye level', movement: 'Static', lighting: 'Window-side soft key + negative fill', composition: 'Face and hands remain readable; environmental evidence stays secondary.', useWhen: 'testimonial, reflection, emotional insight, founder story' },
  { id: 'suspense-reveal', name: 'Suspense Reveal', purpose: 'Delay the important fact and let one clue earn the reveal.', framing: 'Medium → detail', focal: '50mm → 85mm', angle: 'Eye level', movement: 'Restrained push-in', lighting: 'Low-key motivated practicals', composition: 'Hide the decisive object until the final beat; preserve screen direction.', useWhen: 'reveal, problem diagnosis, before/after logic, narrative hooks' },
  { id: 'editorial-top', name: 'Editorial Mechanism', purpose: 'Explain a process using real objects and spatial hierarchy.', framing: 'Top / three-quarter', focal: '35–50mm', angle: 'High three-quarter', movement: 'Static or short slider', lighting: 'Large soft source with controlled edge contrast', composition: 'Physical cards, documents or objects form a readable mechanism; no fake dashboard.', useWhen: 'workflows, CRM, systems, step-by-step explanation, XRolls' },
  { id: 'documentary-context', name: 'Documentary Context', purpose: 'Preserve a human subject and enough environment to make the situation credible.', framing: 'Medium', focal: '35mm', angle: 'Eye level', movement: 'Restrained handheld', lighting: 'Available-light realism with motivated practical support', composition: 'Foreground depth and environmental clues without stock-photo posing.', useWhen: 'real stories, work environments, interviews, process observation' },
  { id: 'product-hero', name: 'Product / Object Hero', purpose: 'Make material, function and interaction clear without decorative luxury clichés.', framing: 'Medium detail', focal: '85mm or macro', angle: 'Three-quarter', movement: 'Micro slider or static', lighting: 'Large soft key + controlled specular edge', composition: 'Hero object isolated with one functional interaction and clean background.', useWhen: 'product, physical evidence, prop, material detail, standalone asset' },
  { id: 'social-hook', name: 'Social Cinematic Hook', purpose: 'Make the first seconds legible immediately, then reveal enough context to create a question.', framing: 'Close → medium', focal: '35–50mm', angle: 'Eye level', movement: 'One deliberate push or lateral reveal', lighting: 'High-clarity motivated contrast', composition: 'Strong first focal point, readable safe zone, no competing decorative elements.', useWhen: 'vertical short-form, reels, opening beats, rapid explanation' },
  { id: 'modern-noir', name: 'Modern Noir', purpose: 'Create tension through controlled absence, geometry and motivated darkness.', framing: 'Medium / wide', focal: '50mm', angle: 'Eye level or slight low angle', movement: 'Slow lateral track', lighting: 'Hard motivated side source + practical pools', composition: 'Negative space carries tension; highlights reveal only necessary geometry.', useWhen: 'tension, uncertainty, strategic conflict, conceptual narrative visuals' },
];

const directorFields = new Set<keyof DirectorState>([
  'idea', 'subject', 'environment', 'action', 'camera', 'lens', 'focal', 'aperture', 'framing', 'angle', 'movement', 'lighting', 'palette', 'atmosphere', 'style', 'aspect', 'brandPreset', 'outputLanguage', 'visualFunction', 'materialTexture', 'brandElements', 'textZones', 'continuity', 'evidenceConstraints',
]);
const briefFields = new Set<keyof ProfessionalPromptBrief>([
  'objective', 'mustHave', 'doNotWant', 'outputType', 'outputRequirements', 'literalText', 'performance', 'physicsNotes', 'motionIntent', 'audioIntent', 'referenceInstructions', 'continuityPriority',
]);
const directorCategories = new Set<DirectorCategory>(DIRECTOR_CATEGORIES.map((item) => item.id));

function stripFence(value: string) {
  return value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

export function parseAssistantEnvelope(value: string): VisionAssistantEnvelope {
  try {
    const parsed = JSON.parse(stripFence(value)) as Partial<VisionAssistantEnvelope>;
    const actions = Array.isArray(parsed.actions) ? parsed.actions.filter((action): action is VisionAssistantAction => {
      if (!action || typeof action !== 'object' || typeof (action as VisionAssistantAction).type !== 'string') return false;
      const item = action as VisionAssistantAction;
      if (item.type === 'set-director') return directorFields.has(item.field) && (typeof item.value === 'string' || typeof item.value === 'boolean');
      if (item.type === 'set-brief') return briefFields.has(item.field) && typeof item.value === 'string';
      if (item.type === 'replace-v25-source') return typeof item.value === 'string' && item.value.trim().length > 0;
      if (item.type === 'set-v25-option') {
        if (!directorCategories.has(item.category) || typeof item.optionId !== 'string') return false;
        return DIRECTOR_OPTIONS.some((option) => option.category === item.category && option.id === item.optionId);
      }
      return false;
    }) : [];
    const references = Array.isArray(parsed.references) ? parsed.references.filter((reference) => reference && typeof reference.title === 'string' && typeof reference.why === 'string') : [];
    return { message: typeof parsed.message === 'string' ? parsed.message : value, actions, references };
  } catch {
    return { message: value.trim(), actions: [], references: [] };
  }
}

function v25CatalogForPrompt() {
  return DIRECTOR_CATEGORIES.map((category) => {
    const options = DIRECTOR_OPTIONS.filter((option) => option.category === category.id).map((option) => `${option.id}=${option.label}`).join(', ');
    return `${category.id}: ${options}`;
  }).join('\n');
}

export function buildVisionAssistantSystemPrompt(language: 'es' | 'en') {
  const recipes = sceneRecipes.map((item) => `${item.name}: ${item.purpose}; ${item.focal}; ${item.framing}; ${item.lighting}; ${item.movement}. Use when: ${item.useWhen}`).join('\n');
  const catalog = v25CatalogForPrompt();
  const outputRule = `Return ONLY valid JSON with this exact top-level shape: {"message":"...","actions":[],"references":[]}. Allowed actions: {"type":"set-director","field":"<legacy Director field>","value":"...","reason":"..."}; {"type":"set-brief","field":"<professional brief field>","value":"...","reason":"..."}; {"type":"set-v25-option","category":"<V2.5 category>","optionId":"<exact option id>","reason":"..."}; {"type":"replace-v25-source","value":"<improved base text>","reason":"..."}. Never invent another action type. Never apply an action silently; the UI will require user approval.`;
  if (language === 'es') return [
    'Eres Vision Copilot, asistente interno de Abrxs Vision Art Creator V2.5 Director Studio.',
    'Tu trabajo principal es mejorar y dirigir una intención visual. El usuario puede pegar texto base/guion/idea y elegir decisiones de cine. No sustituyas la tesis; vuelve visible el mecanismo.',
    'Respeta source truth, texto literal, referencias por rol, identidad, continuidad, evidencia y contratos de output.',
    'No uses adjetivos vacíos como sustituto de decisiones. Traduce calidad en sujeto, acción observable, composición, cámara, óptica, exposición/cadencia, luz, movimiento, materiales, continuidad y entrega.',
    'Cuando mejores un prompt, explica brevemente qué problema resuelves. Si propones una decisión V2.5, usa set-v25-option con un category y optionId EXACTOS del catálogo.',
    'Si el usuario seleccionó texto dentro del Director, trátalo como el foco de la intervención y no reescribas el resto sin pedirlo.',
    'Si el usuario pide referencias, usa primero las recetas internas. No afirmes haber buscado Internet si no existe una herramienta de búsqueda conectada.',
    'Nunca ejecutes generación ni gasto. El botón Generar y la confirmación de gasto pertenecen al módulo de creación/proveedor.',
    outputRule,
    'CATÁLOGO DIRECTOR V2.5 (ids exactos):', catalog,
    'RECETAS INTERNAS DE ESCENA:', recipes,
  ].join('\n\n');
  return [
    'You are Vision Copilot, the internal assistant for Abrxs Vision Art Creator V2.5 Director Studio.',
    'Your primary job is to improve and direct visual intent. The user may paste base text/script/idea and choose cinematic decisions. Do not replace the thesis; make the mechanism visible.',
    'Respect source truth, literal text, reference roles, identity, continuity, evidence and output contracts.',
    'Do not use vague quality adjectives as substitutes for decisions. Translate quality into observable subject/action, composition, camera, optics, exposure/cadence, light, motion, materials, continuity and delivery.',
    'When improving a prompt, briefly explain the diagnosed problem. For V2.5 decisions use set-v25-option with an EXACT category and optionId from the catalog.',
    'If the user selected text inside Director, treat that selection as the intervention target and do not rewrite the rest unless requested.',
    'If references are requested, use the internal recipes first. Do not claim web research unless a search tool is connected.',
    'Never execute generation or spend. Generate and spend confirmation belong to the creation/provider module.',
    outputRule,
    'DIRECTOR V2.5 CATALOG (exact ids):', catalog,
    'INTERNAL SCENE RECIPES:', recipes,
  ].join('\n\n');
}
