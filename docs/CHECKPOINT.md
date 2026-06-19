# PrimeAxis Tech — Resume checkpoint

Use this file when you return to deploy or continue work.

## Git snapshot

| Item | Value |
|------|-------|
| **Branch** | `cursor/elevenlabs-podcasts-e4e2` |
| **Repo** | https://github.com/demmyscoalexport-cell/Realprimeaxistech-.git |
| **Production domain** | https://primeaxishq.com |

Restore and deploy:

```powershell
git fetch origin
git checkout cursor/elevenlabs-podcasts-e4e2
git pull
pnpm install
pnpm run typecheck
pnpm run build:vercel
powershell -File ./scripts/src/check-deploy.ps1   # needs API + site running for API smoke test
```

## What to tell the AI

> Continue PrimeAxis deploy from `docs/CHECKPOINT.md` on branch `cursor/elevenlabs-podcasts-e4e2`. Merge to `main` and deploy on Vercel.

## Shipped in this build (deploy-ready)

- **Vercel:** `vercel.json`, `api/index.mjs`, `pnpm run build:vercel`
- **Affiliate commerce:** `affiliateLinks` + buy CTAs on reviews and buying-guide articles; `/affiliate-disclosure`
- **Sponsorships:** `/advertise`, `docs/MEDIA_KIT.md`
- **Income ops guides:** `docs/INCOME_GUIDE.md`, `AFFILIATE_SETUP.md`, `PODCAST_SUBMISSION.md`, `NEWSLETTER_GROWTH.md`
- **Videos:** API fallback `videoUrl` map; `pnpm --filter @workspace/scripts run videos:patch-urls`
- **Podcast RSS:** empty-feed messaging; `podcast:check` script
- **Newsletter digest:** `pnpm --filter @workspace/scripts run newsletter:digest -- --dry-run`
- **Env doctor:** `pnpm --filter @workspace/scripts run env:check`
- **Honest editorial labels** on homepage (no fake view counts)
- **SEO:** `robots.txt`, sitemap link in `index.html`
- Terms, theme toggle, video lightbox, local dev proxy fix (prior commits)

## Before deploy — fix in `.env` / Vercel

| Blocker | Action |
|---------|--------|
| **Sanity write token** | Create **Editor** token at [sanity.io/manage → API](https://www.sanity.io/manage/project/jyppkgsk/api#tokens). Current token is read-only (newsletter subscribe + podcast scripts fail). |
| **RESEND_API_KEY** | [resend.com/api-keys](https://resend.com/api-keys) — domain `primeaxishq.com` should be verified |
| **ELEVENLABS_API_KEY** | [elevenlabs.io → API keys](https://elevenlabs.io/app/settings/api-keys) — for podcast generation |
| **PODCAST_*** | Set on Vercel (see `.env.example`) |
| **PUBLIC_SITE_URL** | `https://primeaxishq.com` |

Verify locally:

```powershell
pnpm --filter @workspace/scripts run env:check
pnpm --filter @workspace/scripts run resend:check
pnpm --filter @workspace/scripts run podcast:check
```

## Run locally (Windows)

```powershell
pnpm dev:api      # http://localhost:5000
pnpm dev:site     # http://localhost:5173 — forces API proxy to localhost
pnpm dev:studio   # http://localhost:3333
```

```powershell
powershell -File ./scripts/src/check-apis.ps1
```

## Deploy steps (Vercel)

1. Merge `cursor/elevenlabs-podcasts-e4e2` → `main` (or deploy branch directly)
2. Import repo on Vercel; use `pnpm run build:vercel`
3. Set all env vars from `.env.example` (Production)
4. Deploy → smoke-test `https://primeaxishq.com/api/healthz`
5. Optional post-deploy: run podcasts script, submit RSS to Spotify/Apple (`docs/PODCAST_SUBMISSION.md`)

Full guide: [docs/VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) · [docs/DEPLOYMENT_AUDIT.md](./DEPLOYMENT_AUDIT.md)

## Not built (post-launch)

- Stripe / paid newsletter tier
- Display ads (AdSense)
- Amazon link builder automation

## Stash note

`git stash list` → `local-wip-before-branch-switch` if you need older local WIP.
