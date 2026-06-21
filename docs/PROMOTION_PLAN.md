# PrimeAxis Tech — Blog Promotion Plan & Launch Playbook

**Site:** [https://www.primeaxishq.com](https://www.primeaxishq.com)  
**Audience:** Builders, buyers, and decision-makers in AI, gadgets, gaming, EVs, robotics, and cybersecurity  
**Status:** Domain verified in Google Search Console — execute the steps below to index, distribute, and monetize.

This document is the **operational promotion guide**. For crawler setup details (sitemap URLs, env vars, IndexNow), see [SEO_LAUNCH.md](./SEO_LAUNCH.md). For deploy and CI, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) and [CI.md](./CI.md).

---

## Executive summary

PrimeAxis Tech ships with strong technical SEO foundations (robots, sitemap, RSS, default meta, Organization schema). What remains is **distribution**: submit sitemaps, request indexing, set a single canonical host, add analytics, publish on cadence, and push every story through owned channels (newsletter, social, podcast, cross-posts).

Treat the first 90 days like a media startup launch: search foundation in week 1, consistent publishing weeks 2–4, monetization when traffic and list size justify it.

---

## Phase 1 — Search foundation (Week 1)

You have completed **Google Search Console domain verification**. Finish the crawl pipeline this week.

### 1.1 Submit sitemap in Google Search Console

