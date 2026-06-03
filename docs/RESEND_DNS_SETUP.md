# Resend DNS Setup for primeaxishq.com

Use this guide to understand and re-check the Resend DNS setup for `primeaxishq.com`.

The Resend dashboard is the source of truth for the exact DNS record values. Do not guess the values from screenshots. Copy each value directly from Resend into your domain/DNS provider.

## Goal

Verify `primeaxishq.com` so PrimeAxis can send newsletter and welcome emails from:

```text
PrimeAxis Tech <news@primeaxishq.com>
```

The app reads this from:

```env
RESEND_FROM_EMAIL=PrimeAxis Tech <news@primeaxishq.com>
RESEND_REPLY_TO=hello@primeaxishq.com
```

## Current verification status

`pnpm --filter @workspace/scripts run resend:check` currently returns:

```text
Resend API key is valid. Domains visible: 1
- primeaxishq.com: verified (us-east-1)
```

That means the Resend account currently has the intended domain verified. Keep the DNS records in place; removing them can cause Resend verification to fail later.

## If you need to recreate or audit DNS records

1. Open Resend.
2. Go to Domains.
3. Open `primeaxishq.com`.
4. Copy every DNS record shown by Resend.
5. Open the DNS manager where `primeaxishq.com` is hosted.
6. Add the records exactly.
7. Return to Resend and click `Verify DNS Records`.
8. Wait for verification. It can be quick, but DNS propagation can take hours.

## Required records

Fill this table from the Resend dashboard.

| Purpose | Type | Name / Host | Value / Content | Priority | Notes |
| --- | --- | --- | --- | --- | --- |
| DKIM | TXT | `resend._domainkey` | Copy exact `p=...` value from Resend | n/a | This is visible in your screenshot. Copy the full value, not the truncated preview. |
| SPF / Bounce handling | MX or TXT | Copy from Resend | Copy from Resend | Copy from Resend if MX | Resend may show SPF-related records and/or an MX record for bounce/complaint feedback. |
| Additional Resend records | TXT / CNAME / MX | Copy from Resend | Copy from Resend | Copy from Resend if shown | Add every record Resend lists. |
| DMARC | TXT | `_dmarc` | Start with `v=DMARC1; p=none; rua=mailto:dmarc@primeaxishq.com` | n/a | Recommended for trust. You can tighten policy later after monitoring. |

## Important DNS provider notes

- If the provider asks for `Name`, `Host`, or `Record name`, use the Resend `Name`.
- If the provider automatically appends the domain, enter only the host part. Example:
  - Resend shows: `resend._domainkey`
  - DNS provider may save it as: `resend._domainkey.primeaxishq.com`
- If the provider asks for TTL, use the default or `600`.
- For TXT values, paste the full content exactly.
- Do not create multiple SPF TXT records at the same host. If an SPF record already exists, it may need to be merged.

## How to verify locally

After Resend says the domain is verified, run:

```sh
pnpm --filter @workspace/scripts run resend:check
```

That command only lists domains; it does not send email.

## Before sending production email

Confirm these are true:

- `primeaxishq.com` shows as verified in Resend.
- `RESEND_FROM_EMAIL=PrimeAxis Tech <news@primeaxishq.com>` is set in production.
- `RESEND_REPLY_TO=hello@primeaxishq.com` is set in production.
- The newsletter form is wired to the API route.
- The API has `SANITY_API_TOKEN` configured so subscriptions can write `newsletterSubscriber` documents.
- Privacy policy mentions email collection.
- Unsubscribe/compliance flow exists before recurring newsletters are sent.

## If verification fails

Check:

- Did you copy the full DKIM value from Resend?
- Did your DNS provider append the domain twice?
- Did you add records at the correct domain, `primeaxishq.com`?
- Are there duplicate SPF records at the same host?
- Did you wait long enough for DNS propagation?
- Does Resend show a more specific error beside one of the records?
