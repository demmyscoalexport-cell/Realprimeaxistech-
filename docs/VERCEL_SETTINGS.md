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

**Critical for homepage content and images:** without `SANITY_PROJECT_ID` (and optionally `SANITY_DATASET`), API routes fail at cold start and the site renders empty with broken placeholders.

| Variable | Example | Notes |
|----------|---------|-------|
| `NODE_ENV` | `production` | |
| `SANITY_PROJECT_ID` | `jyppkgsk` | **Required** — API throws without this |
| `SANITY_DATASET` | `production` | Defaults to `production` if omitted |
| `SANITY_API_TOKEN` | *(Editor token from sanity.io)* | Read for content; **Editor** for newsletter writes |
| `CORS_ORIGIN` | `https://primeaxishq.com` | Use your `*.vercel.app` URL until custom domain is wired |
| `PUBLIC_SITE_URL` | `https://primeaxishq.com` | Same as `CORS_ORIGIN` during pre-domain testing |
| `RESEND_API_KEY` | *(from resend.com)* | Contact form / newsletter email |
| `RESEND_FROM_EMAIL` | `PrimeAxis Tech <news@primeaxishq.com>` | |
| `RESEND_REPLY_TO` | `hello@primeaxishq.com` | |
| `PODCAST_SITE_URL` | `https://primeaxishq.com` | |
| `PODCAST_FEED_URL` | `https://primeaxishq.com/api/podcast/feed.xml` | |
| `PODCAST_COVER_IMAGE_URL` | `https://primeaxishq.com/podcast-cover.png` | |
| `PODCAST_OWNER_NAME` | `PrimeAxis Tech` | |
| `PODCAST_OWNER_EMAIL` | `podcasts@primeaxishq.com` | |
| `LOG_LEVEL` | `info` | |
| `CLOUDINARY_URL` | `cloudinary://API_KEY:API_SECRET@dxizihlmo` | Scripts only (podcast/image upload) |
| `CLOUDINARY_CLOUD_NAME` | `dxizihlmo` | Scripts only |

Build-time (Vercel sets via `build:vercel`, optional in dashboard):

| Variable | Value |
|----------|-------|
| `PORT` | `5173` |
| `BASE_PATH` | `/` |

## After deploy — smoke test

- `https://YOUR-DEPLOY.vercel.app/api/healthz` → 200
- Homepage loads with articles/images
- `https://YOUR-DEPLOY.vercel.app/api/home/feed` → JSON
