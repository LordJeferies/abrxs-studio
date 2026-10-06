#!/bin/bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/.legacy-sources"
mkdir -p "$DEST"

clone_or_update() {
  local repo="$1"
  local name="$2"
  local target="$DEST/$name"
  if [ -d "$target/.git" ]; then
    echo "Updating $repo"
    git -C "$target" fetch origin --prune
    git -C "$target" checkout main 2>/dev/null || true
    git -C "$target" pull --ff-only 2>/dev/null || true
  else
    echo "Cloning $repo"
    git clone --depth 1 "git@github.com:$repo.git" "$target"
  fi
}

clone_or_update "LordJeferies/Abrxs_os_v1" "Abrxs_os_v1"
clone_or_update "LordJeferies/Abrxs-Canter" "Abrxs-Canter"
clone_or_update "LordJeferies/editorial-os" "editorial-os"
clone_or_update "LordJeferies/editorial-emulator" "editorial-emulator"

echo ""
echo "Legacy sources available read-only for migration audit in:"
echo "$DEST"
