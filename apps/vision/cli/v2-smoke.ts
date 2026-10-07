import assert from 'node:assert/strict';
import { applyFichaPatches, improveFichaPrompt, parseFichaDocument } from '../src/fichaIntake';
import { compileXRoll, xrollPresets } from '../src/xrollEngine';

const seed = {
  schema: 'joc-story-editor-r5',
  collection: 'A',
  pieces: [{
    uid: 'P1',
    title: 'Test content',
    thesis: 'Show that a criterion organizes options.',
    scene: 'JOC at a work table.',
    visual_system: 'charcoal, ivory, controlled wine red',
    cover: { title: 'Cover', prompt_override: 'old cover prompt' },
    parts: [{
      part_id: 'P1-B1',
      role: 'Mechanism',
      visual: 'Three option cards and one criterion card.',
      composition: 'JOC left, cards right.',
      continuity: { receives: 'context', adds: 'criterion', opens: 'payoff' },
      prompt_override: 'old part prompt',
      assets: [{ asset_id: 'P1-B1-XR1', category: 'XR', purpose: 'Explain the mechanism.', prompt_override: 'old asset prompt' }],
    }],
  }],
};

const html = `<!doctype html><html><body><script type="application/json" id="seed">${JSON.stringify(seed)}</script><script>console.log('canvas code stays')</script></body></html>`;
const parsed = parseFichaDocument('fixture.html', html);
assert.equal(parsed.schema, 'joc-story-editor-r5');
assert.equal(parsed.pieceCount, 1);
assert.equal(parsed.slots.length, 3);
assert.ok(parsed.slots.some((slot) => slot.kind === 'asset-override'));
assert.ok(parsed.slots.some((slot) => slot.breadcrumb.includes('cover') && slot.prompt === 'old cover prompt'));

const target = parsed.slots.find((slot) => slot.kind === 'asset-override');
assert.ok(target);
const improved = improveFichaPrompt(target, { language: 'es' });
assert.match(improved, /ABRAXAS/);
assert.match(improved, /ROL/);
assert.match(improved, /CONTINUIDAD/);
assert.match(improved, /PROMPT ORIGINAL/);
const patched = applyFichaPatches(parsed, [{ slotId: target.id, before: target.prompt, after: improved }]);
assert.match(patched, /canvas code stays/);
assert.match(patched, /ABRAXAS/);
assert.match(patched, /old part prompt/);

const appDataHtml = `<!doctype html><script id="app-data" type="application/json">${JSON.stringify({ schemaVersion: 'abrxos.alpha.story-editor.r10.1', projectId: 'JOC55', pieces: [{ id: 'x', cover: { prompt: 'cover' }, timeline: [{ track: 'xr', asset: { assetId: 'A01', promptNoText: 'asset no text', promptWithText: 'asset with text' } }] }] })}</script>`;
const r10 = parseFichaDocument('r10.html', appDataHtml);
assert.equal(r10.schema, 'abrxos.alpha.story-editor.r10.1');
assert.equal(r10.slots.length, 3);
assert.ok(r10.slots.some((slot) => slot.kind === 'asset-prompt-no-text'));

const txt = `TITLE: Demo\nPROMPT: simple prompt\nOUTPUT: end\n`;
const txtDoc = parseFichaDocument('demo.txt', txt);
assert.equal(txtDoc.slots.length, 1);
const txtOut = applyFichaPatches(txtDoc, [{ slotId: txtDoc.slots[0].id, before: txtDoc.slots[0].prompt, after: 'improved prompt' }]);
assert.match(txtOut, /improved prompt/);

const xr = compileXRoll({ idea: 'A full CRM pipeline does not move because the next action is missing.', preset: xrollPresets[4], layerCount: 5, brand: 'JOC' });
assert.equal(xr.schema, 'abrxs.vision.xroll.v2');
assert.equal(xr.layers.length, 5);
assert.match(xr.masterPrompt, /XROLL MASTER/);
assert.match(xr.motionPrompt, /PARALLAX/);
assert.ok(xr.layers.every((layer) => layer.prompt.includes('one independent asset')));

console.log('✓ ficha HTML seed detected');
console.log('✓ R10.1 app-data detected');
console.log('✓ prompt-only round-trip patch preserves canvas code');
console.log('✓ TXT prompt patch works');
console.log('✓ XRoll master/layers/motion compile');
