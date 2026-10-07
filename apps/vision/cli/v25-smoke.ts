import assert from 'node:assert/strict';
import {
  DIRECTOR_CATEGORIES,
  DIRECTOR_OPTIONS,
  DIRECTOR_PRESETS,
  auditDirectorPrompt,
  compileDirectorPrompt,
  recommendPresets,
  selectionsFromPreset,
} from '../src/directorFinal';
import { anatomizePromptV25 } from '../src/promptAnatomyV25';

const source = 'A decision-maker compares three equivalent proposals at a real work table because there is no clear criterion for choosing. The camera should make the pressure visible without turning the scene into an action movie.';

assert.ok(DIRECTOR_CATEGORIES.length >= 18, `expected >=18 director categories, got ${DIRECTOR_CATEGORIES.length}`);
assert.ok(DIRECTOR_OPTIONS.length >= 100, `expected >=100 visual director options, got ${DIRECTOR_OPTIONS.length}`);
assert.ok(DIRECTOR_PRESETS.length >= 15, `expected >=15 presets, got ${DIRECTOR_PRESETS.length}`);

for (const required of ['camera','lens','aperture','focus','shutter','frameRate','whiteBalance','lighting','movement','subjectMotion','environmentMotion','look','material','fx']) {
  assert.ok(DIRECTOR_CATEGORIES.some((item) => item.id === required), `missing director category ${required}`);
}

const recommendations = recommendPresets(source, 'video', 6);
assert.equal(recommendations.length, 6);
assert.ok(recommendations.some((preset) => /decision|pressure/i.test(`${preset.id} ${preset.label} ${preset.tags.join(' ')}`)), 'decision text should recommend a decision/pressure recipe');

const preset = DIRECTOR_PRESETS.find((item) => item.id === 'intimate-pressure');
assert.ok(preset, 'intimate-pressure preset should exist');
const result = compileDirectorPrompt({
  sourceText: source,
  mode: 'video',
  selections: selectionsFromPreset(preset),
  aspect: '9:16',
  duration: '7 seconds',
});

assert.match(result.prompt, /ROLE \/ VISUAL FUNCTION/);
assert.match(result.prompt, /SOURCE TRUTH/);
assert.match(result.prompt, /CAMERA \/ OPTICS \/ EXPOSURE/);
assert.match(result.prompt, /Super 35/i);
assert.match(result.prompt, /85mm/i);
assert.match(result.prompt, /f\/2\.8/i);
assert.match(result.prompt, /180-degree shutter/i);
assert.match(result.prompt, /24 fps/i);
assert.match(result.prompt, /4300K/i);
assert.match(result.prompt, /LIGHT \/ COLOR/);
assert.match(result.prompt, /MOTION \/ PERFORMANCE/);
assert.match(result.prompt, /TEMPORAL \/ FRAME LOGIC/);
assert.match(result.prompt, /CONTINUITY/);
assert.match(result.prompt, /CONSTRAINTS/);
assert.match(result.prompt, /OUTPUT CONTRACT/);
assert.match(result.prompt, /9:16/);
assert.match(result.prompt, /7 seconds/);
assert.ok(result.decisions.length >= 16, `expected rich director package, got ${result.decisions.length} decisions`);
assert.ok(result.decisions.some((decision) => decision.category === 'lighting'));
assert.ok(result.decisions.some((decision) => decision.category === 'subjectMotion'));
assert.ok(result.decisions.some((decision) => decision.category === 'material'));

const anatomy = anatomizePromptV25(result.prompt);
assert.ok(anatomy.length > 12);
assert.ok(anatomy.some((segment) => segment.category === 'lens'));
assert.ok(anatomy.some((segment) => segment.category === 'lighting'));
assert.ok(anatomy.some((segment) => segment.category === 'movement'));
assert.ok(anatomy.some((segment) => segment.category === 'shutter'));
assert.ok(anatomy.some((segment) => segment.category === 'frameRate'));

const audit = auditDirectorPrompt(result.prompt, 'video');
assert.ok(audit.score >= 90, `expected directed prompt score >= 90, got ${audit.score}`);

const xr = compileDirectorPrompt({
  sourceText: 'A CRM looks full but nothing moves because the next action is missing.',
  mode: 'xroll',
  selections: {},
  aspect: '9:16',
  duration: '6 seconds',
});
assert.match(xr.prompt, /layered XRoll/i);
assert.match(xr.prompt, /independently generatable and compositable/i);
assert.match(xr.prompt, /parallax/i);
assert.match(xr.prompt, /fake dashboards/i);

console.log('✓ V2.5 final cinematic Director catalog');
console.log('✓ 18+ director dimensions and 100+ visual options');
console.log('✓ semantic preset recommendations from base text');
console.log('✓ base text → ABRAXAS directed video prompt');
console.log('✓ camera/exposure/cadence/light/motion/material continuity');
console.log('✓ precise inline Prompt Anatomy classification');
console.log('✓ directed prompt quality audit');
console.log('✓ XRoll-specific production contract');
