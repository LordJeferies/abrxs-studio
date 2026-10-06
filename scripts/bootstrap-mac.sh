#!/bin/bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo ""
echo "=============================================================="
echo " ABRXS STUDIO · MAC BOOTSTRAP"
echo "=============================================================="
echo ""

command -v git >/dev/null || { echo "ERROR: git missing"; exit 1; }
command -v node >/dev/null || { echo "ERROR: Node 20+ missing. Install with: brew install node"; exit 1; }
command -v npm >/dev/null || { echo "ERROR: npm missing"; exit 1; }

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "ERROR: Node 20+ required; current: $(node -v)"
  exit 1
fi

echo "Node: $(node -v)"
echo "npm:  $(npm -v)"
echo "Git:  $(git --version)"

echo ""
echo "[1/3] Installing workspace dependencies..."
npm install

echo ""
echo "[2/3] Type checking..."
npm run typecheck

echo ""
echo "[3/3] Running doctor..."
npm run doctor

echo ""
echo "READY"
echo "Run: npm run dev"
echo ""
