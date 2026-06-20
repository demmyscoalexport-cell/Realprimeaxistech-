# Vercel Production Environment — Copy/Paste Checklist

Use **Vercel → Project → Settings → Environment Variables → Production**.

Paste each row. Replace every `CHANGE_ME` with your real value. **Never commit secrets to git.**

---

## Required — site will 500 without these

- [ ] `NODE_ENV` = `production`
- [ ] `SANITY_PROJECT_ID` = `jyppkgsk`
- [ ] `SANITY_DATASET` = `production`
- [ ] `SANITY_API_TOKEN` = `CHANGE_ME` *(Editor token from [Sanity API tokens](https://www.sanity.io/manage/project/jyppkgsk/api#tokens))*
- [ ] `CORS_ORIGIN` = `https://primeaxishq.com`
- [ ] `PUBLIC_SITE_URL` = `https://primeaxishq.com`

**Smoke test after save + redeploy:**

- [ ] `https://primeaxishq.com/api/healthz` → HTTP 200
- [ ] `https://primeaxishq.com/api/home/feed` → JSON with `heroImageUrl` (Cloudinary `res.cloudinary.com/dxizihlmo/...`)
- [ ] `https://primeaxishq.com/` → homepage with article images

---

## Required — newsletter signup & contact email

- [ ] `RESEND_API_KEY` = `CHANGE_ME` *(from [resend.com/api-keys](https://resend.com/api-keys))*
- [ ] `RESEND_FROM_EMAIL` = `PrimeAxis Tech <news@primeaxishq.com>`
- [ ] `RESEND_REPLY_TO` = `hello@primeaxishq.com`

Optional Resend override (usually omit on Vercel):

- [ ] `RESEND_BASE_URL` = `https://api.resend.com`

---

## Required — podcast RSS feed

- [ ] `PODCAST_SITE_URL` = `https://primeaxishq.com`
- [ ] `PODCAST_FEED_URL` = `https://primeaxishq.com/api/podcast/feed.xml`
- [ ] `PODCAST_COVER_IMAGE_URL` = `https://primeaxishq.com/podcast-cover.png`
- [ ] `PODCAST_OWNER_NAME` = `PrimeAxis Tech`
- [ ] `PODCAST_OWNER_EMAIL` = `podcasts@primeaxishq.com`
- [ ] `LOG_LEVEL` = `info`

---

## Optional — local dev only (do NOT add to Vercel unless debugging)

| Variable | Value | Notes |
|----------|-------|-------|
| `PORT` | `5000` | API local port |
| `API_PROXY_TARGET` | `http://localhost:5000` | Vite dev proxy |
| `BASE_PATH` | `/` | Set by `build:vercel` at build time |
| `DATABASE_URL` | `postgres://...` | Future use; not required for current site |

---

## Required — AI search & article Q&A (Cohere)

- [ ] `COHERE_API_KEY` = `CHANGE_ME` *(from [dashboard.cohere.com](https://dashboard.cohere.com/api-keys))*
- [ ] `COHERE_BASE_URL` = `https://api.cohere.com`
- [ ] `COHERE_CHAT_MODEL` = `command-r-plus-08-2024`
- [ ] `COHERE_EMBED_MODEL` = `embed-english-v3.0`
- [ ] `COHERE_RERANK_MODEL` = `rerank-english-v3.0`

Without `COHERE_API_KEY`, search and related articles still work with keyword/category fallbacks; article Q&A falls back to local excerpt matching in the browser.

**Smoke test after save + redeploy:**

- [ ] `https://primeaxishq.com/api/articles/search?q=ai&limit=3` → JSON article list
- [ ] Open any article → Ask the article → question returns a Cohere-grounded answer

---

## Optional — scripts only (run locally / CI, not runtime display)

These are **not** needed for the live site to load content or images.

### Cloudinary (podcast audio upload, image scripts)

- [ ] `CLOUDINARY_URL` = `cloudinary://API_KEY:API_SECRET@dxizihlmo`
- [ ] `CLOUDINARY_CLOUD_NAME` = `dxizihlmo`

### ElevenLabs (podcast generation script)

- [ ] `ELEVENLABS_API_KEY` = `CHANGE_ME`
- [ ] `ELEVENLABS_VOICE_ID` = `21m00Tcm4TlvDq8ikWAM`
- [ ] `ELEVENLABS_MODEL_ID` = `eleven_multilingual_v2`
- [ ] `ELEVENLABS_OUTPUT_FORMAT` = `mp3_44100_128`
- [ ] `PODCAST_MAX_CHARS` = `4500`

### Anthropic (content scripts)

- [ ] `AI_INTEGRATIONS_ANTHROPIC_API_KEY` = `CHANGE_ME`
- [ ] `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` = `https://api.anthropic.com`

### Other script integrations

- [ ] `WAVESPEED_API_KEY` = `CHANGE_ME`
- [ ] `ASSEMBLYAI_API_KEY` = `CHANGE_ME`
- [ ] `MUX_TOKEN_ID` = `CHANGE_ME`
- [ ] `MUX_TOKEN_SECRET` = `CHANGE_ME`
- [ ] `WEAVIATE_API_KEY` = `CHANGE_ME`
- [ ] `WEAVIATE_API_URL` = `CHANGE_ME`
- [ ] `SESSION_SECRET` = `CHANGE_ME` *(random 64-char string)*

---

## After adding variables

1. **Redeploy:** Vercel → Deployments → latest → **⋯ → Redeploy** (or push to `main`).
2. Re-run the smoke tests above.
3. Local verify: `pnpm --filter @workspace/scripts run env:check` *(uses your local `.env`)*.

---

## Quick reference — minimum Production set

```
NODE_ENV=production
SANITY_PROJECT_ID=jyppkgsk
SANITY_DATASET=production
SANITY_API_TOKEN=CHANGE_ME
CORS_ORIGIN=https://primeaxishq.com
PUBLIC_SITE_URL=https://primeaxishq.com
RESEND_API_KEY=CHANGE_ME
RESEND_FROM_EMAIL=PrimeAxis Tech <news@primeaxishq.com>
RESEND_REPLY_TO=hello@primeaxishq.com
PODCAST_SITE_URL=https://primeaxishq.com
PODCAST_FEED_URL=https://primeaxishq.com/api/podcast/feed.xml
PODCAST_COVER_IMAGE_URL=https://primeaxishq.com/podcast-cover.png
PODCAST_OWNER_NAME=PrimeAxis Tech
PODCAST_OWNER_EMAIL=podcasts@primeaxishq.com
LOG_LEVEL=info
COHERE_API_KEY=CHANGE_ME
COHERE_BASE_URL=https://api.cohere.com
COHERE_CHAT_MODEL=command-r-plus-08-2024
COHERE_EMBED_MODEL=embed-english-v3.0
COHERE_RERANK_MODEL=rerank-english-v3.0
```
