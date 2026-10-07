import assert from 'node:assert/strict';
import { DIRECTOR_OPTIONS, DIRECTOR_PRESETS, anatomizePrompt, auditDirectorPrompt } from '../src/directorCatalog';
import { compileDirectedPrompt, recommendDirectorPresets, selectionsFromPreset } from '../src/directorCompiler';
import { APERTURES, CAMERA_SYSTEMS, FRAME_RATES, SHUTTERS, WHITE_BALANCE } from '../src/technicalDirector';

const source = 'A decision-maker compares three equivalent proposals at a real work table because there is no clear criterion for choosing. The camera should make the pressure visible without turning the scene into an action movie.';

assert.ok(DIRECTOR_OPTIONS.length >= 40, 'director catalog should contain a broad visual library');
assert.ok(DIRECTOR_PRESETS.length >= 10, 'director presets should cover multiple visual families');
assert.ok(CAMERA_SYSTEMS.length >= 6);
assert.ok(APERTURES.length >= 6);
assert.ok(SHUTTERS.length >= 4);
assert.ok(FRAME_RATES.length >= 5);
assert.ok(WHITE_BALANCE.length >= 4);

const recommendations = recommendDirectorPresets(source, 'video', 5);
assert.equal(recommendations.length, 5);
assert.ok(recommendations.some((preset) => /decision|pressure/i.test(`${preset.id} ${preset.label}`)), 'decision text should recommend a decision/pressure recipe');

const preset = DIRECTOR_PRESETS.find((item) => item.id === 'intimate-pressure');
assert.ok(preset);
const result = compileDirectedPrompt(source, 'video', selectionsFromPreset(preset), {
  aspect: '9:16',
  duration: '7 seconds',
  technical: {
    cameraSystem: 'super35-digital',
    aperture: 'f2.8',
    shutter: '180',
    frameRate: '24fps',
    whiteBalance: '4300k',
  },
});
assert.match(result.prompt, /SOURCE INTENT/);
assert.match(result.prompt, /VISUAL DIRECTION/);
assert.match(result.prompt, /CAMERA \/ EXPOSURE \/ CADENCE/);
assert.match(result.prompt, /Super 35 digital cinema/i);
assert.match(result.prompt, /f\/2\.8/i);
assert.match(result.prompt, /180-degree shutter/i);
assert.match(result.prompt, /24 fps/i);
assert.match(result.prompt, /4300K/i);
assert.match(result.prompt, /TEMPORAL \/ FRAME LOGIC/);
assert.match(result.prompt, /CONTINUITY/);
assert.match(result.prompt, /CONSTRAINTS/);
assert.match(result.prompt, /85mm/i);
assert.match(result.prompt, /9:16/);
assert.match(result.prompt, /7 seconds/);
assert.ok(result.decisions.length >= 7);
assert.ok(result.technical.length === 5);
assert.ok(result.decisions.some((decision) => decision.category === 'lens' && decision.label === '85mm'));
assert.ok(result.decisions.some((decision) => decision.category === 'lighting'));
assert.ok(result.decisions.some((decision) => decision.category === 'movement'));

const anatomy = anatomizePrompt(result.prompt);
assert.ok(anatomy.length > 5);
assert.ok(anatomy.some((segment) => segment.category === 'lighting' || segment.category === 'movement' || segment.category === 'composition'));

const audit = auditDirectorPrompt(result.prompt);
assert.ok(audit.score >= 80, `expected directed prompt score >= 80, got ${audit.score}`);

const xr = compileDirectedPrompt('A CRM looks full but nothing moves because the next action is missing.', 'xroll', {}, { aspect: '9:16', duration: '6 seconds' });
assert.match(xr.prompt, /layered XRoll/i);
assert.match(xr.prompt, /independently generatable and compositable/i);
assert.match(xr.prompt, /parallax/i);

console.log('✓ V2.5 cinematic director catalog');
console.log('✓ camera/exposure/cadence technical director');
console.log('✓ suggested presets from source text');
console.log('✓ source text → directed video prompt');
console.log('✓ compiled decisions preserve lens/light/motion');
console.log('✓ prompt anatomy remains available');
console.log('✓ directed prompt quality audit');
console.log('✓ XRoll-specific compilation contract');
