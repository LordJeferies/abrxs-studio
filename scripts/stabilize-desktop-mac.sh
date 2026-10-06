#!/bin/bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

INSTALL=0
COMMIT_LOCKS=0
for arg in "$@"; do
  case "$arg" in
    --install) INSTALL=1 ;;
    --commit-locks) COMMIT_LOCKS=1 ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

fail() {
  echo ""
  echo "ERROR: $*" >&2
  exit 1
}

step() {
  echo ""
  echo "=============================================================="
  echo " $*"
  echo "=============================================================="
  echo ""
}

[ "$(uname -s)" = "Darwin" ] || fail "This script is for macOS."
command -v git >/dev/null || fail "git is required"
command -v node >/dev/null || fail "Node is required"
command -v npm >/dev/null || fail "npm is required"
command -v rustc >/dev/null || fail "Rust is required"
command -v cargo >/dev/null || fail "Cargo is required"
command -v xcode-select >/dev/null || fail "Xcode command line tools are required"

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 20 ] || [ "$NODE_MAJOR" -ge 25 ]; then
  fail "Node 20-24 required; current: $(node -v)"
fi

if ! git diff --quiet -- . ':!package-lock.json' ':!apps/desktop/src-tauri/Cargo.lock'; then
  fail "Tracked source changes exist. Commit or stash them before running the stabilizer."
fi

step "1/11 · STOPPING STALE DEV PROCESSES"
if command -v lsof >/dev/null 2>&1; then
  PIDS="$(lsof -ti tcp:4173 2>/dev/null || true)"
  if [ -n "$PIDS" ]; then
    echo "$PIDS" | xargs kill -TERM 2>/dev/null || true
    sleep 1
    PIDS="$(lsof -ti tcp:4173 2>/dev/null || true)"
    [ -z "$PIDS" ] || echo "$PIDS" | xargs kill -KILL 2>/dev/null || true
  fi
fi
pkill -x "Abrxs Studio" >/dev/null 2>&1 || true

echo "Port 4173 and Abrxs Studio process are clear."

step "2/11 · SYNCING MAIN"
git fetch origin --prune
git checkout main
git pull --rebase origin main

step "3/11 · LOCKING JAVASCRIPT DEPENDENCIES"
npm install --package-lock-only
[ -s package-lock.json ] || fail "package-lock.json was not generated"

step "4/11 · CLEAN NPM INSTALL"
rm -rf node_modules apps/web/node_modules apps/desktop/node_modules
npm ci

step "5/11 · LOCKING RUST DEPENDENCIES"
cargo generate-lockfile --manifest-path apps/desktop/src-tauri/Cargo.toml
[ -s apps/desktop/src-tauri/Cargo.lock ] || fail "Cargo.lock was not generated"

step "6/11 · PREPARING DESKTOP ASSETS"
chmod +x scripts/*.sh
./scripts/ensure-desktop-assets.sh
for file in \
  apps/desktop/src-tauri/icons/icon.png \
  apps/desktop/src-tauri/icons/icon.icns \
  apps/desktop/src-tauri/icons/icon.ico \
  apps/desktop/src-tauri/icons/32x32.png \
  apps/desktop/src-tauri/icons/128x128.png \
  apps/desktop/src-tauri/icons/128x128@2x.png; do
  [ -s "$file" ] || fail "Missing generated asset: $file"
done

step "7/11 · VALIDATING FRONTEND"
npm run typecheck
npm run build:web
[ -s apps/web/dist/index.html ] || fail "Web build did not produce apps/web/dist/index.html"

step "8/11 · VALIDATING NATIVE CRATE"
cargo check --locked --manifest-path apps/desktop/src-tauri/Cargo.toml
npm run doctor

step "9/11 · BUILDING NATIVE APP"
npm run desktop:build
BUNDLE_DIR="$ROOT/apps/desktop/src-tauri/target/release/bundle"
APP="$(find "$BUNDLE_DIR/macos" -maxdepth 1 -name '*.app' -print -quit 2>/dev/null || true)"
[ -n "$APP" ] || fail "Tauri build completed but no .app bundle was found"
[ -d "$APP/Contents" ] || fail "Generated .app bundle is incomplete: $APP"

step "10/11 · VALIDATING BUNDLE"
plutil -lint "$APP/Contents/Info.plist" >/dev/null || fail "Invalid app Info.plist"
MAIN_EXEC="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$APP/Contents/Info.plist")"
[ -x "$APP/Contents/MacOS/$MAIN_EXEC" ] || fail "App executable is missing"
codesign --force --deep --sign - "$APP" >/dev/null 2>&1 || fail "Ad-hoc codesign failed"
codesign --verify --deep --strict "$APP" || fail "codesign verification failed"

echo "Validated app: $APP"

if [ "$INSTALL" -eq 1 ]; then
  INSTALL_DIR="$HOME/Applications"
  DEST="$INSTALL_DIR/Abrxs Studio.app"
  mkdir -p "$INSTALL_DIR"
  rm -rf "$DEST"
  ditto "$APP" "$DEST"
  xattr -dr com.apple.quarantine "$DEST" >/dev/null 2>&1 || true
  codesign --verify --deep --strict "$DEST" || fail "Installed app failed signature verification"
  echo "Installed: $DEST"
fi

step "11/11 · REPRODUCIBILITY"
if [ "$COMMIT_LOCKS" -eq 1 ]; then
  git add package-lock.json apps/desktop/src-tauri/Cargo.lock
  if ! git diff --cached --quiet; then
    git commit -m "chore(build): lock desktop dependencies"
    git push origin main
  else
    echo "Lockfiles already match the repository."
  fi
else
  echo "Lockfiles generated locally. To commit them later:"
  echo "  git add package-lock.json apps/desktop/src-tauri/Cargo.lock"
  echo "  git commit -m 'chore(build): lock desktop dependencies'"
  echo "  git push origin main"
fi

if [ "$INSTALL" -eq 1 ]; then
  open "$HOME/Applications/Abrxs Studio.app"
fi

echo ""
echo "=============================================================="
echo " ABRXS STUDIO DESKTOP · STABLE BUILD COMPLETE"
echo "=============================================================="
echo "App bundle: $APP"
[ "$INSTALL" -eq 1 ] && echo "Installed: $HOME/Applications/Abrxs Studio.app"
echo "Node: $(node -v)"
echo "Rust: $(rustc --version)"
echo "Commit: $(git rev-parse --short HEAD)"
echo ""
