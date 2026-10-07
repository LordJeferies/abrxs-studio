#!/usr/bin/env bash
set -euo pipefail

ROOT="${ABRXS_STUDIO_ROOT:-$HOME/Downloads/abrxs-studio}"
cd "$ROOT"

git config core.fileMode false

if [ -n "$(git status --porcelain)" ]; then
  STASH_NAME="pre-vision-v2-finalize-$(date +%Y%m%d-%H%M%S)"
  echo "Local changes detected. Saving them as stash: $STASH_NAME"
  git stash push -u -m "$STASH_NAME"
fi

git fetch origin --prune
git checkout main
git pull --ff-only origin main

npm install

npm run vision:typecheck
npm run vision:smoke
npm run vision:v2:smoke
npm run vision:assistant:smoke
npm run vision:mcp:smoke
npm run vision:pro:mcp:smoke
npm run vision:build
npm run vision:desktop:check
npm run vision:desktop:build

APP="$(find apps/vision/src-tauri/target/release/bundle/macos -maxdepth 1 -name '*.app' -print -quit)"
if [ -z "$APP" ]; then
  echo "Vision .app was not produced."
  exit 1
fi

mkdir -p dist/vision "$HOME/Applications"
ditto -c -k --sequesterRsrc --keepParent "$APP" dist/vision/Abrxs-Vision-Art-Creator-macOS.zip
rm -rf "$HOME/Applications/Abrxs Vision Art Creator.app"
ditto "$APP" "$HOME/Applications/Abrxs Vision Art Creator.app"
xattr -dr com.apple.quarantine "$HOME/Applications/Abrxs Vision Art Creator.app" 2>/dev/null || true

chmod +x scripts/vision-mcp-server.sh
MCP_SCRIPT="$ROOT/scripts/vision-mcp-server.sh"

if command -v codex >/dev/null 2>&1; then
  if ! codex mcp list 2>/dev/null | grep -q 'abrxs-vision'; then
    codex mcp add abrxs-vision -- "$MCP_SCRIPT" || true
  fi
fi

if command -v claude >/dev/null 2>&1; then
  if ! claude mcp list 2>/dev/null | grep -q 'abrxs-vision'; then
    claude mcp add --transport stdio --scope user abrxs-vision -- "$MCP_SCRIPT" || true
  fi
fi

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  gh workflow run vision-release.yml --ref main || true
  echo "Vision V2 Release workflow requested."
else
  echo "GitHub CLI is not authenticated; skipping release workflow trigger."
fi

open "$HOME/Applications/Abrxs Vision Art Creator.app"

echo
echo "Abrxs Vision V2 local validation complete."
echo "App: $HOME/Applications/Abrxs Vision Art Creator.app"
echo "ZIP: $ROOT/dist/vision/Abrxs-Vision-Art-Creator-macOS.zip"
echo "PWA: https://lordjeferies.github.io/abrxs-studio/vision/"
echo "Product page: https://lordjeferies.github.io/abrxs-studio/vision/about.html"
echo "Latest release: https://github.com/LordJeferies/abrxs-studio/releases/latest"
echo "Latest macOS download: https://github.com/LordJeferies/abrxs-studio/releases/latest/download/Abrxs-Vision-Art-Creator-macOS.zip"
