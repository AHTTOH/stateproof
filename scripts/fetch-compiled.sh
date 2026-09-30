#!/usr/bin/env bash
# Replace packages/contract/src/managed/stateproof with the output of the latest
# successful "Compile contract" workflow run for the current commit's branch.
# Needs the GitHub CLI (gh) logged in. Use this on machines without the Compact compiler.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/packages/contract/src/managed/stateproof"
BRANCH="$(git -C "$ROOT" rev-parse --abbrev-ref HEAD)"
HEAD_SHA="$(git -C "$ROOT" rev-parse HEAD)"

RUN_ID="$(gh run list --workflow compile.yml --branch "$BRANCH" --status success --limit 20 \
  --json databaseId,headSha --jq "map(select(.headSha == \"$HEAD_SHA\")) | .[0].databaseId // empty")"
if [ -z "$RUN_ID" ]; then
  echo "No successful compile run for $HEAD_SHA on $BRANCH. Push the commit and wait for 'Compile contract'." >&2
  exit 1
fi

TMP="$(mktemp -d)"
gh run download "$RUN_ID" --name managed-stateproof --dir "$TMP"
rm -rf "$OUT"
mkdir -p "$OUT"
cp -R "$TMP"/. "$OUT"/
rm -rf "$TMP"
echo "managed/stateproof replaced with compile run $RUN_ID ($HEAD_SHA)"
