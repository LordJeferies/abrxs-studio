#!/bin/bash
set -Eeuo pipefail

ROOT="${ABRXS_STUDIO_ROOT:-$HOME/Downloads/abrxs-studio}"
cd "$ROOT"

git fetch origin --prune
git checkout main
if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: local changes detected. Run the sync commands provided before this helper."
  git status --short
  exit 1
fi
git pull --ff-only origin main

npm install --package-lock=false
npm run vision:typecheck
npm run vision:smoke
npm run vision:mcp:smoke
npm run vision:build
npm run vision:desktop:check
npm run vision:desktop:build

APP="$(find "$ROOT/apps/vision/src-tauri/target/release/bundle/macos" -maxdepth 1 -type d -name '*.app' -print -quit 2>/dev/null || true)"
if [ -n "$APP" ]; then
  mkdir -p "$HOME/Applications"
  DEST="$HOME/Applications/Abrxs Vision Art Creator.app"
  rm -rf "$DEST"
  cp -R "$APP" "$DEST"
  xattr -dr com.apple.quarantine "$DEST" 2>/dev/null || true
  codesign --verify --deep --strict "$DEST" 2>/dev/null || true
  open "$DEST"
  echo "Installed: $DEST"
fi

if command -v gh >/dev/null 2>&1; then
  if ! gh api repos/LordJeferies/abrxs-studio/pages >/dev/null 2>&1; then
    echo "Enabling GitHub Pages for Actions deployments..."
    gh api -X POST repos/LordJeferies/abrxs-studio/pages -f build_type=workflow >/dev/null
  fi

  gh workflow run vision-pages.yml --repo LordJeferies/abrxs-studio
  sleep 4
  RUN_ID="$(gh run list --repo LordJeferies/abrxs-studio --workflow vision-pages.yml --event workflow_dispatch --limit 1 --json databaseId --jq '.[0].databaseId' 2>/dev/null || true)"
  if [ -n "$RUN_ID" ] && [ "$RUN_ID" != "null" ]; then
    gh run watch "$RUN_ID" --repo LordJeferies/abrxs-studio --exit-status
  else
    echo "Pages workflow requested; open Actions if you want to inspect its status."
  fi
else
  echo "GitHub CLI not found. Install/authenticate gh to enable and publish Pages from this helper."
fi

echo ""
echo "Vision validation complete."
echo "Repo:  https://github.com/LordJeferies/abrxs-studio"
echo "PWA:   https://lordjeferies.github.io/abrxs-studio/vision/"
echo "Guide: https://lordjeferies.github.io/abrxs-studio/vision/guide.html"
