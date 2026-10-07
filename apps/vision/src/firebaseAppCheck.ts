const FIREBASE_CONFIG_KEY = 'abrxsVisionFirebaseConfigV1';
const FIREBASE_APP_CHECK_SITE_KEY = 'abrxsVisionFirebaseAppCheckSiteKeyV1';

let appCheckPromise: Promise<unknown> | null = null;

export function loadFirebaseWebConfig() {
  return {
    configJson: localStorage.getItem(FIREBASE_CONFIG_KEY) || '',
    siteKey: localStorage.getItem(FIREBASE_APP_CHECK_SITE_KEY) || '',
  };
}

export function saveFirebaseWebConfig(configJson: string, siteKey: string) {
  localStorage.setItem(FIREBASE_CONFIG_KEY, configJson.trim());
  localStorage.setItem(FIREBASE_APP_CHECK_SITE_KEY, siteKey.trim());
  appCheckPromise = null;
}

async function createAppCheck() {
  const { configJson, siteKey } = loadFirebaseWebConfig();
  if (!configJson.trim() || !siteKey.trim()) return null;
  let config: Record<string, string>;
  try {
    config = JSON.parse(configJson) as Record<string, string>;
  } catch {
    throw new Error('Firebase web config is not valid JSON.');
  }
  if (!config.apiKey || !config.projectId || !config.appId) {
    throw new Error('Firebase web config must include apiKey, projectId and appId.');
  }
  const [{ getApp, getApps, initializeApp }, { ReCaptchaEnterpriseProvider, initializeAppCheck }] = await Promise.all([
    import('firebase/app'),
    import('firebase/app-check'),
  ]);
  const app = getApps().length ? getApp() : initializeApp(config);
  return initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

export async function getVisionAppCheckToken() {
  const { configJson, siteKey } = loadFirebaseWebConfig();
  if (!configJson.trim() || !siteKey.trim()) return '';
  if (!appCheckPromise) appCheckPromise = createAppCheck();
  const appCheck = await appCheckPromise;
  if (!appCheck) return '';
  const { getToken } = await import('firebase/app-check');
  const response = await getToken(appCheck as Parameters<typeof getToken>[0], false);
  return response.token;
}
