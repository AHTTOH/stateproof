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

COMPACT_BIN="$(command -v compact || true)"
if [ -z "$COMPACT_BIN" ]; then
  echo "compact CLI not found. Install: https://docs.midnight.network/getting-started/installation" >&2
  echo "Then run: compact update $REQUIRED_COMPILER" >&2
  exit 1
fi
# On Windows, Git Bash finds C:\Windows\System32\compact.exe (NTFS compression), not Midnight's CLI.
# The Compact compiler ships for Linux and macOS; on Windows run this script inside WSL.
case "$(printf '%s' "$COMPACT_BIN" | tr '[:upper:]' '[:lower:]')" in
  */windows/system32/*)
    echo "Found $COMPACT_BIN, which is the Windows file compression tool, not the Midnight Compact CLI." >&2
    echo "The Compact compiler runs on Linux and macOS. On Windows, run scripts/compile.sh inside WSL." >&2
    exit 1
    ;;
esac

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