1. Open [Google Search Console](https://search.google.com/search-console).
2. Select the property for **www** (URL prefix: `https://www.primeaxishq.com`, or Domain property if you verified `primeaxishq.com`).
3. Go to **Sitemaps** → **Add a new sitemap**.
4. Submit exactly:

```text
https://www.primeaxishq.com/api/sitemap.xml
```

5. Confirm status moves to **Success** within 1–3 days. The sitemap is generated from Sanity (articles, categories, authors, videos) and updates on publish.

### 1.2 Request indexing for homepage + top 5 articles

1. In GSC, open **URL Inspection**.
2. Request indexing for:

| Priority | URL pattern | Notes |
|----------|-------------|-------|
| P0 | `https://www.primeaxishq.com/` | Homepage |
| P1 | Five best articles | Pick from homepage feed or sitemap — prefer recent, unique, non-duplicate topics |

**How to pick the five articles:** Open the sitemap or homepage → choose stories with strong titles, unique angles, and internal links to related content. Avoid thin or duplicate AI roundups for the first crawl batch.

3. For each URL: paste → **Test live URL** → **Request indexing** (limit ~10/day; spread across 2 days if needed).

### 1.3 Bing Webmaster Tools

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. **Add site** → `https://www.primeaxishq.com`.
3. **Fastest path:** Import from Google Search Console (if available) or verify via DNS TXT at your registrar.
4. **Sitemaps** → Submit:

```text
https://www.primeaxishq.com/api/sitemap.xml
```

Bing feeds DuckDuckGo and some Copilot citations — low effort, worthwhile.

### 1.4 Set primary domain (www vs apex) in Vercel

The codebase canonical is **`https://www.primeaxishq.com`** (`artifacts/primeaxis/src/lib/seo.ts`, `robots.txt`, `index.html`). Align hosting and env with that.

| Step | Action |
|------|--------|
| Vercel Domains | Add both `primeaxishq.com` and `www.primeaxishq.com` |
| Primary domain | Set **`www.primeaxishq.com`** as primary; apex should **301 redirect** to www |
| Env (Production) | `PUBLIC_SITE_URL=https://www.primeaxishq.com` |
| Env (Production) | `CORS_ORIGIN=https://www.primeaxishq.com,https://primeaxishq.com` |
| Redeploy | Vercel → Deployments → Redeploy after env changes |

Verify: visiting `https://primeaxishq.com/article/slug` redirects to `https://www.primeaxishq.com/article/slug`.

Also add the apex as a **separate GSC property** (or rely on domain property) so you can see if duplicate URLs appear before redirect is perfect.

### 1.5 Technical SEO checklist — done vs todo

| Item | Status | Location / action |
|------|--------|-------------------|
| `robots.txt` — Allow all, sitemap URL | **Done** | `artifacts/primeaxis/public/robots.txt` |
| Dynamic XML sitemap | **Done** | `GET /api/sitemap.xml` |
| RSS feed | **Done** | `GET /api/rss.xml` |
| Default title, description, robots meta | **Done** | `artifacts/primeaxis/index.html` |
| Canonical + OG + Twitter (home) | **Done** | `index.html` |
| Per-page meta (articles, reviews) | **Done** | `usePageMeta` in `artifacts/primeaxis/src/lib/seo.ts` |
| Organization JSON-LD | **Done** | `NewsMediaOrganization` in `index.html` |
| Podcast RSS | **Done** | `GET /api/podcast/feed.xml` — see [PODCAST_SUBMISSION.md](./PODCAST_SUBMISSION.md) |
| Article `NewsArticle` JSON-LD | **Todo** | Recommended — see [LAUNCH_READINESS.md](./LAUNCH_READINESS.md) § SEO |
| `BreadcrumbList` / `PodcastEpisode` schema | **Todo** | After article schema |
| Google Analytics 4 | **Not in codebase** | Add in Phase 4 — see below |
| IndexNow ping on publish | **Optional** | [SEO_LAUNCH.md](./SEO_LAUNCH.md) Step 4 |

**Linking rule:** Use `https://www.primeaxishq.com` in X bios, YouTube, email footers, dev.to canonicals, and sponsor materials — never mix apex/www in public links.

---

## Phase 2 — Content & distribution (ongoing)

Search indexes the site; **you** drive repeat visits and backlinks. Run these in parallel with publishing.

### 2.1 Publishing cadence (tech newsroom)

| Content type | Cadence | Purpose |
|--------------|---------|---------|
| Breaking news / short takes | 3–5× per week | Freshness, Google Discover eligibility, social hooks |
| Deep dives / explainers | 1× per week | Backlinks, newsletter depth, HN/Reddit suitability |
| Reviews / buying guides | 1–2× per month | Affiliate revenue, evergreen search |
| Video / podcast companion | Per major story | Multi-format discovery |

**Minimum viable launch rhythm:** **2–3 articles per week** (mix of news + one longer piece). Batch Sanity publishes Tue/Thu/Sat or Mon/Wed/Fri for predictable social and digest slots.

**Editorial quality gate (before promote):** factual check, unique headline, hero image without text overlays, 2+ internal links to related PrimeAxis stories, excerpt under 160 characters for SERP.

### 2.2 Newsletter growth (Resend)

Infrastructure: Resend welcome email on subscribe; digest script for manual sends. Full ops: [NEWSLETTER_GROWTH.md](./NEWSLETTER_GROWTH.md).

| Tactic | Implementation |
|--------|----------------|
| Above-the-fold CTA | Homepage + end of every article — “The Axis” daily briefing |
| Lead magnet | “Weekly AI & gadgets digest” — first digest with top 5 stories (`newsletter:digest --dry-run`) |
| Cross-promote | Link newsletter in podcast show notes and YouTube descriptions |
| Social proof | Update subscriber count on `/advertise` when you have real numbers |
| Sponsored issues | `DIGEST_SPONSOR_TEXT` env when booking sponsors — [MEDIA_KIT.md](./MEDIA_KIT.md) |
| Verify deliverability | `pnpm --filter @workspace/scripts run resend:check` — domain must show verified |

Send the **first real digest** once you have 50+ subscribers or 2 weeks of posts live — whichever comes first.

### 2.3 Podcast — Spotify & Apple

RSS (production):

```text
https://www.primeaxishq.com/api/podcast/feed.xml
```

Submit once; new episodes sync when Sanity articles get `podcastAudioUrl`. Step-by-step: [PODCAST_SUBMISSION.md](./PODCAST_SUBMISSION.md).

| Platform | Action |
|----------|--------|
| Spotify for Podcasters | Submit RSS → verify `PODCAST_OWNER_EMAIL` |
| Apple Podcasts Connect | Same RSS URL |
| Article pages | Add Spotify/Apple URLs to `podcastPlatforms` in Sanity after approval |

Every episode description should include: link to full article, newsletter signup, and one social handle.

### 2.4 Social distribution

Brand copy and handles: [SOCIAL_MEDIA_SETUP.md](./SOCIAL_MEDIA_SETUP.md).

| Channel | Role for PrimeAxis | Post pattern |
|---------|-------------------|--------------|
| **X** [@primeaxistech1](https://x.com/primeaxistech1) | Primary breaking-news wire | Link + 1-line hook; thread for explainers; quote-tweet primary sources |
| **LinkedIn** | Professional AI/EV/cyber audience | Article link + 3-bullet “why it matters”; tag companies only when factual |
| **YouTube** | Clips, reviews, podcast video | Shorts from hero moments; link www canonical in description |
| **TikTok** | Reach, gadget/AI hot takes | 30–60s summary → link in bio |
| **Reddit** | Targeted, not spammy | Post **only** where rules allow self-promotion: r/technology (Tuesday–Thursday morning US ET often works), niche subs (r/artificial, r/gadgets) when the story fits sub culture. Lead with insight, not “check out my site.” |
| **Hacker News** | Show HN for original analysis | **Best times:** weekday 8–10am US ET. Original reporting, benchmarks, or deep technical explainers — not press-release rewrites. One submission per strong piece; don’t resubmit failures. |

**Per-article promotion checklist (15 min):**

1. Publish in Sanity → confirm live URL on www.
2. Post to X (immediate) + LinkedIn (same day).
3. Add to next newsletter digest queue.
4. If audio exists, episode is already in RSS — post “Listen” link on X.
5. For evergreen guides only: schedule dev.to/Medium cross-post (see below).

### 2.5 Cross-posting strategy (dev.to, Medium)

| Rule | Detail |
|------|--------|
| Canonical | Always set canonical URL to `https://www.primeaxishq.com/article/{slug}` |
| Timing | Wait **48–72 hours** after original publish so Google indexes www first |
| What to cross-post | Evergreen explainers and buying guides — not breaking news |
| dev.to | Full markdown; tag `ai`, `webdev`, `productivity` as relevant; link “Originally published on PrimeAxis Tech” |
| Medium | Import story → **More settings → Advanced → Canonical link** → paste www URL |
| CTA | End with newsletter signup: `https://www.primeaxishq.com/#newsletter` |

Do not cross-post every article — 1–2 per week maximum to avoid duplicate-content noise and community fatigue.

---

## Phase 3 — Monetization & partnerships

Revenue follows traffic and trust. Stack channels as metrics justify them.

### 3.1 Amazon Associates & affiliate (live in project)

- Setup: [AFFILIATE_SETUP.md](./AFFILIATE_SETUP.md)
- Add `affiliateLinks` in Sanity on **reviews** and **buying-guide** articles
- Disclosure: [/affiliate-disclosure](https://www.primeaxishq.com/affiliate-disclosure) — required for FTC
- **Week 1 action:** Ensure Amazon Associates account approved; add tags to top 3 buying guides already published

| Milestone | Action |
|-----------|--------|
| 0–1k sessions/mo | Focus on links in every review/buying guide |
| 1k–10k sessions/mo | Expand to Best Buy, B&H per AFFILIATE_SETUP |
| 10k+ sessions/mo | Negotiate Impact/CJ brand-direct deals |

### 3.2 Newsletter sponsorships

- Packages and rates: [MEDIA_KIT.md](./MEDIA_KIT.md)
- Sales contact: advertise@primeaxishq.com
- **Start pitching** when you can show: 500+ subscribers **or** 5k+ monthly sessions (update kit with real numbers first)
- Deliver via `DIGEST_SPONSOR_TEXT` — no code changes required

### 3.3 Display ads & review units

| Option | When to add |
|--------|-------------|
| Google AdSense | After **10k+ monthly pageviews** sustained 2+ months; avoid on launch — hurts UX and Core Web Vitals |
| Carbon / Ethical Ads | Tech audience, 5k+ sessions — lighter weight than AdSense |
| Sponsored review units | Sold via MEDIA_KIT ($3,500+); use `isSponsored` in Sanity |

Podcast ads (Spotify Audience Network): enable after platform listener thresholds — [PODCAST_SUBMISSION.md](./PODCAST_SUBMISSION.md) § Monetization.

---

## Phase 4 — Growth metrics

You cannot optimize what you do not measure. GSC is live; add GA4 for on-site behavior.

### 4.1 Add Google Analytics 4 (recommended)

GA4 is **not** in the codebase today. Add when ready:

1. Create GA4 property at [analytics.google.com](https://analytics.google.com) for `www.primeaxishq.com`.
2. Install gtag via Google tag or GTM in `index.html` (or a small analytics component loaded once in production only).
3. Link GA4 property to the same Google account as GSC (**Admin → Product links**).
4. Exclude internal traffic (your IP) and enable enhanced measurement (scrolls, outbound clicks).

### 4.2 Google Search Console — track weekly

| Metric | Where | Target (90 days) |
|--------|-------|------------------|
| Indexed pages | Pages → Indexed | Match sitemap URL count ± static pages |
| Impressions | Performance | Up week-over-week |
| Average CTR | Performance | >2% on branded queries; improve titles if <1% |
| Average position | Performance | Top 20 for “PrimeAxis” + article titles |
| Core Web Vitals | Experience | All “Good” on mobile |
| Crawl errors | Pages / Settings | Zero 5xx on article URLs |

### 4.3 GA4 — track weekly

| Metric | Use |
|--------|-----|
| Users / sessions | Overall growth |
| Engagement rate | Content quality signal |
| Top landing pages | Double down on formats that work |
| Newsletter signup events | Custom event on successful subscribe |
| Outbound clicks to affiliate retailers | Monetization proxy (if tracked) |

### 4.4 Business KPIs (dashboard you update manually)

| KPI | Source | 30-day target | 90-day target |
|-----|--------|---------------|---------------|
| Indexed pages | GSC | Homepage + 80% of articles | All published URLs |
| Organic impressions | GSC | 1,000+/week | 10,000+/week |
| Newsletter subscribers | Sanity / Resend | 100 | 500+ |
| Podcast episodes live | Sanity | 5+ | 20+ |
| Social followers (X) | X analytics | Baseline +20% | Baseline +100% |
| Affiliate clicks | Amazon dashboard | Track baseline | Optimize top 10 pages |

Review metrics every **Monday**: export GSC Performance (last 28 days), note top queries and pages with low CTR (rewrite titles/meta).

---

## Phase 5 — 90-day timeline

| Week | Search & tech | Content | Distribution | Monetization |
|------|---------------|---------|--------------|--------------|
| **1** | Submit sitemap GSC + Bing; request indexing (home + 5 URLs); set www primary in Vercel; verify `PUBLIC_SITE_URL` | Publish 2–3 strong pieces | X + LinkedIn for each post; submit podcast RSS if audio ready | Add affiliate links to 3 buying guides |
| **2** | Confirm sitemap Success; fix any Coverage errors | 2–3× posts; 1 explainer | First newsletter digest (dry-run then send); dev.to cross-post 1 evergreen | Update MEDIA_KIT with real traffic if available |
| **3** | URL Inspection on new posts; check `site:primeaxishq.com` | 2–3× posts; 1 review | Reddit/HN only if story fits; YouTube Short from best performer | Pitch 1 newsletter sponsor (warm outreach) |
| **4** | GSC Performance baseline; Core Web Vitals check | 2–3× posts | Podcast episode promo each week; LinkedIn article recap | Audit affiliate CTR on top pages |
| **5–6** | Add GA4; link to GSC | Maintain cadence; topic cluster (e.g. AI agents) | Cross-post 2nd evergreen; grow X threads | Amazon tag audit across Sanity |
| **7–8** | Optimize titles on pages with impressions, low CTR | 1 flagship longread | HN submission for flagship if original | First sponsored digest if sponsor signed |
| **9–10** | Bing keyword research (optional) | Reviews season (gadgets) | Refresh social bios with podcast links | Sponsored review outreach (MEDIA_KIT) |
| **11–12** | 90-day metrics review; resubmit sitemap if 50+ new URLs | Plan next quarter content calendar | Evaluate paid boost (X/LinkedIn) only on top 3 evergreen URLs | Evaluate display ads if >10k sessions/mo |

---

## Quick wins this week

Do these five actions in the next 7 days:

1. **Submit sitemap** in GSC: `https://www.primeaxishq.com/api/sitemap.xml` — confirm Success status.
2. **Request indexing** for homepage + your five strongest article URLs via URL Inspection.
3. **Bing Webmaster Tools** — import from GSC or verify DNS; submit the same sitemap URL.
4. **Vercel primary domain** — set `www.primeaxishq.com` as primary, apex 301 to www; set `PUBLIC_SITE_URL=https://www.primeaxishq.com` and redeploy.
5. **Publish and promote** 2 articles with full social pass (X + LinkedIn) and newsletter signup CTA in the conclusion.

---

## Related documentation

| Doc | Purpose |
|-----|---------|
| [SEO_LAUNCH.md](./SEO_LAUNCH.md) | Sitemap, GSC, Bing, IndexNow, env vars |
| [NEWSLETTER_GROWTH.md](./NEWSLETTER_GROWTH.md) | Resend, digest sends, sponsors |
| [PODCAST_SUBMISSION.md](./PODCAST_SUBMISSION.md) | Spotify, Apple, RSS |
| [AFFILIATE_SETUP.md](./AFFILIATE_SETUP.md) | Amazon and retailer links |
| [MEDIA_KIT.md](./MEDIA_KIT.md) | Sponsorship packages |
| [INCOME_GUIDE.md](./INCOME_GUIDE.md) | Monetization index |
| [SOCIAL_MEDIA_SETUP.md](./SOCIAL_MEDIA_SETUP.md) | Bios, handles, platform copy |
| [CI.md](./CI.md) | CI pipeline — ship content fixes via green `main` builds |

---

*Last updated: June 2025 — update KPI targets and MEDIA_KIT figures as real analytics data arrives.*
