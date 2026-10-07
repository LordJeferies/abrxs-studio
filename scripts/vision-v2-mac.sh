#!/bin/bash
set -Eeuo pipefail

ROOT="${ABRXS_STUDIO_ROOT:-$HOME/Downloads/abrxs-studio}"
REPO="LordJeferies/abrxs-studio"
WITH_DESKTOP=0
AUTO_STASH=""

if [ "${1:-}" = "--desktop" ]; then
  WITH_DESKTOP=1
fi

if [ ! -d "$ROOT/.git" ]; then
  echo "Repo not found at: $ROOT"
  echo "Clone it first:"
  echo "git clone git@github.com:LordJeferies/abrxs-studio.git \"$ROOT\""
  exit 1
fi

cd "$ROOT"
git config core.fileMode false

echo "== Abrxs Vision V2 =="
echo "Syncing main..."
git fetch origin --prune
git checkout main

if [ -n "$(git status --porcelain)" ]; then
  AUTO_STASH="pre-vision-v2-$(date +%Y%m%d-%H%M%S)"
  echo "Saving local changes safely in stash: $AUTO_STASH"
  git stash push -u -m "$AUTO_STASH" >/dev/null
fi

git pull --ff-only origin main

echo "Installing dependencies..."
npm install --package-lock=false

echo "Validating Vision V2..."
npm run vision:typecheck
npm run vision:smoke
npm run vision:v2:smoke
npm run vision:mcp:smoke
npm run vision:pro:mcp:smoke
npm run vision:build

echo "PWA build OK."

if [ "$WITH_DESKTOP" -eq 1 ]; then
  if ! command -v cargo >/dev/null 2>&1; then
    echo "Rust/Cargo is not available. PWA is ready; desktop build skipped."
  else
    echo "Building optional Tauri desktop wrapper..."
    npm run vision:desktop:check
    npm run vision:desktop:build
    APP="$(find "$ROOT/apps/vision/src-tauri/target/release/bundle/macos" -maxdepth 1 -type d -name '*.app' -print -quit 2>/dev/null || true)"
    if [ -n "$APP" ]; then
      DEST="$HOME/Applications/Abrxs Vision Art Creator.app"
      ZIP="$ROOT/dist/vision/Abrxs-Vision-Art-Creator-V2-macOS.zip"
      mkdir -p "$HOME/Applications" "$ROOT/dist/vision"
      rm -rf "$DEST" "$ZIP"
      ditto "$APP" "$DEST"
      xattr -dr com.apple.quarantine "$DEST" 2>/dev/null || true
      ditto -c -k --sequesterRsrc --keepParent "$APP" "$ZIP"
      echo "Desktop app: $DEST"
      echo "Desktop ZIP: $ZIP"
    fi
  fi
fi

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  echo "Publishing Vision PWA through GitHub Pages..."
  if ! gh api "repos/$REPO/pages" >/dev/null 2>&1; then
    gh api -X POST "repos/$REPO/pages" -f build_type=workflow >/dev/null
  fi
  gh workflow run vision-pages.yml --repo "$REPO" || true
  sleep 3
  RUN_ID="$(gh run list --repo "$REPO" --workflow vision-pages.yml --limit 1 --json databaseId --jq '.[0].databaseId' 2>/dev/null || true)"
  if [ -n "$RUN_ID" ] && [ "$RUN_ID" != "null" ]; then
    gh run watch "$RUN_ID" --repo "$REPO" --exit-status
  fi
else
  echo "GitHub CLI is not authenticated; local V2 is ready but Pages was not manually triggered."
fi

echo ""
echo "Vision V2 ready."
echo "PWA:   https://lordjeferies.github.io/abrxs-studio/vision/"
echo "Guide: https://lordjeferies.github.io/abrxs-studio/vision/guide.html"
echo "Repo:  https://github.com/$REPO"
echo "Local dev: npm run vision:dev"

if [ -n "$AUTO_STASH" ]; then
  echo ""
  echo "Previous local changes are safe in stash: $AUTO_STASH"
  echo "Review later with: git stash list"
fi
