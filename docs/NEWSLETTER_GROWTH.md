# Newsletter Growth — First Digest & Sponsorship

Grow the free list before paid tiers. PrimeAxis uses **Resend** for transactional welcome emails and a script for manual digest sends.

---

## 1. Verify Resend DNS

```powershell
pnpm --filter @workspace/scripts run resend:check
```

Confirm `primeaxishq.com` shows **verified** in the Resend dashboard. Full steps: [RESEND_DNS_SETUP.md](./RESEND_DNS_SETUP.md).

Required env vars:

```
RESEND_API_KEY=
RESEND_FROM_EMAIL=PrimeAxis Tech <news@primeaxishq.com>
RESEND_REPLY_TO=hello@primeaxishq.com
```

---

## 2. Preview the first digest (no send)

```powershell
pnpm --filter @workspace/scripts run newsletter:digest -- --dry-run
```

Optional env:

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEWSLETTER_SLUG` | `the-axis` | Which list to target |
| `DIGEST_LIMIT` | `5` | Number of recent articles |
| `DIGEST_SPONSOR_TEXT` | — | e.g. `Acme Corp` for sponsored issue |

---

## 3. Send the first digest

After subscribers exist in Sanity (`newsletterSubscriber` docs):

```powershell
# Optional sponsor line for first monetized issue
$env:DIGEST_SPONSOR_TEXT="Your Sponsor Name"
pnpm --filter @workspace/scripts run newsletter:digest
```

Each subscriber receives a personalized issue with top stories and unsubscribe link.

---

## 4. Monetize without code

- Sell sponsor slots via [advertise@primeaxishq.com](mailto:advertise@primeaxishq.com) — see [MEDIA_KIT.md](./MEDIA_KIT.md)
- Set `DIGEST_SPONSOR_TEXT` when sending a sponsored issue
- Footer still says “Free, always” until you launch a paid tier

---

## 5. Paid tier (future)

Not implemented. Would require Stripe + member gating. See [API_INTEGRATIONS.md](./API_INTEGRATIONS.md).
