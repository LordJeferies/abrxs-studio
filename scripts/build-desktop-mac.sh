#!/bin/bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

INSTALL=0
if [ "${1:-}" = "--install" ]; then
  INSTALL=1
fi

"$ROOT/scripts/bootstrap-desktop-mac.sh"

echo ""
echo "=============================================================="
echo " ABRXS STUDIO · BUILD DESKTOP"
echo "=============================================================="
echo ""

npm run desktop:build

BUNDLE_DIR="$ROOT/apps/desktop/src-tauri/target/release/bundle"
APP="$(find "$BUNDLE_DIR/macos" -maxdepth 1 -name '*.app' -print -quit 2>/dev/null || true)"
DMG="$(find "$BUNDLE_DIR/dmg" -maxdepth 1 -name '*.dmg' -print -quit 2>/dev/null || true)"

echo ""
echo "Build outputs:"
[ -n "$APP" ] && echo "  App: $APP"
[ -n "$DMG" ] && echo "  DMG: $DMG"

if [ "$INSTALL" -eq 1 ]; then
  if [ -z "$APP" ]; then
    echo "ERROR: built .app was not found."
    exit 1
  fi

  INSTALL_DIR="$HOME/Applications"
  DEST="$INSTALL_DIR/Abrxs Studio.app"
  mkdir -p "$INSTALL_DIR"
  rm -rf "$DEST"
  cp -R "$APP" "$DEST"
  xattr -dr com.apple.quarantine "$DEST" >/dev/null 2>&1 || true

  echo ""
  echo "Installed: $DEST"
  echo "Opening Abrxs Studio..."
  open "$DEST"
fi

echo ""
echo "DONE"
echo ""
