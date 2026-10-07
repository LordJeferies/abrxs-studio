import { getAppCheck, initializeApp } from 'firebase-admin/app-check';
import { applicationDefault, getApps, initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { defineSecret, defineString } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';

if (!getApps().length) initializeAdminApp({ credential: applicationDefault() });

const NVIDIA_API_KEY = defineSecret('NVIDIA_API_KEY');
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
const ALLOWED_ORIGIN = defineString('VISION_ALLOWED_ORIGIN', { default: 'https://lordjeferies.github.io' });
const REQUIRE_APP_CHECK = defineString('VISION_REQUIRE_APP_CHECK', { default: 'false' });

function setCors(req: any, res: any) {
  const origin = String(req.headers.origin || '');
  const allowed = ALLOWED_ORIGIN.value();
  if (origin && (origin === allowed || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
    res.set('access-control-allow-origin', origin);
  }
  res.set('vary', 'Origin');
  res.set('access-control-allow-methods', 'GET,POST,OPTIONS');
  res.set('access-control-allow-headers', 'content-type,x-firebase-appcheck,authorization');
}

async function verifyAppCheckIfRequired(req: any) {
  if (REQUIRE_APP_CHECK.value() !== 'true') return;
  const token = req.header('x-firebase-appcheck');
  if (!token) throw new Error('Missing Firebase App Check token.');
  await getAppCheck().verifyToken(token);
}

async function nvidiaAssistant(body: any) {
  const key = NVIDIA_API_KEY.value();
  if (!key) throw new Error('NVIDIA_API_KEY is not configured in Firebase Secret Manager.');
  const model = String(body.model || 'meta/muse-glimmer-30b');
  const messages = Array.isArray(body.messages) ? body.messages.slice(-16) : [];
  const systemPrompt = String(body.systemPrompt || '');
  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.2,
      max_tokens: 1800,
      stream: false,
    }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`NVIDIA HTTP ${response.status}: ${text}`);
  const raw = JSON.parse(text);
  return { content: raw?.choices?.[0]?.message?.content || '', raw };
}

async function geminiAssistant(body: any) {
  const key = GEMINI_API_KEY.value();
  if (!key) throw new Error('GEMINI_API_KEY is not configured in Firebase Secret Manager.');
  const model = String(body.model || 'gemini-2.5-flash');
  const systemPrompt = String(body.systemPrompt || '');
  const conversation = Array.isArray(body.messages) ? body.messages.slice(-16) : [];
  const contents = conversation.map((message: any) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(message.content || '') }],
  }));
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { temperature: 0.2, maxOutputTokens: 1800 },
    }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Gemini HTTP ${response.status}: ${text}`);
  const raw = JSON.parse(text);
  const responseText = raw?.candidates?.[0]?.content?.parts?.map((part: any) => part.text || '').join('') || '';
  return { response: responseText, raw };
}

export const visionGateway = onRequest({
  cors: false,
  secrets: [NVIDIA_API_KEY, GEMINI_API_KEY],
  timeoutSeconds: 120,
  memory: '512MiB',
}, async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
  try {
    await verifyAppCheckIfRequired(req);
    const path = req.path.replace(/\/+$/, '') || '/';
    if (req.method === 'GET' && path === '/health') {
      res.json({ ok: true, service: 'abrxs-vision-gateway', assistant: ['nvidia', 'gemini'], generation: 'adapter-required' });
      return;
    }
    if (req.method === 'POST' && path === '/assistant') {
      const provider = String(req.body?.provider || 'nvidia');
      const result = provider === 'nvidia'
        ? await nvidiaAssistant(req.body || {})
        : await geminiAssistant(req.body || {});
      res.json(result);
      return;
    }
    if (req.method === 'POST' && path === '/generate') {
      res.status(501).json({
        ok: false,
        error: 'Cloud generation adapter is not enabled yet. Vision keeps Generate disabled until a provider/model capability adapter is validated.',
      });
      return;
    }
    res.status(404).json({ ok: false, error: 'Unknown Vision Gateway route.' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});
