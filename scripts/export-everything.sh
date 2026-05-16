#!/usr/bin/env bash
# PrimeAxis Tech — single-command full-project exporter.
# Produces ONE tarball at exports/primeaxis-tech-FULL-<timestamp>.tar.gz containing:
#   1. Full source code (no node_modules, no .git, no caches)
#   2. Sanity dataset NDJSON export (all articles, categories, authors)
#   3. List of every Cloudinary asset URL used by the site
#   4. .env.template with every required secret name
#   5. Brand assets
#   6. RESTORE.md with rehydration instructions
#
# Usage:
#   bash scripts/export-everything.sh
#
# Required env (already set in this Repl):
#   SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN

set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$PWD"
TS="$(date +%Y%m%d-%H%M%S)"
STAGE="$ROOT/exports/_stage-$TS"
OUT="$ROOT/exports/primeaxis-tech-FULL-$TS.tar.gz"
mkdir -p "$STAGE" "$ROOT/exports"

echo "▶ Staging at $STAGE"

# 1. SOURCE CODE -------------------------------------------------------------
echo "▶ [1/6] Copying source code…"
mkdir -p "$STAGE/source"
tar -cf - \
  --exclude='./node_modules' --exclude='*/node_modules' \
  --exclude='./.git' --exclude='./exports' --exclude='./.local' \
  --exclude='./.cache' --exclude='*/dist' --exclude='*/.next' \
  --exclude='*/build' --exclude='./.pnpm-store' --exclude='*.log' \
  . | tar -xf - -C "$STAGE/source"

# 2. SANITY DATASET ----------------------------------------------------------
echo "▶ [2/6] Exporting Sanity dataset (articles, categories, authors)…"
mkdir -p "$STAGE/sanity"
PROJECT_ID="${SANITY_PROJECT_ID:-jyppkgsk}"
DATASET="${SANITY_DATASET:-production}"
if [ -z "${SANITY_API_TOKEN:-}" ]; then
  echo "  ⚠ SANITY_API_TOKEN not set — skipping dataset export"
else
  curl -fsSL \
    -H "Authorization: Bearer $SANITY_API_TOKEN" \
    "https://$PROJECT_ID.api.sanity.io/v2024-01-01/data/export/$DATASET" \
    -o "$STAGE/sanity/dataset.ndjson"
  COUNT=$(wc -l < "$STAGE/sanity/dataset.ndjson")
  echo "  ✓ Exported $COUNT documents → sanity/dataset.ndjson"
fi

# 3. CLOUDINARY ASSET MANIFEST ----------------------------------------------
echo "▶ [3/6] Building Cloudinary asset manifest…"
mkdir -p "$STAGE/cloudinary"
node -e "
const fs=require('fs');
const lines=fs.readFileSync('$STAGE/sanity/dataset.ndjson','utf8').split('\n').filter(Boolean);
const urls=new Set();
for(const l of lines){
  try{const d=JSON.parse(l); if(d.heroImageUrl) urls.add(d.heroImageUrl);}catch{}
}
fs.writeFileSync('$STAGE/cloudinary/asset-urls.txt',[...urls].sort().join('\n'));
console.log('  ✓ '+urls.size+' Cloudinary URLs → cloudinary/asset-urls.txt');
"

# Optional: download every Cloudinary image to a local mirror (pass DOWNLOAD_IMAGES=1)
if [ "${DOWNLOAD_IMAGES:-0}" = "1" ]; then
  echo "  ▶ DOWNLOAD_IMAGES=1 — mirroring images locally…"
  mkdir -p "$STAGE/cloudinary/images"
  while read -r u; do
    [ -z "$u" ] && continue
    name=$(basename "$u")
    curl -fsSL "$u" -o "$STAGE/cloudinary/images/$name" || echo "    ✗ $u"
  done < "$STAGE/cloudinary/asset-urls.txt"
  echo "  ✓ mirrored $(ls "$STAGE/cloudinary/images" | wc -l) images"
