#!/bin/bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

INSTALL=0
OPEN_APP=0
for arg in "$@"; do
  case "$arg" in
    --install) INSTALL=1 ;;
    --open) OPEN_APP=1 ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

[ "$(uname -s)" = "Darwin" ] || fail "macOS is required to build the .app bundle"
command -v node >/dev/null || fail "Node is required"
command -v npm >/dev/null || fail "npm is required"
command -v rustc >/dev/null || fail "Rust is required"
command -v cargo >/dev/null || fail "Cargo is required"
command -v xcode-select >/dev/null || fail "Xcode command line tools are required"
xcode-select -p >/dev/null 2>&1 || fail "Xcode command line tools are not configured"

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 20 ] || [ "$NODE_MAJOR" -ge 25 ]; then
  fail "Node 20-24 required; current: $(node -v)"
fi

echo "Abrxs Vision Art Creator · macOS build"
echo "Node: $(node -v)"
echo "Rust: $(rustc --version)"

npm install
npm run vision:typecheck
npm run vision:build
npm run vision:desktop:check
npm run vision:desktop:build

BUNDLE_ROOT="$ROOT/apps/vision/src-tauri/target/release/bundle"
APP="$(find "$BUNDLE_ROOT/macos" -maxdepth 1 -name '*.app' -print -quit 2>/dev/null || true)"
[ -n "$APP" ] || fail "Tauri build finished but no macOS .app was found"
[ -d "$APP/Contents" ] || fail "Generated app bundle is incomplete"

plutil -lint "$APP/Contents/Info.plist" >/dev/null || fail "Invalid Info.plist"
EXECUTABLE="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$APP/Contents/Info.plist")"
[ -x "$APP/Contents/MacOS/$EXECUTABLE" ] || fail "Native executable is missing"

codesign --force --deep --sign - "$APP" >/dev/null 2>&1 || fail "Ad-hoc codesign failed"
codesign --verify --deep --strict "$APP" || fail "Codesign verification failed"

DIST="$ROOT/dist/vision"
mkdir -p "$DIST"
ZIP="$DIST/Abrxs-Vision-Art-Creator-macOS.zip"
rm -f "$ZIP"
ditto -c -k --sequesterRsrc --keepParent "$APP" "$ZIP"
[ -s "$ZIP" ] || fail "ZIP package was not created"

if [ "$INSTALL" -eq 1 ]; then
  DEST="$HOME/Applications/Abrxs Vision Art Creator.app"
  mkdir -p "$HOME/Applications"
  rm -rf "$DEST"
  ditto "$APP" "$DEST"
  xattr -dr com.apple.quarantine "$DEST" >/dev/null 2>&1 || true
  codesign --verify --deep --strict "$DEST" || fail "Installed app failed validation"
  echo "Installed: $DEST"
fi

if [ "$OPEN_APP" -eq 1 ]; then
  if [ "$INSTALL" -eq 1 ]; then
    open "$HOME/Applications/Abrxs Vision Art Creator.app"
  else
    open "$APP"
  fi
fi

echo ""
echo "BUILD COMPLETE"
echo "App: $APP"
echo "ZIP: $ZIP"
