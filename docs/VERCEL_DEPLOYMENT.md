# Vercel Deployment Guide — PrimeAxis Tech

Step-by-step instructions to deploy https://primeaxishq.com on Vercel.

---

## Step 1: GitHub repository setup

| Setting | Value |
|---------|-------|
| **Repository URL** | https://github.com/demmyscoalexport-cell/Realprimeaxistech-.git |
| **Default branch** | `main` |
| **Recommended deploy branch** | `main` (merge `cursor/elevenlabs-podcasts-e4e2` first) |

### Actions

1. Ensure latest code is pushed to GitHub.
2. Merge the feature branch into `main` via pull request (or direct merge if you are the sole maintainer).
3. In GitHub → **Settings → Branches**, protect `main` if desired (require PR reviews, CI passing).

### Access permissions

- Vercel needs **read access** to the repository.
- Connect via GitHub OAuth when importing the project in Vercel.

---

## Step 2: Vercel project creation

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New → Project**.
3. Import `demmyscoalexport-cell/Realprimeaxistech-`.
4. **Framework Preset:** Other (not Next.js — this is Vite + serverless API).
5. **Root Directory:** leave **empty** (`.`). The repo root already contains `package.json` — do **not** set `Prime-Axis-Tech` unless that subfolder exists on GitHub (it does not).
6. Vercel reads `vercel.json` automatically. See also `docs/VERCEL_SETTINGS.md`.

---

## Step 3: Environment variables

Add these in **Vercel → Project → Settings → Environment Variables**.

### Production (required)

| Variable | Value | Environments |
|----------|-------|--------------|
| `NODE_ENV` | `production` | Production |
| `CORS_ORIGIN` | `https://primeaxishq.com` | Production |
| `PUBLIC_SITE_URL` | `https://primeaxishq.com` | Production |
| `SANITY_PROJECT_ID` | `jyppkgsk` | Production, Preview |
| `SANITY_DATASET` | `production` | Production, Preview |
| `SANITY_API_TOKEN` | Your Sanity write token | Production, Preview |
| `RESEND_API_KEY` | Your Resend key | Production |
| `RESEND_FROM_EMAIL` | `PrimeAxis Tech <news@primeaxishq.com>` | Production |
| `RESEND_REPLY_TO` | `hello@primeaxishq.com` | Production |
| `PODCAST_SITE_URL` | `https://primeaxishq.com` | Production |
| `PODCAST_FEED_URL` | `https://primeaxishq.com/api/podcast/feed.xml` | Production |
| `PODCAST_COVER_IMAGE_URL` | Your 1400×1400 cover URL | Production |
| `PODCAST_OWNER_NAME` | `PrimeAxis Tech` | Production |
| `PODCAST_OWNER_EMAIL` | `podcasts@primeaxishq.com` | Production |
| `LOG_LEVEL` | `info` | Production |

### Preview deployments (optional)

Use the same Sanity/Resend vars or separate staging keys. Set:

- `CORS_ORIGIN` → your `*.vercel.app` preview URL or `https://primeaxishq.com`
- `PUBLIC_SITE_URL` → preview URL

### Development (local)

Use `.env` copied from `.env.example`. Do not upload `.env` to Vercel manually for local work.

### Not needed on Vercel runtime

These are for **local scripts only** (run on your machine, not Vercel):

- `AI_INTEGRATIONS_ANTHROPIC_API_KEY`, `WAVESPEED_API_KEY`, `CLOUDINARY_URL`, `ELEVENLABS_*`, `COHERE_*`, `IMGIX_*`, `DATABASE_URL`

---

## Step 4: Build configuration

Vercel reads these from `vercel.json`:

| Setting | Value |
|---------|-------|
| **Install Command** | `pnpm install` |
| **Build Command** | `pnpm run build:vercel` |
| **Output Directory** | `artifacts/primeaxis/dist/public` |
| **Node.js Version** | 22.x (Project Settings → General → Node.js Version) |

### What `build:vercel` does

