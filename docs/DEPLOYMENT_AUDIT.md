# PrimeAxis Tech — Deployment Audit Report

**Date:** June 2026  
**Repository:** https://github.com/demmyscoalexport-cell/Realprimeaxistech-.git  
**Default branch:** `main`  
**Latest deployment-ready branch:** `cursor/elevenlabs-podcasts-e4e2`  
**Production domain:** https://primeaxishq.com  

---

## Executive summary

| Area | Status | Notes |
|------|--------|-------|
| Typecheck | Pass | `pnpm run typecheck` |
| Full monorepo build | Pass | Requires `PORT=5173`, `BASE_PATH=/` |
| Vercel build | Pass | `pnpm run build:vercel` |
| API endpoints (15 routes) | Pass | See `scripts/src/check-apis.ps1` |
| Local dev proxy | Fixed | Use `pnpm dev:site` |
| Vercel config | Added | `vercel.json` + `api/index.mjs` |
| Monetization (affiliate/Stripe) | Not built | Reviews show price only |
| PostgreSQL | Optional / unused | No runtime dependency |
| OAuth / user auth | Not built | No login system |
| Payment processing | Not built | N/A |

**Verdict:** The site and API are **production-ready for launch as a free editorial media platform** with newsletters and podcasts. Monetization features (affiliate buy links, paid tiers, ads) require additional work after launch.

---

## 1. Code review and cleanup

### Completed in this audit

- Removed broken local WIP (Mux, Weaviate, AssemblyAI stubs) that broke typecheck
- Fixed Vite dev proxy defaulting to localhost when `.env` points at production
- Added `build:vercel` for faster, deployment-focused builds (site + API only)
- Added Vercel serverless entry (`api/index.mjs`) wrapping Express
- Added API smoke test script (`scripts/src/check-apis.ps1`)
- Added resume checkpoint (`docs/CHECKPOINT.md`)

### Known non-blocking issues

| Issue | Severity | Action |
|-------|----------|--------|
| JS bundle > 500 KB | Low | Code-split later for Lighthouse |
| Trending/view counts are placeholders | Low | Label editorially or add analytics |
| No affiliate buy links on reviews | Medium | Post-launch monetization |
| Podcast RSS empty until episodes generated | Medium | Run podcast script before Apple/Spotify submit |
| Sanity Studio not on Vercel | Info | Deploy separately via `sanity deploy` |
| mockup-sandbox requires `PORT` for full build | Low | Excluded from `build:vercel` |

### Architecture

```mermaid
flowchart LR
  Browser[Browser] --> Vercel[Vercel CDN]
  Vercel --> Static[Static SPA]
  Vercel --> APIFn[api/index.mjs]
  APIFn --> Express[Express API]
  Express --> Sanity[Sanity CMS]
  Express --> Resend[Resend email]
  Scripts[Content scripts] --> Sanity
  Scripts --> Cloudinary[Cloudinary]
  Scripts --> ElevenLabs[ElevenLabs]
```

---

## 2. Repository management

| Item | Value |
|------|-------|
| **GitHub URL** | https://github.com/demmyscoalexport-cell/Realprimeaxistech-.git |
| **Default branch** | `main` |
| **Active feature branch** | `cursor/elevenlabs-podcasts-e4e2` |
| **Recommended deploy branch** | Merge `cursor/elevenlabs-podcasts-e4e2` → `main`, then deploy `main` |

### Recent commits (feature branch)

- Terms, theme toggle, video playback
- Resume checkpoint and cleanup
- Local dev API proxy fix
- Vercel deployment configuration (this audit)

---

## 3. Environment variables and secrets

### Runtime — required for production (Vercel)

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| `NODE_ENV` | Runtime mode | `production` | Yes |
| `PORT` | Express listen port (local/Railway only; not used on Vercel serverless) | `5000` | Local only |
| `LOG_LEVEL` | API log verbosity | `info` | Optional |
| `CORS_ORIGIN` | Allowed browser origin | `https://primeaxishq.com` | Yes |
| `PUBLIC_SITE_URL` | Canonical site URL for RSS/sitemap/emails | `https://primeaxishq.com` | Yes |
| `SANITY_PROJECT_ID` | Sanity project | `jyppkgsk` | Yes |
| `SANITY_DATASET` | Sanity dataset | `production` | Yes |
| `SANITY_API_TOKEN` | Read/write CMS token (newsletter subscribers) | `sk...` | Yes |
| `RESEND_API_KEY` | Transactional email | `re_...` | Yes (for newsletter welcome) |
| `RESEND_FROM_EMAIL` | Verified sender | `PrimeAxis Tech <news@primeaxishq.com>` | Yes |
| `RESEND_REPLY_TO` | Reply-to address | `hello@primeaxishq.com` | Optional |
| `RESEND_BASE_URL` | Resend API base | `https://api.resend.com` | Optional |

### Runtime — podcast / feeds (production)

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| `PODCAST_SITE_URL` | Site URL in podcast RSS | `https://primeaxishq.com` | Yes |
| `PODCAST_FEED_URL` | Public podcast RSS URL | `https://primeaxishq.com/api/podcast/feed.xml` | Yes |
| `PODCAST_COVER_IMAGE_URL` | 1400×1400+ cover art | `https://primeaxishq.com/podcast-cover.png` | Yes for directories |
| `PODCAST_OWNER_NAME` | Apple/Spotify owner name | `PrimeAxis Tech` | Yes |
| `PODCAST_OWNER_EMAIL` | Apple/Spotify owner email | `podcasts@primeaxishq.com` | Yes |

