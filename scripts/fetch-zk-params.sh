#!/usr/bin/env bash
# Download Midnight's public BLS parameters into .zk-params/ from the latest successful
# "ZK params and proving time" workflow run. Use this where the network blocks the public
# S3 bucket (the web build and local proving read .zk-params/ first).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_ID="$(gh run list --workflow zk-params.yml --status success --limit 1 --json databaseId --jq '.[0].databaseId // empty')"
if [ -z "$RUN_ID" ]; then
  echo "No successful zk-params run. Trigger it: gh workflow run zk-params.yml --ref v2" >&2
  exit 1
fi
mkdir -p "$ROOT/.zk-params"
gh run download "$RUN_ID" --name zk-params --dir "$ROOT/.zk-params"
ls -la "$ROOT/.zk-params"
