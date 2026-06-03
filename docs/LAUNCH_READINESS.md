# PrimeAxis Professional Launch Readiness

This checklist captures what remains before PrimeAxis Tech should be launched professionally. It is written for future developers and AI agents continuing the build.

## Current state

PrimeAxis already has:

- React/Vite frontend
- Express API server
- Sanity Studio and Sanity-backed editorial content
- Sanity-backed newsletter subscriptions
- Optional Resend welcome email delivery for newsletter subscriptions
- OpenAPI-generated React hooks and Zod validators
- AI content scripts
- AI image generation pipeline
- ElevenLabs podcast generation pipeline
- Podcast RSS feed endpoint
- Article RSS and XML sitemap endpoints
- Imgix/iMix and Cohere API key checks
- GitHub Actions CI for install, codegen drift, typecheck, and build

## Must-have before public launch

### 1. Production environment and secrets

- Configure production environment variables in the hosting platform.
- Do not rely on the local `.env`.
- Required production env includes:
  - `PORT`
  - `NODE_ENV=production`
  - `LOG_LEVEL`
  - `CORS_ORIGIN`
  - `BASE_PATH`
  - `API_PROXY_TARGET`
  - `PUBLIC_SITE_URL`
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
  - `SANITY_PROJECT_ID`
  - `SANITY_DATASET`
  - `SANITY_API_TOKEN`
  - `CLOUDINARY_URL`
  - `AI_INTEGRATIONS_ANTHROPIC_API_KEY`
  - `WAVESPEED_API_KEY`
  - `ELEVENLABS_API_KEY`
  - `ELEVENLABS_VOICE_ID`
  - `PODCAST_SITE_URL`
  - `PODCAST_FEED_URL`
  - `PODCAST_COVER_IMAGE_URL`
  - `PODCAST_OWNER_NAME`
  - `PODCAST_OWNER_EMAIL`
- Optional / future:
  - `SESSION_SECRET`
  - `DATABASE_URL`
- Optional but configured:
  - `COHERE_API_KEY`
  - `IMGIX_API_KEY`
  - `IMIX_API_KEY`

### 2. Domain, SSL, and routing

- Connect the production domain: `primeaxishq.com`.
- Verify HTTPS.
- Verify frontend routes work on refresh.
- Verify `/api/*` routes reach the API server.
- Verify `/api/podcast/feed.xml` is publicly accessible.
- Decide whether the production host should redirect root `/rss.xml` to `/api/rss.xml`.

### 3. Real content review

- Review generated articles for:
  - factual accuracy
  - title quality
  - duplicate topics
  - stale claims
  - invented names, numbers, or citations
  - grammar and tone
- Review hero images for:
  - no text overlays
  - no logos or watermark artifacts
  - consistent editorial style
  - category/subcategory variety
- Review podcast audio for:
  - pronunciation
  - pacing
  - intros/outros
  - episode length
  - no incorrect claims from source copy

### 4. Podcast launch requirements

- Generate podcast audio for launch articles:
  ```sh
  pnpm --filter @workspace/scripts run podcasts
  ```
- Set production:
  - `PODCAST_SITE_URL`
  - `PODCAST_FEED_URL`
- Confirm feed validity with a podcast RSS validator.
- Add podcast cover art that meets platform requirements and set `PODCAST_COVER_IMAGE_URL`.
- Submit the RSS feed to the intended platforms:
  - Spotify for Podcasters
  - Apple Podcasts Connect
  - YouTube Music / YouTube if desired
  - Other directories as needed
- Add platform URLs back to Sanity `podcastPlatforms` when available.

### 5. Newsletter flow

