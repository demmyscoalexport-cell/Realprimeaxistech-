# PrimeAxis Tech — Resume checkpoint

Use this file when you return to the project or ask an AI assistant to continue work.

## Git snapshot

| Item | Value |
|------|-------|
| **Branch** | `cursor/elevenlabs-podcasts-e4e2` |
| **Tag** | `checkpoint-2026-06-06` |
| **Repo** | `demmyscoalexport-cell/Realprimeaxistech-` |

Restore this exact state:

```powershell
git fetch origin
git checkout cursor/elevenlabs-podcasts-e4e2
git pull
# optional pinned snapshot:
git checkout checkpoint-2026-06-06
```

## What to tell the AI

> Continue PrimeAxis Tech from `docs/CHECKPOINT.md` on branch `cursor/elevenlabs-podcasts-e4e2` (tag `checkpoint-2026-06-06`).

## Shipped in this build (production-ready)

- Termly Terms & Conditions (`/terms`, static HTML)
- Dark/light theme toggle fixed
- Video lightbox plays YouTube / MP4 when Sanity `videoUrl` is set
- Newsletter subscribe → Sanity + Resend welcome email
- Podcast pipeline: ElevenLabs → Cloudinary → Sanity → `/api/podcast/feed.xml`
- Article listen button when `podcastAudioUrl` exists

## Removed in cleanup (Jun 2026)

Incomplete WIP that broke `pnpm run typecheck` (missing npm deps, unwired routes) was removed:

- Mux / Weaviate / AssemblyAI / Cohere API server stubs
- Broken `video.tsx` detail page (no `GET /videos/:slug` API yet)
- Invalid `vercel.json` (referenced non-existent `build:site` script)
- Duplicate root markdown notes (use `docs/API_INTEGRATIONS.md` instead)

## Not built yet (monetization)

- Affiliate / buy links on reviews (no CMS fields)
- Stripe / paid newsletter
- Display ads
- See income plan in Cursor plans: *Income and Podcasts Guide*

## Run locally (Windows)

```powershell
copy .env.example .env   # fill CHANGE_ME values
pnpm install
pnpm dev:api               # http://localhost:5000
pnpm dev:site              # http://localhost:5173
pnpm dev:studio            # http://localhost:3333
```

Production preview:

```powershell
.\preview.ps1
```

Full monorepo build (`pnpm run build`) needs `PORT` and `BASE_PATH` set; use `preview.ps1` or build site + API only:

```powershell
$env:PORT='5173'; $env:BASE_PATH='/'; pnpm --filter @workspace/primeaxis run build
$env:PORT='5000'; pnpm --filter @workspace/api-server run build
```

Generate podcasts:

```powershell
pnpm --filter @workspace/scripts run podcasts
```

## Required API keys (minimum)

See `.env.example` and `docs/API_INTEGRATIONS.md`.

**Site + newsletters + podcasts:** `SANITY_API_TOKEN`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CLOUDINARY_URL`, `ELEVENLABS_API_KEY`, `PODCAST_*`, `PUBLIC_SITE_URL`

**Content scripts:** `AI_INTEGRATIONS_ANTHROPIC_API_KEY`, `WAVESPEED_API_KEY`

**Validate:**

```powershell
pnpm --filter @workspace/scripts run sanity:check
pnpm --filter @workspace/scripts run resend:check
```

## Stash note

If you previously stashed local WIP before branch switch: `git stash list` → look for `local-wip-before-branch-switch`.

## Domain

Production target: https://primeaxishq.com
