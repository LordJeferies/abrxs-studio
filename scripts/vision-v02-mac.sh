#!/bin/bash
set -Eeuo pipefail

ROOT="${ABRXS_STUDIO_ROOT:-$HOME/Downloads/abrxs-studio}"
cd "$ROOT"

git fetch origin --prune
git checkout main
if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: local changes detected. Commit or stash them before running this release helper."
  git status --short
  exit 1
fi
git pull --ff-only origin main

npm install
npm run vision:typecheck
npm run vision:smoke
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
  gh workflow run vision-pages.yml --repo LordJeferies/abrxs-studio
  echo "GitHub Pages workflow requested."
else
  echo "GitHub CLI not found; push-triggered Pages deployment may already be running."
fi

echo "Repo:  https://github.com/LordJeferies/abrxs-studio"
echo "PWA:   https://lordjeferies.github.io/abrxs-studio/vision/"
echo "Guide: https://lordjeferies.github.io/abrxs-studio/vision/guide.html"
