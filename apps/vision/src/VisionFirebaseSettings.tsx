import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { loadFirebaseWebConfig, saveFirebaseWebConfig } from './firebaseAppCheck';

export function VisionFirebaseSettings({ language }: { language: 'es' | 'en' }) {
  const es = language === 'es';
  const stored = loadFirebaseWebConfig();
  const [configJson, setConfigJson] = useState(stored.configJson);
  const [siteKey, setSiteKey] = useState(stored.siteKey);
  const [message, setMessage] = useState('');

  const save = () => {
    try {
      const parsed = JSON.parse(configJson || '{}') as Record<string, unknown>;
      if (!parsed.apiKey || !parsed.projectId || !parsed.appId) throw new Error(es ? 'El config debe incluir apiKey, projectId y appId.' : 'Config must include apiKey, projectId and appId.');
      if (!siteKey.trim()) throw new Error(es ? 'Falta la site key de reCAPTCHA Enterprise.' : 'reCAPTCHA Enterprise site key is missing.');
      saveFirebaseWebConfig(configJson, siteKey);
      setMessage(es ? 'Firebase App Check quedó configurado en este dispositivo.' : 'Firebase App Check is configured on this device.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  };

  return <section className="vision-firebase-settings-v2">
    <header><div><span className="micro">PWA SECURITY · FIREBASE APP CHECK</span><h2>{es ? 'Protege el gateway público.' : 'Protect the public gateway.'}</h2><p>{es ? 'La configuración web de Firebase y la site key son públicas por diseño. Las API keys maestras de NVIDIA/Gemini permanecen sólo en Secret Manager. Vision obtiene un token App Check antes de llamar al gateway.' : 'Firebase web config and the site key are public by design. NVIDIA/Gemini master API keys remain only in Secret Manager. Vision gets an App Check token before calling the gateway.'}</p></div><ShieldCheck size={22}/></header>
    <div className="firebase-settings-grid">
      <label><span>Firebase web config JSON</span><textarea value={configJson} onChange={(event) => setConfigJson(event.target.value)} placeholder={'{"apiKey":"…","authDomain":"…","projectId":"…","appId":"…"}'}/></label>
      <label><span>reCAPTCHA Enterprise site key</span><input value={siteKey} onChange={(event) => setSiteKey(event.target.value)} placeholder="6Lc…"/></label>
    </div>
    <div className="firebase-settings-actions"><button type="button" onClick={save}>{es ? 'Guardar App Check' : 'Save App Check'}</button><small>{es ? 'Después de verificar que funciona, configura VISION_REQUIRE_APP_CHECK=true en el gateway.' : 'After verifying it works, set VISION_REQUIRE_APP_CHECK=true on the gateway.'}</small></div>
    {message && <p className="firebase-settings-message">{message}</p>}
  </section>;
}