### Build-time only (Vercel)

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| `PORT` | Vite config validation during build | `5173` | Yes (set in `build:vercel`) |
| `BASE_PATH` | Vite asset base path | `/` | Yes |

### Local dev only

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| `API_PROXY_TARGET` | Vite `/api` proxy target | `http://localhost:5000` | Dev only |
| `FORCE_PRODUCTION_API` | Use production API in dev | `1` | Optional |

### Content pipeline scripts (not Vercel runtime)

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| `CLOUDINARY_URL` | Image/audio hosting | `cloudinary://key:secret@cloud` | Scripts |
| `ELEVENLABS_API_KEY` | Podcast TTS | `xi_...` | Scripts |
| `ELEVENLABS_VOICE_ID` | Narration voice | `21m00Tcm4TlvDq8ikWAM` | Scripts |
| `ELEVENLABS_MODEL_ID` | TTS model | `eleven_multilingual_v2` | Scripts |
| `ELEVENLABS_OUTPUT_FORMAT` | Audio format | `mp3_44100_128` | Scripts |
| `PODCAST_MAX_CHARS` | Max script length | `4500` | Scripts |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | Article generation | `sk-ant-...` | Scripts |
| `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` | Anthropic API | `https://api.anthropic.com` | Scripts |
| `WAVESPEED_API_KEY` | AI hero images | `ws_...` | Scripts |
| `COHERE_API_KEY` | Future semantic search | `co_...` | Optional |
| `COHERE_BASE_URL` | Cohere API | `https://api.cohere.com` | Optional |
| `COHERE_CHAT_MODEL` | Chat model | `command-r-plus` | Optional |
| `COHERE_EMBED_MODEL` | Embeddings | `embed-english-v3.0` | Optional |
| `COHERE_RERANK_MODEL` | Reranking | `rerank-english-v3.0` | Optional |
| `IMGIX_API_KEY` / `IMIX_API_KEY` | Imgix management | `ak_...` | Optional |
| `IMGIX_BASE_URL` | Imgix API | `https://api.imgix.com` | Optional |

### Future / not implemented

| Variable | Purpose | Status |
|----------|---------|--------|
| `DATABASE_URL` | Postgres for accounts/subscriptions | Not used at runtime |
| `SESSION_SECRET` | Future auth sessions | Not used |
| OAuth credentials | User login | Not implemented |
| Stripe keys | Payments | Not implemented |
| Amazon Associates | Affiliate links | Not in codebase |

**Never commit:** `.env`, real API keys, Sanity tokens, Resend keys.

---

## 4. Deployment verification (Vercel)

| Check | Result |
|-------|--------|
| Framework | Vite SPA + Express serverless |
| `vercel.json` | Present |
| Build command | `pnpm run build:vercel` |
| Output directory | `artifacts/primeaxis/dist/public` |
| Install command | `pnpm install` |
| Node.js | 22+ (`engines` in root `package.json`) |
| API routes | Rewritten to `api/index.mjs` |
| SPA routing | Fallback to `index.html` |
| Serverless max duration | 30s |

### Alternative: split deployment

If Vercel serverless limits are hit (cold starts, bundle size), deploy:

- **Frontend:** Vercel (static only, no `api/` folder)
- **API:** Railway, Render, or Fly.io running `pnpm --filter @workspace/api-server run start` with `PORT=5000`
- Point `primeaxishq.com/api` to API host via reverse proxy or subdomain `api.primeaxishq.com`

---

## 5. Vercel deployment guide

See **[docs/VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** for step-by-step instructions.

---

## 6. Production launch checklist

### Must pass before launch

- [ ] Merge latest branch to `main`
- [ ] All Vercel production env vars set (see Section 3)
- [ ] `primeaxishq.com` verified in Resend ([RESEND_DNS_SETUP.md](./RESEND_DNS_SETUP.md))
- [ ] Sanity token has create/update permissions
- [ ] Test newsletter subscribe on production domain
- [ ] Test `/api/healthz`, `/api/home/feed`, `/api/podcast/feed.xml`
- [ ] Human review of top articles and legal pages
- [ ] Generate podcast episodes if launching podcast directories
- [ ] Add `videoUrl` in Sanity for videos that should play

### Post-launch recommended

- [ ] Uptime monitoring on `/api/healthz`
- [ ] Error tracking (Sentry, etc.)
- [ ] Frontend analytics
- [ ] Affiliate disclosure + buy links on reviews
- [ ] Submit podcast RSS to Spotify / Apple Podcasts

### Not applicable yet

- Database connectivity (Postgres not used)
- User authentication
- Payment processing

---

## 7. Remaining issues before full monetization launch

1. **Affiliate commerce** — no CMS fields or buy buttons on reviews
2. **Display ads** — no ad slots
3. **Paid newsletter** — no Stripe integration
4. **Video detail page** — list/lightbox work; dedicated `/video/:slug` page not shipped
5. **Real analytics** — view/trending counts are editorial placeholders

These do **not** block launching the editorial site, newsletters, or podcasts.

---

## Validation commands

```powershell
pnpm run typecheck
pnpm run build:vercel
powershell -File ./scripts/src/check-apis.ps1
pnpm --filter @workspace/scripts run sanity:check
pnpm --filter @workspace/scripts run resend:check
```
