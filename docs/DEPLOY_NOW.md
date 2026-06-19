# Deploy on Vercel — 5-minute checklist

Do these in order. Skip nothing.

---

## Step 1 — Code on GitHub (done)

`main` now includes `vercel.json`, `build:vercel`, and `api/index.mjs` (commit `4b5d7aa`).

Vercel should auto-redeploy when it detects the push. If not, go to Step 4 and click **Redeploy**.

---

## Step 2 — Vercel project settings

**Settings → General**

| Setting | Value |
|---------|-------|
| Root Directory | **(empty — delete `Prime-Axis-Tech` if set)** |
| Framework Preset | **Other** |
| Node.js Version | **22.x** |

**Settings → Git → Production Branch**

Set to: **`main`**

*(Already updated on GitHub — no feature branch needed.)*

**Settings → Build & Development**

Leave empty (uses `vercel.json`) **or** paste exactly:

| Field | Value |
|-------|-------|
| Install Command | `corepack enable && corepack prepare pnpm@10.33.0 --activate && pnpm install --frozen-lockfile` |
| Build Command | `pnpm run build:vercel` |
| Output Directory | `artifacts/primeaxis/dist/public` |

---

## Step 3 — Environment variables (Production)

Add in **Settings → Environment Variables**. Use your real values (not `CHANGE_ME`).

**Required**

```
NODE_ENV=production
SANITY_PROJECT_ID=jyppkgsk
SANITY_DATASET=production
SANITY_API_TOKEN=<Editor token from sanity.io>
CORS_ORIGIN=https://primeaxishq.com
PUBLIC_SITE_URL=https://primeaxishq.com
RESEND_API_KEY=<from resend.com>
RESEND_FROM_EMAIL=PrimeAxis Tech <news@primeaxishq.com>
RESEND_REPLY_TO=hello@primeaxishq.com
PODCAST_SITE_URL=https://primeaxishq.com
PODCAST_FEED_URL=https://primeaxishq.com/api/podcast/feed.xml
PODCAST_COVER_IMAGE_URL=https://primeaxishq.com/podcast-cover.png
PODCAST_OWNER_NAME=PrimeAxis Tech
PODCAST_OWNER_EMAIL=podcasts@primeaxishq.com
LOG_LEVEL=info
```

While testing on `*.vercel.app` before custom domain, set `CORS_ORIGIN` and `PUBLIC_SITE_URL` to your Vercel URL instead.

**Not needed for deploy** (local scripts only): Anthropic, ElevenLabs, Cloudinary, Cohere, WaveSpeed, Imgix, `DATABASE_URL`.

`SANITY_API_TOKEN` must be **Editor** (not read-only) for newsletter signup.

---

## Step 4 — Redeploy

1. **Deployments** → latest → **⋯** → **Redeploy**
2. Wait for build to finish (should show `pnpm run build:vercel`, not pnpm help text)

---

## Step 5 — Smoke test (30 seconds)

Replace `YOUR-APP` with your Vercel URL:

```
https://YOUR-APP.vercel.app/api/healthz          → {"status":"ok"}
https://YOUR-APP.vercel.app/api/home/feed        → JSON with articles
https://YOUR-APP.vercel.app/                     → homepage with content
```

---

## If build still fails

| Symptom | Fix |
|---------|-----|
| pnpm help text / no build script | Root Directory is wrong — clear it |
| `build:vercel` not found | Production branch must be `main` (now has deploy config) |
| API routes 404 | Redeploy after push; check `api/index.mjs` exists on the branch |
| Homepage empty / no images | Add Sanity env vars; redeploy |
| Newsletter fails | Use Sanity **Editor** token on Vercel |

Local pre-check before pushing:

```powershell
pnpm run build:vercel
```
