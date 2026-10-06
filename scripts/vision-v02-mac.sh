#!/bin/bash
set -Eeuo pipefail

ROOT="${ABRXS_STUDIO_ROOT:-$HOME/Downloads/abrxs-studio}"
REPO="LordJeferies/abrxs-studio"
AUTO_STASH=""

cd "$ROOT"

echo "== Abrxs Vision V0.2 · macOS release helper =="

git config core.fileMode false

git fetch origin --prune
git checkout main

if [ -n "$(git status --porcelain)" ]; then
  AUTO_STASH="abrxs-vision-auto-$(date +%Y%m%d-%H%M%S)"
  echo "Local changes detected; saving them safely in stash: $AUTO_STASH"
  git stash push -u -m "$AUTO_STASH" >/dev/null
fi

git pull --ff-only origin main

echo "Installing workspace dependencies..."
npm install --package-lock=false

if [ ! -x "$ROOT/node_modules/.bin/tsx" ]; then
  echo "ERROR: tsx was not installed at $ROOT/node_modules/.bin/tsx"
  echo "Try: rm -rf node_modules && npm install --package-lock=false"
  exit 1
fi

if ! command -v cargo >/dev/null 2>&1; then
  echo "ERROR: Rust/Cargo is required for the macOS desktop build."
  echo "Install Rust, reopen Terminal, and run this helper again."
  exit 1
fi

npm run vision:typecheck
npm run vision:smoke
npm run vision:mcp:smoke
npm run vision:build
npm run vision:desktop:check
npm run vision:desktop:build

APP="$(find "$ROOT/apps/vision/src-tauri/target/release/bundle/macos" -maxdepth 1 -type d -name '*.app' -print -quit 2>/dev/null || true)"
ZIP="$ROOT/dist/vision/Abrxs-Vision-Art-Creator-macOS.zip"

if [ -n "$APP" ]; then
  mkdir -p "$HOME/Applications" "$ROOT/dist/vision"
  DEST="$HOME/Applications/Abrxs Vision Art Creator.app"
  rm -rf "$DEST" "$ZIP"
  cp -R "$APP" "$DEST"
  xattr -dr com.apple.quarantine "$DEST" 2>/dev/null || true
  codesign --verify --deep --strict "$DEST" 2>/dev/null || true
  ditto -c -k --sequesterRsrc --keepParent "$APP" "$ZIP"
  open "$DEST"
  echo "Installed app: $DEST"
  echo "Local ZIP:     $ZIP"
else
  echo "ERROR: desktop build finished but no .app bundle was found."
  exit 1
fi

if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    if ! gh api "repos/$REPO/pages" >/dev/null 2>&1; then
      echo "Enabling GitHub Pages for Actions deployments..."
      gh api -X POST "repos/$REPO/pages" -f build_type=workflow >/dev/null
    else
      gh api -X PUT "repos/$REPO/pages" -f build_type=workflow >/dev/null 2>&1 || true
    fi

    echo "Starting Vision Pages deployment..."
    gh workflow run vision-pages.yml --repo "$REPO"
    sleep 4
    RUN_ID="$(gh run list --repo "$REPO" --workflow vision-pages.yml --event workflow_dispatch --limit 1 --json databaseId --jq '.[0].databaseId' 2>/dev/null || true)"

    if [ -n "$RUN_ID" ] && [ "$RUN_ID" != "null" ]; then
      gh run watch "$RUN_ID" --repo "$REPO" --exit-status
    else
      echo "Pages workflow requested; inspect GitHub Actions if the run is not listed yet."
    fi
  else
    echo "GitHub CLI is installed but not authenticated. Run: gh auth login"
  fi
else
  echo "GitHub CLI not found. Install/authenticate gh to enable and publish Pages from this helper."
fi

echo ""
echo "Vision validation complete."
echo "Repo:  https://github.com/$REPO"
echo "PWA:   https://lordjeferies.github.io/abrxs-studio/vision/"
echo "Guide: https://lordjeferies.github.io/abrxs-studio/vision/guide.html"
echo "ZIP:   $ZIP"

if [ -n "$AUTO_STASH" ]; then
  echo ""
  echo "Your previous local changes are safe in stash: $AUTO_STASH"
  echo "Review them later with: git stash list"
  echo "Restore only when wanted with: git stash pop"
fi
