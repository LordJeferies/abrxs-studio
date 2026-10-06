#!/bin/bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/apps/desktop/src-tauri/icons/app-icon.svg"
OUT="$ROOT/apps/desktop/src-tauri/icons"
STAMP="$OUT/.app-icon.sha256"

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

[ -f "$SRC" ] || fail "canonical desktop icon source is missing: $SRC"
command -v shasum >/dev/null 2>&1 || fail "shasum is required"
command -v npm >/dev/null 2>&1 || fail "npm is required"

mkdir -p "$OUT"
CURRENT_HASH="$(shasum -a 256 "$SRC" | awk '{print $1}')"
PREVIOUS_HASH="$(cat "$STAMP" 2>/dev/null || true)"

REQUIRED=(
  "$OUT/icon.png"
  "$OUT/icon.icns"
  "$OUT/icon.ico"
  "$OUT/32x32.png"
  "$OUT/128x128.png"
  "$OUT/128x128@2x.png"
)

NEEDS_GENERATION=0
if [ "$CURRENT_HASH" != "$PREVIOUS_HASH" ]; then
  NEEDS_GENERATION=1
fi
for file in "${REQUIRED[@]}"; do
  if [ ! -s "$file" ]; then
    NEEDS_GENERATION=1
    break
  fi
done

if [ "$NEEDS_GENERATION" -eq 1 ]; then
  echo "Generating Tauri icon set from canonical SVG..."
  (
    cd "$ROOT"
    npm run icon -w @abrxs/studio-desktop
  )
fi

for file in "${REQUIRED[@]}"; do
  [ -s "$file" ] || fail "Tauri icon generation did not produce: $file"
done

printf '%s\n' "$CURRENT_HASH" > "$STAMP"
echo "Desktop assets OK: $OUT"