1. Builds the React/Vite frontend → `artifacts/primeaxis/dist/public`
2. Bundles the Express API → `artifacts/api-server/dist/app.mjs`
3. Serverless handler at `api/index.mjs` serves `/api/*`

### Local verification before deploy

```powershell
pnpm run build:vercel
```

---

## Step 5: Domain configuration

### Custom domain: primeaxishq.com

1. Vercel → **Project → Settings → Domains**
2. Add `primeaxishq.com` and `www.primeaxishq.com`
3. At your DNS registrar, add records Vercel shows:

| Type | Name | Value |
|------|------|-------|
| A | `@` | `76.76.21.21` (Vercel IP — confirm in dashboard) |
| CNAME | `www` | `cname.vercel-dns.com` |

4. Wait for SSL provisioning (automatic via Vercel).
5. Set **primary domain** to `primeaxishq.com` (redirect www if desired).

### Email DNS (Resend)

For newsletter sending, add Resend DNS records per [RESEND_DNS_SETUP.md](./RESEND_DNS_SETUP.md).

---

## Step 6: Production launch checklist

### API testing

After deploy, verify:

```text
GET https://primeaxishq.com/api/healthz          → {"status":"ok"}
GET https://primeaxishq.com/api/home/feed         → JSON with articles
GET https://primeaxishq.com/api/podcast/feed.xml  → RSS XML
GET https://primeaxishq.com/api/sitemap.xml       → sitemap
```

Or run locally against production:

```powershell
$env:BASE="https://primeaxishq.com/api"
Invoke-RestMethod "$env:BASE/healthz"
```

### Newsletter

1. Open https://primeaxishq.com
2. Subscribe with a test email in the footer
3. Confirm welcome email arrives
4. Test unsubscribe at `/unsubscribe`

### Content

- [ ] Hero images load (Cloudinary URLs from Sanity)
- [ ] Article pages render
- [ ] Reviews and videos pages load
- [ ] Terms, Privacy, About pages load
- [ ] Theme toggle works

### Email service

- [ ] `primeaxishq.com` verified in Resend
- [ ] `RESEND_FROM_EMAIL` uses verified domain

### Security

- [ ] No secrets in git
- [ ] `CORS_ORIGIN` matches production domain
- [ ] Sanity token scoped appropriately

### Performance

- [ ] Run Lighthouse on home and article pages
- [ ] Large JS bundle (765 KB) — acceptable for launch; optimize later

### Not applicable

- Database — not used at runtime
- Authentication — not implemented
- Payments — not implemented

---

## Step 7: Final verification

| Check | Expected |
|-------|----------|
| Deployment status | Ready (green) in Vercel dashboard |
| Homepage | Loads with images and articles |
| `/api/healthz` | 200 OK |
| Newsletter subscribe | 200 + Sanity write |
| SSL | Valid certificate on custom domain |
| SPA routes | `/article/...`, `/reviews` work on refresh |

---

## Sanity Studio (separate deploy)

Sanity Studio is **not** deployed on Vercel. Deploy it separately:

```powershell
pnpm dev:studio          # local at http://localhost:3333
cd artifacts/studio
pnpm run deploy          # hosted Sanity Studio URL
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Site loads but no articles/images | Check `SANITY_API_TOKEN` and Sanity project/dataset |
| `/api/*` returns 500 | Check Vercel function logs; verify env vars |
| Newsletter fails | Verify Resend domain + `SANITY_API_TOKEN` write permissions |
| Local dev broken | Use `pnpm dev:site` (not raw Vite); API on port 5000 |
| Build fails on Vercel | Set Node 22; ensure `pnpm install` succeeds |

---

## Alternative: API on Railway + frontend on Vercel

If serverless Express causes issues:

1. **Vercel:** Deploy static site only (remove `api/` folder, remove API rewrites)
2. **Railway/Render:** Run `pnpm --filter @workspace/api-server run start` with `PORT=5000`
3. Point `api.primeaxishq.com` to Railway, or use Vercel rewrites to external API URL

See [DEPLOYMENT_AUDIT.md](./DEPLOYMENT_AUDIT.md) for full architecture notes.
