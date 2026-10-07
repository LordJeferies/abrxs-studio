import {
  analyzeDirectorSource,
  detectDirectionConflicts,
  recommendDirectorOptions,
} from '../src/v26Core';

function invariant(value: unknown, message: string): asserts value {
  if (!value) throw new Error(`[Vision V2.6] ${message}`);
}

const source = 'Un decisor compara tres propuestas sobre una mesa. Mira una, luego otra, duda y retira la mano sin elegir.';
const analysis = analyzeDirectorSource(source, 'video');

invariant(analysis.semanticTags.includes('decision'), 'decision semantics not detected');
invariant(analysis.visualPriorities.some((item) => /proposal|document|table|hands/i.test(item)), 'required visual evidence not protected');

const recommendations = recommendDirectorOptions(source, 'video', analysis);
const lens = recommendations.find((item) => item.category === 'lens');
const lighting = recommendations.find((item) => item.category === 'lighting');
const movement = recommendations.find((item) => item.category === 'movement');

invariant(lens, 'lens recommendation missing');
invariant(lighting, 'lighting recommendation missing');
invariant(movement, 'movement recommendation missing');
invariant(lens.confidence >= 52, 'recommendation confidence invalid');
invariant(lens.reason.length > 20, 'recommendation reason missing');
invariant(lens.tradeoff.length > 20, 'recommendation tradeoff missing');
invariant(lens.alternatives.length >= 1, 'recommendation alternatives missing');

const conflicts = detectDirectionConflicts(analysis, 'video', {
  shot: 'ecu',
  lens: '135mm',
  aperture: 'f14',
});

invariant(conflicts.length >= 2, 'source/direction conflict detection did not trigger');

console.log(JSON.stringify({
  ok: true,
  version: '2.6.0',
  tags: analysis.semanticTags,
  lens: {
    primary: lens.primary.id,
    alternatives: lens.alternatives.map((item) => item.id),
    confidence: lens.confidence,
  },
  conflicts: conflicts.map((item) => item.id),
}, null, 2));
