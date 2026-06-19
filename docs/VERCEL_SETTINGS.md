# Vercel dashboard settings (copy exactly)

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

## Environment variables (Production)

| Variable | Example |
|----------|---------|
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://primeaxishq.com` |
| `PUBLIC_SITE_URL` | `https://primeaxishq.com` |
| `SANITY_PROJECT_ID` | `jyppkgsk` |
| `SANITY_DATASET` | `production` |
| `SANITY_API_TOKEN` | *(Editor token from sanity.io)* |
| `RESEND_API_KEY` | *(from resend.com)* |
| `RESEND_FROM_EMAIL` | `PrimeAxis Tech <news@primeaxishq.com>` |
| `RESEND_REPLY_TO` | `hello@primeaxishq.com` |
| `PODCAST_SITE_URL` | `https://primeaxishq.com` |
| `PODCAST_FEED_URL` | `https://primeaxishq.com/api/podcast/feed.xml` |
| `PODCAST_COVER_IMAGE_URL` | `https://primeaxishq.com/podcast-cover.png` |
| `PODCAST_OWNER_NAME` | `PrimeAxis Tech` |
| `PODCAST_OWNER_EMAIL` | `podcasts@primeaxishq.com` |
| `LOG_LEVEL` | `info` |

Build-time (Vercel sets via `build:vercel`, optional in dashboard):

| Variable | Value |
|----------|-------|
| `PORT` | `5173` |
| `BASE_PATH` | `/` |

## After deploy — smoke test

- `https://YOUR-DEPLOY.vercel.app/api/healthz` → 200
- Homepage loads with articles/images
- `https://YOUR-DEPLOY.vercel.app/api/home/feed` → JSON
