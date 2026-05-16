#!/usr/bin/env bash
# PrimeAxis Tech — one-command bootstrap for macOS / Linux / Git Bash / WSL.
# Run from inside the unpacked bundle's `source/` folder:
#   bash start.sh

set -euo pipefail
echo "▶ PrimeAxis Tech bootstrap"

need() { command -v "$1" >/dev/null 2>&1 || { echo "  ✗ Missing: $1  →  $2"; exit 1; }; }
need node "Install Node 24 from https://nodejs.org"
need pnpm "Install pnpm: npm install -g pnpm"
echo "  ✓ node $(node -v)  pnpm $(pnpm -v)"

if [ ! -f .env ]; then
  if [ -f ../.env.template ]; then
    cp ../.env.template .env
    echo "  ✓ Created .env from template — edit it now, then re-run this script."
    ${EDITOR:-nano} .env
  else
    echo "  ✗ No .env and no ../.env.template found."; exit 1
  fi
fi

set -a; . ./.env; set +a
echo "  ✓ Loaded .env into session"

echo "▶ Installing dependencies (pnpm install)…"
pnpm install

if [ -n "${DATABASE_URL:-}" ]; then
  echo "▶ Pushing DB schema…"
  pnpm --filter @workspace/db run push
else
  echo "  ⚠ DATABASE_URL not set — skipping db push"
fi

if [ -f ../sanity/dataset.ndjson ] && [ -n "${SANITY_API_TOKEN:-}" ]; then
  read -p "Restore Sanity dataset from ../sanity/dataset.ndjson? [y/N] " ans
  if [ "$ans" = "y" ]; then
    command -v sanity >/dev/null 2>&1 || npm install -g @sanity/cli
    sanity dataset import ../sanity/dataset.ndjson "${SANITY_DATASET:-production}" --replace
  fi
fi

echo "▶ Starting all three dev servers (Ctrl+C to stop)…"
trap 'kill 0' EXIT
pnpm --filter @workspace/api-server run dev &
pnpm --filter @workspace/primeaxis  run dev &
pnpm --filter @workspace/studio     run dev &
wait
