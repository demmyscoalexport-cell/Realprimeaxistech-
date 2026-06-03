# [Project name]

_Replace the heading above with the project's name, and this line with one sentence describing what this app does for users._

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes if future relational app data is used
- Required env for CMS writes: `SANITY_API_TOKEN`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Optional DB: PostgreSQL + Drizzle ORM for future relational app data
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/primeaxis/` — React + Vite frontend (PrimeAxis Tech site)
  - `src/pages/` — Home, Category, Article, static (About/Contact/Privacy/Terms)
  - `src/components/header.tsx` — top nav (PRIMARY_NAV holds 8 short labels)
- `artifacts/api-server/` — Express 5 + Drizzle backend
- `artifacts/studio/` — Sanity Studio (project `jyppkgsk` / dataset `production`)
- `scripts/src/regen-by-sub.ts` — Per-subcategory content + image regenerator (HN → Claude → WaveSpeed → Cloudinary). Idempotent via `regen-v3` tag.
- `scripts/src/generate-podcast-audio.ts` — Article → ElevenLabs MP3 → Cloudinary → Sanity podcast metadata. Idempotent via existing `podcastAudioUrl` unless `FORCE=1`.
- `scripts/src/check-cohere.ts` — Read-only Cohere API key check. Uses `COHERE_API_KEY` to list visible models without running inference.
- `scripts/src/check-imgix.ts` — Read-only Imgix/iMix Management API key check. Uses `IMGIX_API_KEY` or `IMIX_API_KEY` and lists visible sources.
- `scripts/src/check-resend.ts` — Read-only Resend API key check. Uses `RESEND_API_KEY` to list visible email domains without sending email.
- `scripts/src/check-sanity-token.ts` — Sanity token read/write check. Uses `SANITY_API_TOKEN` to read article count, create a temporary document, then delete it.
- `scripts/src/seed-subcategories.ts`, `enrich-content.ts`, `enrich-images.ts` — earlier seeding pipeline.

## Architecture decisions

- **Sanity is the source of truth** for articles, categories, and authors. The frontend reads via Sanity client; no app DB tables for content.
- **Cloudinary `primeaxis/ai/`** holds all generated hero images, named `article-hero-<slug>`.
- **Cloudinary `primeaxis/podcasts/`** holds ElevenLabs-generated MP3 episodes, named `article-podcast-<slug>`.
- **Per-subcategory visual identity**: `CAT_PROFILE` (11 entries) defines aesthetic + HN keyword extras; `SUB_PROFILE` (63 entries) adds keywords/visual nudge/editorial angle. Image prompt = `title + cat aesthetic + sub visual nudge + cinema technical block`.
- **Hacker News (Algolia)** is used as a free real-world topic anchor — no API key required. We pull ~12 recent headlines per subcategory and feed them to Claude as factual inspiration (not for verbatim copying).
- **Idempotent regen**: every regenerated article carries the `regen-v3` tag. Re-running `regen-by-sub.ts` skips fully-tagged subs and only retries failures.

## Product

PrimeAxis Tech is a premium global tech-media site (Engadget × Wired in tone). 11 categories × ~5 subs each, with longform editorial articles (1500–2000 words), AI summaries, key takeaways, and cinematic hero imagery. Static pages for About / Contact / Privacy / Terms.

## User preferences

- Cinematic / editorial visual tone — no marketing-speak, no emoji in articles, no logos/text in hero images.
- Every subcategory's articles & images must be visually and editorially distinct.

## Gotchas

- **Never run `pnpm dev` at the repo root.** Use the configured workflows.
- **Sanity writes** require `SANITY_API_TOKEN` exported in the shell before running scripts.
- **Newsletter subscriptions** write `newsletterSubscriber` documents to Sanity, so `SANITY_API_TOKEN` must include create/update permissions.
- **Long-running scripts** must be run via a Replit workflow (e.g., `regen-articles`). Bash-detached children (`nohup`/`disown`/`setsid`) get killed when the parent shell exits.
- **Claude JSON output** occasionally appends commentary or truncates mid-array — `regen-by-sub.ts` walks brackets to extract the outermost array and includes a trailing-comma repair fallback. Re-run for any sub still failing — different sampling usually succeeds.
- **WaveSpeed** prompts must end with `no text, no watermark, no logo, no captions` to avoid garbled overlays.
- **ElevenLabs podcasts** require `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `CLOUDINARY_URL`, and `SANITY_API_TOKEN`. Generated episodes are exposed at `/api/podcast/feed.xml` for podcast platforms.
- **Cohere** should live in `.env` as `COHERE_API_KEY`. Use it for semantic search, embeddings, reranking, classification, or Q&A flows when those features are added.
- **Imgix/iMix keys** with the `ak_` prefix are likely Imgix Management API keys. They should live in `.env` as `IMGIX_API_KEY` and/or `IMIX_API_KEY` and be sent as `Authorization: Bearer <key>`.
- **Resend** should live in `.env` as `RESEND_API_KEY`. Newsletter subscriptions send a welcome email only when `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are configured; failures are logged without failing subscription.
- **Header `PRIMARY_NAV`** is intentionally limited to 8 short labels to avoid wrap. Add new categories to the dropdown menu, not the top bar.

## Pointers

- `docs/API_INTEGRATIONS.md` — API purpose, env vars, code locations, and safe usage notes for future AI/dev work.
- `docs/LAUNCH_READINESS.md` — remaining professional launch checklist and production readiness notes.
- `docs/RESEND_DNS_SETUP.md` — DNS checklist for verifying `primeaxishq.com` in Resend.
- `docs/SOCIAL_MEDIA_SETUP.md` — recommended social names, handles, bios, and URL handoff format.
- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
