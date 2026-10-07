# Vision Cloud Gateway · Firebase

This optional backend lets the public Vision PWA use AI assistants without embedding master provider API keys in GitHub Pages.

## Current scope

Implemented:
- `/health`
- `/assistant` with NVIDIA NIM
- `/assistant` with Gemini API
- optional Firebase App Check verification
- strict CORS target for the public Vision origin

Prepared but intentionally disabled:
- `/generate`

Generation remains disabled until each provider adapter validates credentials, concrete model/workflow capabilities, request schema and spending policy.

## Setup

Requirements:
- Firebase CLI authenticated to the Firebase project you want to use;
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

Set secrets:

```bash
firebase functions:secrets:set NVIDIA_API_KEY
firebase functions:secrets:set GEMINI_API_KEY
```

Set runtime parameters when prompted/deploying:

```text
VISION_ALLOWED_ORIGIN=https://lordjeferies.github.io
VISION_REQUIRE_APP_CHECK=false
```

Deploy:

```bash
cd ..
firebase deploy --only functions
```

After deploy, copy the HTTPS URL of `visionGateway` into Vision → Settings → Vision Cloud Gateway.

## Production hardening

Before treating the public gateway as production-ready:
- enable Firebase Auth if account-level access is needed;
- configure Firebase App Check for the web app;
- set `VISION_REQUIRE_APP_CHECK=true`;
- add request/rate quotas;
- keep provider secrets only in Secret Manager;
- add provider-specific generation adapters behind explicit spend confirmation;
- persist long-running generation as jobs rather than holding a browser request open.

## Why Firebase is optional

Vision Core does not depend on Firebase. Prompt Studio, fichas, XRoll planning, storyboard, carousel and local project work continue to operate offline. Firebase is only a cloud bridge for shared/synced/AI-backed capabilities.
