# Vision Cloud Gateway · Firebase

This optional backend lets the public Vision PWA use AI assistants without embedding master provider API keys in GitHub Pages.

## Current scope

Implemented:
- `/health`
- `/assistant` with NVIDIA NIM
- `/assistant` with Gemini API
- Firebase App Check token support in the Vision PWA
- optional/enforceable App Check verification in the function
- strict CORS target for the public Vision origin

Prepared but intentionally disabled:
- `/generate`

Generation remains disabled until each provider adapter validates credentials, concrete model/workflow capabilities, request schema and spending policy.

## Setup

Requirements:
- Firebase CLI authenticated to the Firebase project you want to use;
- a Firebase Web App registered in that project;
- reCAPTCHA Enterprise configured as the App Check provider for that Web App;
- a project with Cloud Functions enabled;
- NVIDIA and/or Gemini API keys.

From this folder:

```bash
cd apps/vision/firebase
firebase use --add
cd functions
npm install
npm run build
```

Set provider secrets. The CLI asks for the values without placing them in source code:

```bash
firebase functions:secrets:set NVIDIA_API_KEY
firebase functions:secrets:set GEMINI_API_KEY
```

Set runtime parameters when prompted/deploying:

```text
VISION_ALLOWED_ORIGIN=https://lordjeferies.github.io
VISION_REQUIRE_APP_CHECK=true
```

Deploy:

```bash
cd ..
firebase deploy --only functions
```

After deploy:
1. Copy the HTTPS URL of `visionGateway` into Vision → Settings → Vision Cloud Gateway.
2. In Firebase Console, copy the public Web App config object into Vision → Settings → Firebase App Check.
3. Copy the public reCAPTCHA Enterprise site key into the same Settings panel.
4. Save App Check and test Vision Copilot from the PWA.

The Firebase Web App config and reCAPTCHA site key are public client configuration. NVIDIA/Gemini master provider keys remain only in Secret Manager.

## Production hardening

Before broad public use:
- monitor App Check metrics and enforce App Check;
- enable Firebase Auth if account-level access/project sync is needed;
- add request/rate quotas;
- keep provider secrets only in Secret Manager;
- add provider-specific generation adapters behind explicit spend confirmation;
- persist long-running generation as jobs rather than holding a browser request open.

## Why Firebase is optional

Vision Core does not depend on Firebase. Prompt Studio, fichas, XRoll planning, storyboard, carousel and local project work continue to operate offline. Firebase is only a cloud bridge for shared/synced/AI-backed capabilities.
