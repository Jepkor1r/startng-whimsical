#!/usr/bin/env bash
# Rebuild assets/vendor/three-subset.min.js (only needed when changing the
# Three.js version or the exports in tools/three-subset.js).
# Dev-only: uses a throwaway folder, nothing is added to the site's deps.
set -euo pipefail
THREE_VERSION="0.186.1"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

(cd "$WORK" && npm init -y >/dev/null && npm install --ignore-scripts --no-audit --no-fund "three@$THREE_VERSION" esbuild@0.25 >/dev/null)

NODE_PATH="$WORK/node_modules" "$WORK/node_modules/.bin/esbuild" "$ROOT/tools/three-subset.js" \
  --bundle --format=esm --minify --target=es2020 --legal-comments=eof \
  --outfile="$ROOT/assets/vendor/three-subset.min.js"

cp "$WORK/node_modules/three/LICENSE" "$ROOT/assets/vendor/three.LICENSE"
echo "Built three@$THREE_VERSION subset → assets/vendor/three-subset.min.js"
