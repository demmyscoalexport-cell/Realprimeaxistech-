# PrimeAxis API Integrations

This guide is for future developers and AI agents working on PrimeAxis Tech. It explains what each internal and external API is for, where it is used, and which environment variables control it.

Do not commit real API keys. Real secrets belong only in `.env`, which is ignored by git. `.env.example` must contain placeholders only.

## Internal application API

Base path: `/api`

Implemented by the Express server in `artifacts/api-server/src/routes/`.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/healthz` | Health check for uptime/probes. |
| `GET /api/home/feed` | Curated homepage bundle. |
| `GET /api/articles` | Paginated article list with category/tag/subcategory filters. |
| `GET /api/articles/trending` | Trending article list. Currently ordered by published date with placeholder view counts. |
| `GET /api/articles/most-discussed` | Most-discussed article list. Currently ordered by published date with placeholder comment counts. |
| `GET /api/articles/search` | Keyword search against Sanity article fields. |
| `GET /api/articles/:slug` | Article detail, including body, AI summary, takeaways, and podcast metadata. |
| `GET /api/articles/:slug/related` | Related articles by category. |
| `GET /api/categories` | Category list with article counts. |
| `GET /api/categories/:slug` | Category detail plus articles. |
| `GET /api/authors` | Author list with article counts. |
| `GET /api/authors/:slug` | Author detail plus articles. |
| `GET /api/reviews` | Review list. |
| `GET /api/reviews/best-picks` | Best-pick reviews. |
| `GET /api/reviews/:slug` | Review detail. |
| `GET /api/videos` | Video list from Sanity. |
| `GET /api/newsletters` | Newsletter metadata. |
| `POST /api/newsletters/subscribe` | Newsletter subscription write path. |
| `GET /api/podcast/feed.xml` | Podcast RSS feed generated from articles with `podcastAudioUrl`. |

When changing API response shapes:

1. Update `lib/api-spec/openapi.yaml`.
2. Run `pnpm --filter @workspace/api-spec run codegen`.
3. Verify with `pnpm run typecheck`.

## Sanity CMS API

Sanity is the source of truth for editorial content.

| Env var | Purpose |
| --- | --- |
| `SANITY_PROJECT_ID` | Sanity project id. Current default is `jyppkgsk`. |
| `SANITY_DATASET` | Dataset name. Current default is `production`. |
| `SANITY_API_TOKEN` | Required for scripts that write content or metadata. |

Used by:

- API read layer: `artifacts/api-server/src/lib/sanity.ts`
- Studio schemas: `artifacts/studio/schemas/`
- Content scripts: `scripts/src/*.ts`

Stores:

- Articles, categories, authors, reviews, videos, newsletters
- AI summaries and key takeaways
- Hero image URLs
- Podcast audio metadata and scripts

## PostgreSQL / Drizzle

Postgres is used for operational data, not article content.

| Env var | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. |

Used by:

- `lib/db/`
- Newsletter subscription routes

Current note: Sanity remains the editorial CMS. Do not move article/category/author content into Postgres unless the product architecture intentionally changes.

## Resend API

Resend sends transactional/newsletter-related email. It is currently wired to send a welcome email after a new newsletter subscription is stored.

| Env var | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key. |
| `RESEND_BASE_URL` | Base URL, usually `https://api.resend.com`. |
| `RESEND_FROM_EMAIL` | Verified sender, e.g. `PrimeAxis Tech <news@primeaxishy.com>`. Required before sending email. |
| `RESEND_REPLY_TO` | Optional reply-to address. |

Used by:

- `artifacts/api-server/src/lib/resend.ts`
- `artifacts/api-server/src/routes/newsletters.ts`
- `scripts/src/check-resend.ts`

Utility:

- `pnpm --filter @workspace/scripts run resend:check`

Behavior:

- `POST /api/newsletters/subscribe` stores the subscription in Postgres.
- If `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are configured, the API attempts to send a welcome email.
- Email delivery failures are logged but do not fail the subscription response.

Production requirement:

- Verify `primeaxishy.com` as the sending domain in Resend.
- Set `RESEND_FROM_EMAIL` to an address on that verified domain.
- Keep Resend sending limits and compliance requirements in mind before sending bulk newsletters.
- See `docs/RESEND_DNS_SETUP.md` for the DNS records checklist.

## Anthropic API

Anthropic powers longform editorial generation and enrichment scripts.

| Env var | Purpose |
| --- | --- |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | Anthropic API key. |
| `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` | Base URL, usually `https://api.anthropic.com`. |

Used by:

- `scripts/src/generate-articles.ts`
- `scripts/src/enrich-content.ts`
- `scripts/src/regen-by-sub.ts`

Best use:

- Generate article ideas
- Rewrite/enrich article body content
- Produce summaries and takeaways

Avoid:

- Committing generated content without reviewing quality
- Treating generated copy as factual without checking named claims

## Cohere API

Cohere is configured for future semantic search, embeddings, reranking, classification, summarization, chat, and article Q&A.

| Env var | Purpose |
| --- | --- |
| `COHERE_API_KEY` | Cohere API key. |
| `COHERE_BASE_URL` | Base URL, usually `https://api.cohere.com`. |
| `COHERE_CHAT_MODEL` | Chat/generation model default. |
| `COHERE_EMBED_MODEL` | Embedding model default. |
| `COHERE_RERANK_MODEL` | Rerank model default. |

Utility:

- `pnpm --filter @workspace/scripts run cohere:check`

Current validation:

- The local key was checked with a read-only model-list request.
- It was valid and could see 20 models.

Recommended product uses:

- Upgrade `/api/articles/search` from keyword matching to semantic search.
- Add embeddings for related articles and personalization.
- Use reranking for search result quality.
- Upgrade `AiAsk` from keyword matching to real article-aware Q&A.

## WaveSpeed API

WaveSpeed powers AI hero image generation.

| Env var | Purpose |
| --- | --- |
| `WAVESPEED_API_KEY` | WaveSpeed API key. |

Used by:

- `scripts/src/enrich-images.ts`
- `scripts/src/regen-by-sub.ts`

Outputs:

- Generated images uploaded to Cloudinary under `primeaxis/ai/`.

Prompt requirement:

- Prompts should end with wording like `no text, no watermark, no logo, no captions` to avoid garbled overlays.

## Cloudinary API

Cloudinary hosts generated media.

| Env var | Purpose |
| --- | --- |
| `CLOUDINARY_URL` | Cloudinary account credentials in `cloudinary://key:secret@cloud` format. |

Used by:

- Image upload scripts
- ElevenLabs podcast audio uploads

Folders:

- `primeaxis/ai/` for hero images
- `primeaxis/podcasts/` for generated MP3 episodes

## ElevenLabs API

ElevenLabs powers generated podcast/audio episodes from articles.

| Env var | Purpose |
| --- | --- |
| `ELEVENLABS_API_KEY` | ElevenLabs API key. |
| `ELEVENLABS_VOICE_ID` | Voice used for generated narration. |
| `ELEVENLABS_MODEL_ID` | TTS model, default `eleven_multilingual_v2`. |
| `ELEVENLABS_OUTPUT_FORMAT` | MP3 output format, default `mp3_44100_128`. |
| `PODCAST_SITE_URL` | Public site URL used by podcast RSS. |
| `PODCAST_FEED_URL` | Public podcast RSS URL stored in Sanity platform links. |
| `PODCAST_MAX_CHARS` | Max narration script length. |

Main script:

- `pnpm --filter @workspace/scripts run podcasts`

Implementation:

- `scripts/src/generate-podcast-audio.ts`

Flow:

1. Read eligible Sanity articles.
2. Build a narration script from article summary, excerpt, takeaways, and body.
3. Generate MP3 audio with ElevenLabs.
4. Upload MP3 to Cloudinary.
5. Patch Sanity with `podcastAudioUrl`, duration, byte size, generated timestamp, script, and platform links.
6. RSS feed exposes episodes at `/api/podcast/feed.xml`.

## Imgix / iMix Management API

The user called this "imix"; the provided `ak_...` key validated as an Imgix Management API key.

| Env var | Purpose |
| --- | --- |
| `IMIX_API_KEY` | User-facing alias for the key. |
| `IMGIX_API_KEY` | Imgix Management API key. |
| `IMGIX_BASE_URL` | Base URL, usually `https://api.imgix.com`. |

Utility:

- `pnpm --filter @workspace/scripts run imgix:check`

Current validation:

- The local key was checked with a read-only source-list request.
- It was valid and saw one source named `Imgix Storage`.

Possible capabilities depend on permissions assigned in Imgix:

- Analytics reports
- Source create/list/edit/deploy
- Cache purge
- Asset Manager browse
- Asset Manager edit/upload

Auth format:

```text
Authorization: Bearer <key>
```

## Public frontend API client

Generated clients live in:

- `lib/api-client-react/src/generated/`
- `lib/api-zod/src/generated/`

Do not edit generated files manually. Update `lib/api-spec/openapi.yaml`, then run:

```sh
pnpm --filter @workspace/api-spec run codegen
```

## Local validation commands

Use these after API-related changes:

```sh
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/scripts run cohere:check
pnpm --filter @workspace/scripts run imgix:check
pnpm --filter @workspace/scripts run resend:check
pnpm run typecheck
PORT=5000 BASE_PATH=/ API_PROXY_TARGET=http://localhost:5000 pnpm run build
```

The `cohere:check` and `imgix:check` commands are read-only.
