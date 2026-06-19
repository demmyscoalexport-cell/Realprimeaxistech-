# Affiliate Program Setup — PrimeAxis Tech

Affiliate buy links are managed in **Sanity Studio** on review and buying-guide article documents. The site shows “Where to buy” buttons and links to the [Affiliate disclosure](/affiliate-disclosure) page.

---

## 1. Join affiliate programs

| Program | Best for | Sign up |
|---------|----------|---------|
| **Amazon Associates** | Reviews, buying guides, gadgets | https://affiliate-program.amazon.com |
| **Best Buy Affiliate** | Consumer electronics | https://bestbuyaffiliates.com |
| **B&H Photo Affiliate** | Cameras, pro gear | https://www.bhphotovideo.com/find/AffiliateInfo.jsp |
| **Impact / CJ** | Brand-direct deals | https://impact.com |

After approval, each program gives you a **tracking tag** (e.g. Amazon `?tag=yourtag-20`).

---

## 2. Build affiliate URLs

Amazon example:

```
https://www.amazon.com/dp/B0PRODUCTID?tag=primeaxis-20
```

Always use your assigned tag. Do not shorten links in a way that hides the destination.

---

## 3. Add links in Sanity Studio

### Reviews

1. Open **Sanity Studio** → Reviews → select a review  
2. Scroll to **Affiliate buy links**  
3. Add retailer (Amazon, Best Buy, B&H, Other), full affiliate URL, optional button label  
4. Publish

### Buying guides (articles tagged `buying-guide`)

1. Open **Articles** → select a buying-guide article  
2. Add **Affiliate buy links** (same fields as reviews)  
3. Publish

Buy buttons appear in the article sidebar when at least one link is set.

---

## 4. FTC compliance (US)

- Disclosure page: https://primeaxishq.com/affiliate-disclosure  
- Footer link: “Affiliate disclosure”  
- Review/article buttons use `rel="sponsored"`  
- Mention affiliate relationships in podcast scripts when recommending products

---

## 5. Verify locally

```powershell
pnpm dev:api
pnpm dev:site
# Open a review or buying-guide article with links configured
```

---

## 6. Optional env vars (future automation)

No link builder is in the codebase yet — URLs are manual in Sanity. If you add Amazon Product Advertising API later, store credentials only in `.env` (never commit):

```
# Not used by the app today — documentation only
AMAZON_ASSOCIATES_TAG=primeaxis-20
```
