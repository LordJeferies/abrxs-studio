import assert from 'node:assert/strict';
import { buildVisionAssistantSystemPrompt, parseAssistantEnvelope, sceneRecipes } from '../src/assistantCore';

const parsed = parseAssistantEnvelope(JSON.stringify({
  message: 'Use a tighter framing and protect continuity.',
  actions: [
    { type: 'set-director', field: 'focal', value: '85mm', reason: 'Increase isolation.' },
    { type: 'set-brief', field: 'mustHave', value: 'identity continuity; motivated side light' },
    { type: 'delete-project', field: 'idea', value: 'bad' },
    { type: 'set-director', field: 'notAField', value: 'bad' },
  ],
  references: [{ title: 'Intimate Proof', why: 'Use behavior and a compressed focal length.', camera: '85mm' }],
}));

assert.equal(parsed.message, 'Use a tighter framing and protect continuity.');
assert.equal(parsed.actions.length, 2);
assert.equal(parsed.references.length, 1);
assert.ok(sceneRecipes.length >= 8);
assert.ok(sceneRecipes.some((recipe) => recipe.id === 'social-hook'));
const prompt = buildVisionAssistantSystemPrompt('es');
assert.match(prompt, /Vision Copilot/);
assert.match(prompt, /Nunca ejecutes generación ni gasto/);
assert.match(prompt, /RECETAS INTERNAS DE ESCENA/);
const fallback = parseAssistantEnvelope('plain provider answer');
assert.equal(fallback.message, 'plain provider answer');
assert.equal(fallback.actions.length, 0);

console.log('✓ assistant response schema filters unknown actions');
console.log('✓ scene reference catalog is available');
console.log('✓ assistant system prompt protects intent and spend boundary');
