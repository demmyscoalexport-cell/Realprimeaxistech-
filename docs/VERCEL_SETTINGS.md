# Vercel dashboard settings (copy exactly)

**Copy/paste checklist for env vars:** [`VERCEL_ENV_COPYPASTE.md`](./VERCEL_ENV_COPYPASTE.md)

## Project settings → General

| Setting | Value |
|---------|-------|
| **Root Directory** | *(leave empty — do NOT set `Prime-Axis-Tech`)* |
| **Node.js Version** | `22.x` |
| **Framework Preset** | Other |

The GitHub repo root **is** the app (`package.json` lives at repo root).

## Build & Development Settings

Leave these **empty** in the dashboard so `vercel.json` controls the build, **or** paste exactly:

| Field | Exact value |
|-------|-------------|
| **Install Command** | `corepack enable && corepack prepare pnpm@10.33.0 --activate && pnpm install --frozen-lockfile` |
| **Build Command** | `pnpm run build:vercel` |
| **Output Directory** | `artifacts/primeaxis/dist/public` |

`vercel.json` also bundles the API via `api/index.mjs` with `includeFiles: artifacts/api-server/dist/**`.

---

## Environment variables (Production)

Without **`SANITY_PROJECT_ID`**, the API throws at cold start → every `/api/*` route returns **500** and the homepage is empty.

### Required — site content & images

| Variable | Production value | Notes |
|----------|------------------|-------|
| `NODE_ENV` | `production` | |
| `SANITY_PROJECT_ID` | `jyppkgsk` | **Required** — API throws without this |
| `SANITY_DATASET` | `production` | Defaults to `production` if omitted |
| `SANITY_API_TOKEN` | *(Editor token)* | Read for content; **Editor** for newsletter writes |
| `CORS_ORIGIN` | `https://primeaxishq.com` | Add `https://www.primeaxishq.com` if you use www |
| `PUBLIC_SITE_URL` | `https://primeaxishq.com` | RSS, sitemap, podcast links |

### Required — newsletter & contact email

| Variable | Production value |
|----------|------------------|
| `RESEND_API_KEY` | *(from resend.com)* |
| `RESEND_FROM_EMAIL` | `PrimeAxis Tech <news@primeaxishq.com>` |
| `RESEND_REPLY_TO` | `hello@primeaxishq.com` |

### Required — podcast RSS

| Variable | Production value |
|----------|------------------|
| `PODCAST_SITE_URL` | `https://primeaxishq.com` |
| `PODCAST_FEED_URL` | `https://primeaxishq.com/api/podcast/feed.xml` |
| `PODCAST_COVER_IMAGE_URL` | `https://primeaxishq.com/podcast-cover.png` |
| `PODCAST_OWNER_NAME` | `PrimeAxis Tech` |
| `PODCAST_OWNER_EMAIL` | `podcasts@primeaxishq.com` |
| `LOG_LEVEL` | `info` |

### Optional — scripts only (not runtime display)

Not needed for the live site to load articles, images, or reviews.

| Variable | Example | Used by |
|----------|---------|---------|
| `CLOUDINARY_URL` | `cloudinary://API_KEY:API_SECRET@dxizihlmo` | Podcast/image upload scripts |
| `CLOUDINARY_CLOUD_NAME` | `dxizihlmo` | Scripts |
| `ELEVENLABS_API_KEY` | *(elevenlabs.io)* | `pnpm podcasts` |
| `ELEVENLABS_VOICE_ID` | `21m00Tcm4TlvDq8ikWAM` | Podcast script |
| `ELEVENLABS_MODEL_ID` | `eleven_multilingual_v2` | Podcast script |
| `ELEVENLABS_OUTPUT_FORMAT` | `mp3_44100_128` | Podcast script |
| `PODCAST_MAX_CHARS` | `4500` | Podcast script |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | *(anthropic.com)* | Content scripts |
| `COHERE_API_KEY` | *(cohere.com)* | Search scripts |
| `WAVESPEED_API_KEY` | | Image scripts |
| `ASSEMBLYAI_API_KEY` | | Transcription scripts |
| `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` | | Video scripts |
| `WEAVIATE_API_KEY` / `WEAVIATE_API_URL` | | Vector search scripts |
| `SESSION_SECRET` | *(random string)* | Future sessions |

### Build-time (set by `build:vercel`, optional in dashboard)

| Variable | Value |
|----------|-------|
| `PORT` | `5173` |
| `BASE_PATH` | `/` |

### Local dev only — do NOT add to Vercel Production

| Variable | Value |
|----------|-------|
| `API_PROXY_TARGET` | `http://localhost:5000` |
| `DATABASE_URL` | `postgres://...` |

---

## After deploy — smoke test

1. `https://primeaxishq.com/api/healthz` → **200**
2. `https://primeaxishq.com/api/home/feed` → JSON with `heroImageUrl` containing `res.cloudinary.com/dxizihlmo`
3. `https://primeaxishq.com/` → homepage with article hero images
4. `https://primeaxishq.com/api/podcast/feed.xml` → valid RSS
5. Newsletter signup on homepage → success (needs `RESEND_API_KEY` + verified domain)

If API routes return **500**, open Vercel → Functions → logs and confirm `SANITY_PROJECT_ID` is set for **Production**, then **Redeploy**.
