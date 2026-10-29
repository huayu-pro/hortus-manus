#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "node not found. Install Node 22+ first." >&2
  exit 1
fi
if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found. Install pnpm first (corepack enable)." >&2
  exit 1
fi

if [ ! -d node_modules ] || [ ! -d apps/web/node_modules ] || [ ! -d apps/api/node_modules ]; then
  echo "[hortus] installing dependencies…"
  pnpm install
fi

echo "[hortus] building web…"
pnpm build

echo "[hortus] starting local server…"
export PORT="${PORT:-8787}"
# Local art demo: a generous collect budget (override with HORTUS_RL_COLLECT).
export HORTUS_RL_COLLECT="${HORTUS_RL_COLLECT:-60}"
exec pnpm -F @hortus/api start