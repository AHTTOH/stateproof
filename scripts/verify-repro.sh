#!/usr/bin/env bash
# Reviewer reproduction check: fresh clone -> install -> tests -> typecheck -> web build.
# Needs only Node >= 24.11 and git. The Compact compiler is optional (artifacts are committed);
# pass --compile to also rebuild them with compactc 0.31.1.
#   bash scripts/verify-repro.sh [repo-url] [--compile]
set -euo pipefail

REPO_URL="${1:-}"
if [ -z "$REPO_URL" ] || [ "$REPO_URL" = "--compile" ]; then
  echo "usage: bash scripts/verify-repro.sh <repo-url> [--compile]" >&2
  exit 1
fi
COMPILE="${2:-}"

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 24 ]; then
  echo "Node 24+ required, found $(node -v)" >&2
  exit 1
fi

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
echo "== clone into $WORK"
git clone --depth 1 "$REPO_URL" "$WORK/stateproof"
cd "$WORK/stateproof"

echo "== npm ci"
npm ci --no-audit --no-fund

if [ "$COMPILE" = "--compile" ]; then
  echo "== compile (compactc 0.31.1)"
  npm run compile
fi

echo "== tests"
npm test

echo "== typecheck"
npm run typecheck

echo "== web build (preprod)"
STATEPROOF_NETWORK=preprod npm run build -w @stateproof/web

echo "== OK: clone, install, tests, typecheck and web build all passed"
