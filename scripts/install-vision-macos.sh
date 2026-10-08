#!/usr/bin/env bash
set -euo pipefail

REPO="LordJeferies/abrxs-studio"
ASSET="Abrxs-Vision-Art-Creator-macOS-Apple-Silicon-v2.6.zip"
CHECKSUM="Abrxs-Vision-Art-Creator-macOS-Apple-Silicon-v2.6.sha256"
DEST="$HOME/Applications/Abrxs Vision Art Creator.app"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

if [ "$(uname -s)" != "Darwin" ]; then
  echo "ERROR: este instalador es solo para macOS."
  exit 1
fi

if [ "$(uname -m)" != "arm64" ]; then
  echo "ERROR: esta build es para Apple Silicon (M1/M2/M3/M4/M5)."
  echo "Arquitectura detectada: $(uname -m)"
  exit 1
fi

echo "Abrxs Vision V2.6 · instalacion verificada para Apple Silicon"
echo

echo "[1/6] Descargando release..."
curl --fail --location --silent --show-error \
  "https://github.com/${REPO}/releases/latest/download/${ASSET}" \
  -o "$TMP/$ASSET"

curl --fail --location --silent --show-error \
  "https://github.com/${REPO}/releases/latest/download/${CHECKSUM}" \
  -o "$TMP/$CHECKSUM"

echo "[2/6] Verificando SHA-256..."
(
  cd "$TMP"
  shasum -a 256 -c "$CHECKSUM"
)

echo "[3/6] Extrayendo aplicacion..."
mkdir -p "$TMP/unpacked"
ditto -x -k "$TMP/$ASSET" "$TMP/unpacked"
APP="$(find "$TMP/unpacked" -maxdepth 2 -name '*.app' -type d -print -quit)"

if [ -z "$APP" ]; then
  echo "ERROR: el ZIP no contiene una aplicacion .app."
  exit 1
fi

echo "[4/6] Verificando firma del bundle..."
codesign --verify --deep --strict --verbose=2 "$APP"

BIN="$(find "$APP/Contents/MacOS" -maxdepth 1 -type f -perm -111 -print -quit)"
if [ -z "$BIN" ]; then
  echo "ERROR: no se encontro el ejecutable principal."
  exit 1
fi

ARCH="$(file "$BIN")"
echo "$ARCH"
echo "$ARCH" | grep -q 'arm64' || {
  echo "ERROR: la aplicacion descargada no es Apple Silicon."
  exit 1
}

echo "[5/6] Instalando en ~/Applications..."
mkdir -p "$HOME/Applications"
rm -rf "$DEST.tmp" "$DEST"
ditto "$APP" "$DEST.tmp"
mv "$DEST.tmp" "$DEST"

# El archivo fue descargado de una release conocida y su SHA-256 ya fue
# verificado arriba. Eliminamos cuarentena solo de este bundle concreto.
xattr -dr com.apple.quarantine "$DEST" 2>/dev/null || true
codesign --verify --deep --strict --verbose=2 "$DEST"

echo "[6/6] Abriendo Abrxs Vision..."
open "$DEST"

echo
echo "INSTALACION COMPLETADA"
echo "$DEST"
