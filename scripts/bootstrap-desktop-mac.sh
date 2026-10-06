#!/bin/bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo ""
echo "=============================================================="
echo " ABRXS STUDIO · DESKTOP BOOTSTRAP (macOS)"
echo "=============================================================="
echo ""

if [ "$(uname -s)" != "Darwin" ]; then
  echo "ERROR: this bootstrap is for macOS."
  exit 1
fi

command -v node >/dev/null || { echo "ERROR: Node 20+ missing. Install with: brew install node"; exit 1; }
command -v npm >/dev/null || { echo "ERROR: npm missing"; exit 1; }
command -v git >/dev/null || { echo "ERROR: git missing"; exit 1; }

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "ERROR: Node 20+ required; current: $(node -v)"
  exit 1
fi

if ! xcode-select -p >/dev/null 2>&1; then
  echo "ERROR: Apple Command Line Tools are required."
  echo "Run: xcode-select --install"
  exit 1
fi

if ! command -v rustc >/dev/null 2>&1 || ! command -v cargo >/dev/null 2>&1; then
  echo "ERROR: Rust toolchain is required for the Desktop build."
  if command -v brew >/dev/null 2>&1; then
    echo "Run: brew install rust"
  else
    echo "Install Rust from https://rustup.rs"
  fi
  exit 1
fi

echo "Node:  $(node -v)"
echo "npm:   $(npm -v)"
echo "Rust:  $(rustc --version)"
echo "Cargo: $(cargo --version)"
echo "Xcode: $(xcode-select -p)"

echo ""
echo "[1/4] Installing workspace dependencies..."
npm install

echo ""
echo "[2/4] Checking shared frontend..."
npm run typecheck

echo ""
echo "[3/4] Checking native Desktop crate..."
npm run desktop:check

echo ""
echo "[4/4] Running Doctor..."
npm run doctor

echo ""
echo "READY"
echo "Run the native app in development with:"
echo "  npm run desktop:dev"
echo ""
