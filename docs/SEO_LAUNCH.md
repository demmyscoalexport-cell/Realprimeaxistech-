# SEO Launch Checklist — PrimeAxis Tech

Get **https://www.primeaxishq.com** indexed by Google, Bing, and other search engines.

**Time required:** ~10 minutes one-time setup, then wait for crawlers.

---

## What is already in the codebase

| Asset | Location | Notes |
|-------|----------|-------|
| `robots.txt` | `/robots.txt` | Allows all crawlers; points to sitemap |
| Dynamic sitemap | `/api/sitemap.xml` | Articles, categories, authors, videos from Sanity |
| RSS feed | `/api/rss.xml` | Helps discovery |
| Default meta + JSON-LD | `artifacts/primeaxis/index.html` | Organization schema, OG tags, canonical |
| Per-page meta | Article & review pages | Title, description, OG, Twitter via `usePageMeta` |

**Canonical domain:** `https://www.primeaxishq.com` (use `www` consistently in Search Console and env vars).

---

## Step 1: Confirm production is live

1. Open https://www.primeaxishq.com — homepage loads.
2. Open https://www.primeaxishq.com/robots.txt — shows `Sitemap: https://www.primeaxishq.com/api/sitemap.xml`.
3. Open https://www.primeaxishq.com/api/sitemap.xml — XML with article URLs.

If any fail, redeploy from Vercel (see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)).

---

## Step 2: Google Search Console (~5 min)

1. Go to [Google Search Console](https://search.google.com/search-console).
2. **Add property** → choose **URL prefix**: `https://www.primeaxishq.com`.
3. **Verify ownership** (pick one):
   - **DNS (recommended):** Add the TXT record Google gives you at your domain registrar (same place as your Vercel DNS).
   - **HTML tag:** Add the meta tag to `index.html` temporarily, deploy, verify, then remove if you prefer DNS.
4. After verified → **Sitemaps** → Submit: `https://www.primeaxishq.com/api/sitemap.xml`
5. **URL Inspection** → enter homepage → **Request indexing** (optional, speeds first crawl).

Also add the apex property `https://primeaxishq.com` if both apex and www resolve, or set a **301 redirect** in Vercel so only one canonical host is used.

---

## Step 3: Bing Webmaster Tools (~3 min)

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. **Add site** → `https://www.primeaxishq.com`.
3. Verify via DNS TXT or import from Google Search Console (fastest if GSC is done).
4. **Sitemaps** → Submit: `https://www.primeaxishq.com/api/sitemap.xml`.

Bing powers DuckDuckGo and some Copilot citations — worth the few minutes.

---

## Step 4: IndexNow (optional, ~2 min)

[IndexNow](https://www.indexnow.org/) notifies Bing/Yandex when URLs change.

1. Generate a key (any random UUID).
2. Host `{key}.txt` at site root with the key as plain text, **or** ping the API when you publish:

```text
GET https://api.indexnow.org/indexnow?url=https://www.primeaxishq.com/article/YOUR-SLUG&key=YOUR_KEY&keyLocation=https://www.primeaxishq.com/YOUR_KEY.txt
```

Not required for launch; useful after bulk publishes.

---

## Step 5: Vercel env for correct sitemap URLs

In **Vercel → Project → Settings → Environment Variables** (Production):

| Variable | Value |
|----------|-------|
| `PUBLIC_SITE_URL` | `https://www.primeaxishq.com` |
| `CORS_ORIGIN` | `https://www.primeaxishq.com,https://primeaxishq.com` |

Redeploy after changing env vars (Vercel → Deployments → ⋮ → Redeploy).

---

## Expected timeline

| Milestone | Typical timing |
|-----------|----------------|
| Sitemap fetched by Google | 1–3 days after submission |
| Homepage in search (`site:primeaxishq.com`) | 3–14 days |
| Individual articles ranking for brand + title | 1–4 weeks |
| Broader keyword rankings | Weeks to months (content + links) |

Search indexing is not instant. Newsletter subscribers and social posts do **not** replace SEO — they complement it.

---

## Ongoing tips

- **Consistent URL:** Always link to `https://www.primeaxishq.com` in bios, YouTube, X, email footers.
- **Internal links:** New articles should link to related stories (already supported on article pages).
- **Fresh content:** Sitemap updates automatically when Sanity publishes; resubmit sitemap in GSC after major launches if you want.
- **Core Web Vitals:** Vercel + optimized images help; check GSC → Experience after first crawl.
- **Do not block crawlers:** Keep `robots.txt` as `Allow: /` unless you have a staging domain to noindex.

---

## Quick verification commands

```powershell
# Sitemap returns 200
Invoke-WebRequest -Uri "https://www.primeaxishq.com/api/sitemap.xml" -UseBasicParsing | Select-Object StatusCode

# Google cache check (after a few days)
# Search: site:primeaxishq.com
```

---

## Related docs

- [PROMOTION_PLAN.md](./PROMOTION_PLAN.md) — full launch playbook: content cadence, social, newsletter, monetization, 90-day timeline
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) — deploy and redeploy
- [VERCEL_ENV_COPYPASTE.md](./VERCEL_ENV_COPYPASTE.md) — env var checklist including Cohere for article Q&A
