# Hostinger → Headless WordPress for PrimeAxis Tech

A 15-minute setup. By the end you'll have a running WordPress install, the PrimeAxis CMS plugin loaded, and an Application Password ready to give to the migration script.

---

## 1. Buy hosting (~3 min)

1. Go to **https://hostinger.com** → **WordPress Hosting**.
2. Choose **Premium Web Hosting** (~$2.99/mo on a 24-mo term). It includes:
   - 100 websites, free SSL, free domain year 1
   - LiteSpeed + WP-optimized cache
   - Daily backups
3. At checkout: register a free domain (e.g. `primeaxistech.com`) or skip if you'll attach an existing one.
4. Pick a data-center near your audience (US East, EU, or Asia).

## 2. Install WordPress (~2 min)

1. Open **hPanel** → **Websites** → **Add Website**.
2. Choose **WordPress** → enter site title (e.g. *PrimeAxis CMS*) and pick an admin username + password. **Save these** — you'll log in to `/wp-admin` with them.
3. Hostinger spins it up in about 60 seconds. Wait for the green "Ready" badge.

## 3. Drop in the PrimeAxis bridge plugin (~3 min)

This is what makes WordPress speak the same JSON shapes as Sanity did.

1. In hPanel for your site → **File Manager** (or use SFTP).
2. Navigate to `wp-content/`.
3. **Create a folder named `mu-plugins`** if it doesn't exist (lowercase, exact spelling).
4. Upload **`wordpress/primeaxis-cms.php`** from this repo into that folder.
5. Done — must-use plugins activate automatically. No Plugins page action needed.

Verify it loaded by visiting: `https://YOUR-DOMAIN.com/wp-json/wp/v2/types`. You should see `review` and `video` listed alongside `post` and `page`.

## 4. Generate an Application Password (~2 min)

This is what the migration script (and the running api-server) will use to authenticate.

1. Log in to `https://YOUR-DOMAIN.com/wp-admin`.
2. Go to **Users → Profile** (top-right user menu).
3. Scroll to **Application Passwords**.
4. Name it `primeaxis-migration` and click **Add New**.
5. Copy the 24-character password WordPress shows you. **You only see it once.**

## 5. Add the credentials to PrimeAxis (~1 min)

Edit `.env` in this repo (or in your VS Code project) and add:

```bash
# WordPress headless source
CMS_SOURCE=wordpress
WORDPRESS_URL=https://YOUR-DOMAIN.com
WORDPRESS_USER=your-wp-admin-username
WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
```

Leave the spaces in the application password — they're part of it.

## 6. Run the one-shot migration (~5–10 min)

From the repo root:

```bash
pnpm --filter @workspace/scripts run migrate:sanity-to-wp
```

You'll see:

```
▶ Sanity → WordPress migration
  source: jyppkgsk/production
  target: https://primeaxistech.com
▶ Categories
  + ai (created #12)
  ...
▶ Authors
  + alex-rivera (created #2)
  ...
▶ Articles
  found 208 articles in Sanity
  [1/208] + ai-frontier-models-2026
  ...
✅ Done.
```

The script is **idempotent** — re-run it any time to sync new Sanity changes into WordPress.

> Hero images are not re-uploaded to WordPress. They stay on **Cloudinary's CDN** (which is faster than Hostinger anyway) and are referenced by the `hero_image_url` post-meta field.

## 7. Restart the API server

```bash
# In Replit, the workflow auto-restarts. Locally:
pnpm --filter @workspace/api-server run dev
```

The api-server now reads from WordPress because `CMS_SOURCE=wordpress`. Visit your frontend — articles, categories, and authors are now coming from WP.

To roll back to Sanity for any reason: set `CMS_SOURCE=sanity` and restart the server. Both adapters stay in the codebase forever.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `WP 401` on the migration | App Password wrong or `WORDPRESS_USER` doesn't match the user that generated it |
| `WP 403` creating users | Your user needs the **Administrator** role to create authors |
| `WP 404` on `/wp-json/wp/v2/reviews` | The mu-plugin didn't load — re-check the file is at `wp-content/mu-plugins/primeaxis-cms.php` |
| Frontend shows wrong accent colors | Re-run the migration; category meta needed updating |
| Hero images broken | Check that the original Cloudinary URLs are still public (they are unless you deleted them) |
| WP REST blocked by security plugin | Hostinger ships clean — but if you added Wordfence, allow `/wp-json/*` |

---

## Optional polish (do later)

- **Caching plugin**: install **LiteSpeed Cache** (free) → enable Object Cache + Browser Cache. REST responses cache automatically.
- **SEO**: install **Rank Math** (free). Even on a headless site, it gives editors an SEO panel inside WP and exposes the data via REST so the frontend can render meta tags.
- **Editor UX**: install **Advanced Custom Fields** (free) and bind nicer UI to the post-meta fields the bridge plugin registered (subtitle, key takeaways, AI summary, etc.). Your meta keys already match ACF conventions.