fi

# 4. .ENV TEMPLATE -----------------------------------------------------------
echo "▶ [4/6] Writing .env.template…"
cat > "$STAGE/.env.template" <<'EOF'
# PrimeAxis Tech — required environment variables
# Fill in real values, save as .env at repo root, then `source .env` (or use a loader).

# Postgres connection (for the api-server / drizzle)
DATABASE_URL=postgres://USER:PASS@HOST:5432/DB

# Sanity CMS
SANITY_PROJECT_ID=jyppkgsk
SANITY_DATASET=production
SANITY_API_TOKEN=PASTE_YOUR_SANITY_WRITE_TOKEN

# Cloudinary (single URL form: cloudinary://API_KEY:API_SECRET@CLOUD_NAME)
CLOUDINARY_URL=cloudinary://KEY:SECRET@CLOUD_NAME

# WaveSpeed (image generation)
WAVESPEED_API_KEY=PASTE_YOUR_WAVESPEED_KEY

# Express session secret
SESSION_SECRET=$(openssl rand -hex 32)

# Anthropic (only required if regenerating content via scripts/src/regen-by-sub.ts)
# On Replit these are auto-injected by the integration; off-platform supply your own.
AI_INTEGRATIONS_ANTHROPIC_API_KEY=
AI_INTEGRATIONS_ANTHROPIC_BASE_URL=https://api.anthropic.com
EOF

# 5. BRAND ASSETS ------------------------------------------------------------
echo "▶ [5/6] Bundling brand assets…"
if [ -d "$ROOT/attached_assets/brand" ]; then
  cp -r "$ROOT/attached_assets/brand" "$STAGE/brand"
fi

# 6. RESTORE INSTRUCTIONS ----------------------------------------------------
echo "▶ [6/6] Writing RESTORE.md…"
cat > "$STAGE/RESTORE.md" <<EOF
# PrimeAxis Tech — Full Project Bundle

Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Contents
- \`source/\` — full source tree (no node_modules / .git)
- \`sanity/dataset.ndjson\` — every article, category, author (NDJSON)
- \`cloudinary/asset-urls.txt\` — every hero-image URL
- \`cloudinary/images/\` — local image mirror (only if you ran with \`DOWNLOAD_IMAGES=1\`)
- \`.env.template\` — required env vars
- \`brand/\` — logo SVGs, favicon, brand guide

## Restore on a fresh machine

\`\`\`bash
# 1. unpack
tar -xzf primeaxis-tech-FULL-*.tar.gz
cd _stage-*/source

# 2. install deps
pnpm install

# 3. wire env
cp ../.env.template .env
# edit .env — paste real secrets

# 4. push DB schema (if using a fresh Postgres)
pnpm --filter @workspace/db run push

# 5. (optional) restore Sanity content into a fresh dataset
# Install Sanity CLI: npm i -g @sanity/cli
# sanity dataset create production
sanity dataset import ../sanity/dataset.ndjson production --replace

# 6. run dev
pnpm --filter @workspace/api-server run dev   # port 5000
pnpm --filter @workspace/primeaxis run dev    # frontend
pnpm --filter @workspace/studio run dev       # Sanity studio
\`\`\`

## Where things live
See \`source/replit.md\` for the full architecture overview.

## Re-running content generation
\`\`\`bash
# After setting SANITY_API_TOKEN, CLOUDINARY_URL, WAVESPEED_API_KEY:
cd source/scripts
pnpm exec tsx src/regen-by-sub.ts
\`\`\`
EOF

# PACKAGE --------------------------------------------------------------------
echo "▶ Creating tarball…"
tar -czf "$OUT" -C "$STAGE" .
SIZE=$(du -h "$OUT" | cut -f1)
rm -rf "$STAGE"

echo ""
echo "✅ DONE"
echo "   $OUT  ($SIZE)"
