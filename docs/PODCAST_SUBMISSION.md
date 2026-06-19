# Podcast — Generate, Publish & Submit

PrimeAxis podcasts are generated from Sanity articles, hosted on Cloudinary, and distributed via RSS at:

**https://primeaxishq.com/api/podcast/feed.xml**

---

## Prerequisites

Set these in `.env` (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `SANITY_PROJECT_ID` | CMS project |
| `SANITY_API_TOKEN` | Write access for audio metadata |
| `ELEVENLABS_API_KEY` | Text-to-speech |
| `CLOUDINARY_URL` | Audio file hosting |
| `PODCAST_SITE_URL` | `https://primeaxishq.com` |
| `PODCAST_FEED_URL` | `https://primeaxishq.com/api/podcast/feed.xml` |
| `PODCAST_COVER_IMAGE_URL` | 1400×1400+ JPEG/PNG cover art |
| `PODCAST_OWNER_NAME` | Show owner name |
| `PODCAST_OWNER_EMAIL` | Apple/Spotify verification email |

---

## Step 1 — Validate environment

```powershell
pnpm --filter @workspace/scripts run podcast:check
pnpm --filter @workspace/scripts run sanity:check
```

---

## Step 2 — Generate episodes

```powershell
# Batch (default limit from script)
pnpm --filter @workspace/scripts run podcasts

# One article
$env:ARTICLE_SLUG="your-article-slug"; pnpm --filter @workspace/scripts run podcasts

# Regenerate existing audio
$env:FORCE="1"; pnpm --filter @workspace/scripts run podcasts
```

Audio appears on article pages (Listen button) and in the RSS feed.

---

## Step 3 — Deploy production

Ensure Vercel (or your host) has all `PODCAST_*` env vars set. After deploy:

```powershell
powershell -File ./scripts/src/check-apis.ps1
# Confirm GET /podcast/feed.xml returns 200
```

Validate the feed: [Cast Feed Validator](https://castfeedvalidator.com/) or [Podbase](https://podba.se/validate/).

---

## Step 4 — Submit to platforms (one-time)

### Spotify for Podcasters

1. Go to https://podcasters.spotify.com  
2. **Add podcast** → **Submit RSS feed**  
3. Paste `https://primeaxishq.com/api/podcast/feed.xml`  
4. Verify email at `PODCAST_OWNER_EMAIL`  
5. After approval, copy the Spotify show URL into Sanity article `podcastPlatforms` (`platform: spotify`)

### Apple Podcasts Connect

1. Go to https://podcastsconnect.apple.com  
2. **Add (+)** → paste the same RSS URL  
3. Complete show metadata; Apple validates the feed  
4. Copy Apple show URL into `podcastPlatforms` (`platform: apple`)

New episodes sync automatically when Sanity articles get `podcastAudioUrl` updates.

---

## Step 5 — Monetization (after growth)

| Method | When |
|--------|------|
| Spotify Audience Network ads | Enable in Spotify for Podcasters after listener thresholds |
| Host-read sponsorships | Sell via advertise@primeaxishq.com; add copy to podcast script |
| Affiliate mentions | Link products in article + script |
| Site traffic | Episodes link to full articles → affiliate + newsletter |

Podcast RSS itself does not pay — audience and sponsors do.
