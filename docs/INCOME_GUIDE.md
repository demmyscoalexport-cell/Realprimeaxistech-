# Income & Monetization — Quick Reference

Operational guides for generating revenue on PrimeAxis Tech. See the attached plan for strategy context.

| Guide | Purpose |
|-------|---------|
| [MEDIA_KIT.md](./MEDIA_KIT.md) | Sponsorship packages, rates, how to book |
| [AFFILIATE_SETUP.md](./AFFILIATE_SETUP.md) | Join affiliate programs, add links in Sanity |
| [PODCAST_SUBMISSION.md](./PODCAST_SUBMISSION.md) | Generate episodes, submit RSS to Spotify/Apple |
| [NEWSLETTER_GROWTH.md](./NEWSLETTER_GROWTH.md) | Resend DNS, first digest, sponsor issues |
| [RESEND_DNS_SETUP.md](./RESEND_DNS_SETUP.md) | Domain verification for email |

## Site pages

| URL | Purpose |
|-----|---------|
| `/advertise` | Sponsorship packages + contact |
| `/affiliate-disclosure` | FTC affiliate disclosure |

## Scripts

```powershell
pnpm --filter @workspace/scripts run podcast:check      # Validate podcast env
pnpm --filter @workspace/scripts run podcasts          # Generate audio episodes
pnpm --filter @workspace/scripts run videos:patch-urls # Set videoUrl on Sanity videos
pnpm --filter @workspace/scripts run resend:check     # Verify Resend API + DNS
pnpm --filter @workspace/scripts run newsletter:digest -- --dry-run
```

## CMS fields (Sanity Studio)

- **Reviews** — `affiliateLinks`, `isSponsored`
- **Articles** — `affiliateLinks` (buying guides), `isSponsored`
- **Videos** — `videoUrl` (YouTube/MP4)

Buy buttons render automatically when affiliate links are published.
