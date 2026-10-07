import type { DirectorCategory } from './directorFinal';

export type AnatomyCategory = DirectorCategory | 'intent' | 'subject' | 'action' | 'scene' | 'output' | 'continuity' | 'constraints' | 'text';
export type AnatomySegment = { text: string; category: AnatomyCategory };

const strongRules: Array<[AnatomyCategory, RegExp]> = [
  ['output', /\b(?:9:16|4:5|1:1|16:9|2\.39:1|output contract|production-ready|single decisive frame|\d+\s*(?:seconds?|segundos?))\b/i],
  ['shutter', /\b(?:shutter|180-degree|90-degree|270-degree|360-degree)\b/i],
  ['frameRate', /\b(?:24|25|30|48|60|120)\s*fps\b|\bframe rate\b|\bcadence\b/i],
  ['whiteBalance', /\b(?:3200|4300|5600|6500)k\b|white balance|color temperature/i],
  ['aperture', /\bf\/(?:1\.4|2|2\.8|4|5\.6|8)\b|\baperture\b/i],
  ['lens', /\b(?:18|24|28|35|40|50|65|85|100|105|135|200)\s?mm\b|\banamorphic\b|\btelephoto\b|\bmacro optics?\b/i],
  ['camera', /\b(?:large-format|super 35|full-frame|digital cinema|camera response|sensor)\b/i],
  ['focus', /\b(?:depth of field|focus locked|focal plane|rack focus|deep focus|split-focus|bokeh)\b/i],
  ['angle', /\b(?:eye-level|ground-level|waist-level|high-angle|low-angle|overhead|top-down|dutch angle|over-the-shoulder)\b/i],
  ['shot', /\b(?:extreme close-up|close-up|medium close-up|medium shot|full-body shot|wide shot|extreme wide)\b/i],
  ['lighting', /\b(?:key light|soft key|side key|negative fill|backlight|top light|practical lamps?|window key|overcast skylight|rim light|key-to-fill|lighting)\b/i],
  ['movement', /\b(?:dolly-in|dolly-out|camera movement|camera move|pan\b|tilt\b|truck move|orbit\b|handheld|crane rise|locked-off)\b/i],
  ['subjectMotion', /\b(?:subject remains|subject shifts|reaches? toward|head\/body turn|walking pace|hand gesture|micro-expression|breathing)\b/i],
  ['environmentMotion', /\b(?:hair and fabric|rain interaction|haze drift|moving reflections|background human|background traffic|environment remains stable)\b/i],
  ['composition', /\b(?:rule-of-thirds|negative space|symmetrical composition|frame-within-frame|leading lines|diagonal composition|foreground|midground|focal hierarchy)\b/i],
  ['look', /\b(?:film response|organic grain|highlight roll-off|optical diffusion|editorial grade|documentary color|bleach-bypass|pastel editorial)\b/i],
  ['atmosphere', /\b(?:atmospheric haze|environmental mist|realistic rain|dust motes|smoke|clean clear air)\b/i],
  ['material', /\b(?:skin texture|paper fibers|brushed metal|glass refraction|woven fabric|wood grain|material)\b/i],
  ['fx', /\b(?:bloom|halation|volumetric light|light leak|physically motivated reflections)\b/i],
  ['continuity', /\b(?:continuity|lock identity|wardrobe|scene geography|screen direction|must not change|new takes)\b/i],
  ['constraints', /\b(?:constraints?|avoid|no generic|no decorative|no arbitrary|do not invent|must not)\b/i],
  ['text', /\b(?:text \/ graphics|literal word|typography|body copy|text-safe|fake interface text)\b/i],
  ['action', /\b(?:compares?|moves?|walks?|reaches?|turns?|looks?|holds?|sits?|stands?|pauses?|gestures?|places?|stops?)\b/i],
  ['scene', /\b(?:work table|office|room|street|studio|interior|exterior|environment|background)\b/i],
  ['subject', /\b(?:decision-maker|founder|woman|man|person|subject|character|face|joc)\b/i],
  ['intent', /\b(?:source truth|visual function|purpose|criterion|decision|idea|meaning|make .* visible)\b/i],
];

const sectionRules: Array<[AnatomyCategory, RegExp]> = [
  ['intent', /^ROLE \/ VISUAL FUNCTION/i],
  ['intent', /^SOURCE TRUTH/i],
  ['camera', /^CAMERA \/ OPTICS \/ EXPOSURE/i],
  ['composition', /^COMPOSITION \/ LOOK \/ MATERIAL/i],
  ['lighting', /^LIGHT \/ COLOR/i],
  ['movement', /^MOTION \/ PERFORMANCE/i],
  ['movement', /^TEMPORAL \/ FRAME LOGIC/i],
  ['continuity', /^CONTINUITY/i],
  ['text', /^TEXT \/ GRAPHICS/i],
  ['constraints', /^CONSTRAINTS/i],
  ['output', /^OUTPUT CONTRACT/i],
];

function classify(text: string): AnatomyCategory {
  const trimmed = text.trim();
  for (const [category, rule] of sectionRules) if (rule.test(trimmed)) return category;
  for (const [category, rule] of strongRules) if (rule.test(trimmed)) return category;
  return 'intent';
}

export function anatomizePromptV25(source: string): AnatomySegment[] {
  const chunks = source.split(/((?:;\s+)|(?:\.\s+)|(?:\n+))/g).filter(Boolean);
  return chunks.map((text) => {
    if (/^[;.\s]+$/.test(text)) return { text, category: 'intent' as const };
    return { text, category: classify(text) };
  });
}
