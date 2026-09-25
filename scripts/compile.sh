#!/usr/bin/env bash
# Compile the StateProof contract with the pinned Compact compiler.
# Output goes to packages/contract/src/managed/stateproof (committed, see .gitignore note).
# Refuses to run with any compiler other than the pinned one: 0.34+ targets ledger 9,
# which Preprod does not run yet (docs/decisions/2026-09-25-toolchain-and-workspace.md).
set -euo pipefail

REQUIRED_COMPILER="0.31.1"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTRACT_DIR="$ROOT/packages/contract"
SOURCE="src/stateproof.compact"
OUT="src/managed/stateproof"

if ! command -v compact >/dev/null 2>&1; then
  echo "compact CLI not found. Install: https://docs.midnight.network/getting-started/installation" >&2
  echo "Then run: compact update $REQUIRED_COMPILER" >&2
  exit 1
fi

ACTUAL_COMPILER="$(compact compile --version)"
if [ "$ACTUAL_COMPILER" != "$REQUIRED_COMPILER" ]; then
  echo "Compact compiler $ACTUAL_COMPILER found, $REQUIRED_COMPILER required." >&2
  echo "Run: compact update $REQUIRED_COMPILER" >&2
  exit 1
fi

cd "$CONTRACT_DIR"
if [ "${1:-}" = "--skip-zk" ]; then
  compact compile --skip-zk "$SOURCE" "$OUT"
else
  compact compile "$SOURCE" "$OUT"
fi
echo "Compiled $SOURCE with compactc $ACTUAL_COMPILER into packages/contract/$OUT"