- Verify `POST /api/newsletters/subscribe` writes `newsletterSubscriber` documents in Sanity.
- Verify `/unsubscribe` and `POST /api/newsletters/unsubscribe` remove `newsletterSubscriber` documents.
- Verify `pnpm --filter @workspace/scripts run sanity:check` passes with the production token.
- Verify frontend subscription forms call the API in production.
- Verify `primeaxishq.com` in Resend.
- Add the Resend DNS records from `docs/RESEND_DNS_SETUP.md`.
- Set `RESEND_FROM_EMAIL=PrimeAxis Tech <news@primeaxishq.com>`.
- Current check note: Resend API reports `primeaxishq.com` as verified.
- Add recurring-email compliance details before sending campaigns at scale.
- Confirm welcome email unsubscribe link points to `/unsubscribe`.
- Confirm privacy policy covers email collection.

### 6. Search and discovery

- Current article search is keyword-based.
- Recommended professional upgrade:
  - use Cohere embeddings for semantic search
  - use Cohere rerank for result quality
  - add indexing script for article text
  - add search telemetry
- Related/trending/most-discussed currently use placeholder view/comment counts. For launch:
  - either label them editorially instead of behaviorally
  - or implement analytics-backed counters

### 7. Analytics and observability

- Add production error tracking.
- Add request logging and log retention.
- Add frontend analytics.
- Add article read/view tracking if "trending" and "views" are shown.
- Add uptime monitoring for:
  - frontend
  - `/api/healthz`
  - `/api/podcast/feed.xml`
- Add alerting for API errors and failed background scripts.

### 8. SEO and metadata

- Add complete page metadata for:
  - title
  - description
  - canonical URL
  - Open Graph
  - Twitter/X card
  - article published/modified dates
- Add structured data:
  - `NewsArticle`
  - `PodcastEpisode` where audio exists
  - `BreadcrumbList`
- Add sitemap.
- Verify `/api/sitemap.xml`, `/api/rss.xml`, and `/api/podcast/feed.xml`.
- Decide whether `/rss.xml` should be article RSS, podcast RSS, or both separate feeds.
- Verify robots.txt.

### 9. Legal and trust pages

- Review and finalize:
  - About
  - Contact
  - Privacy
  - Terms
  - Editorial standards
  - Corrections policy
  - AI usage disclosure
- Add clear disclosure for AI-generated or AI-assisted:
  - article drafts
  - images
  - podcast audio

### 10. Performance and accessibility

- Run Lighthouse on major pages:
  - home
  - article
  - category
  - search
  - videos
  - newsletters
- Fix:
  - large JavaScript chunks
  - image sizing/loading
  - missing alt text
  - keyboard navigation issues
  - color contrast issues
- Add lazy loading where needed.

### 11. Security

- Rotate any API keys that were ever pasted into chat or shared outside the secret manager.
- Restrict keys where providers support scopes.
- Use separate production and development keys.
- Confirm `.env` is ignored and never committed.
- Add rate limits to public write endpoints such as newsletter subscription.
- Validate and sanitize API inputs.
- Configure CORS for production origins.

### 12. CI/CD

- Add automated checks:
  - install
  - typecheck
  - build
  - API codegen drift check
- Required validation command:
  ```sh
  PORT=5000 BASE_PATH=/ API_PROXY_TARGET=http://localhost:5000 pnpm run build
  ```
- Deploy only from protected branch or approved PR.

## Nice-to-have after launch

- Cohere-powered semantic search.
- Cohere-powered related article recommendations.
- Real article analytics and personalization.
- Admin dashboard for podcast generation status.
- Queue/background worker for long-running media generation.
- Automated social sharing through approved platform APIs.
- Dedicated article RSS feed in addition to podcast RSS.
- Image CDN strategy using Imgix if it becomes the primary image layer.

## Do not launch until these are true

- Production secrets are configured outside git.
- Production build passes.
- Main user flows work on the production domain.
- Newsletter subscription works or is intentionally hidden.
- At least core content has been human-reviewed.
- Podcast RSS validates if podcast platform submission is planned.
- Legal/trust pages are not placeholders.
- Error monitoring and uptime checks are active.
