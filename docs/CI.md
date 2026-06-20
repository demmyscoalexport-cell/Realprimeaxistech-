# Continuous Integration

GitHub Actions runs on every **pull request** and on **pushes to `main`** (and `cursor/**` branches).

## What CI runs

The workflow in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) mirrors the Vercel production build:

1. `pnpm install --frozen-lockfile` (pnpm **10.33.0**, Node **22**)
2. Regenerate OpenAPI clients and fail if generated files drift
3. `pnpm run typecheck`
4. `pnpm run build:vercel` — same command as `buildCommand` in [`vercel.json`](../vercel.json)

If any step fails, the workflow fails. Enable **branch protection** on `main` (see below) to block merges until CI passes.

## Production deploys

Vercel auto-deploys when changes land on **`main`**. CI does not deploy; it validates that the same build Vercel runs will succeed before or alongside merge.

After a green CI run on `main`, confirm the deployment in the [Vercel dashboard](https://vercel.com). No manual redeploy is needed unless you changed env vars only.

## Local checks (before push)

```powershell
pnpm install
pnpm run typecheck
pnpm run build:vercel
```

Optional (requires real keys in `.env`):

```powershell
pnpm --filter @workspace/scripts run env:check
```

## Dependabot

[`.github/dependabot.yml`](../.github/dependabot.yml) opens weekly PRs for npm/pnpm dependency updates (dev deps grouped). Review and merge when CI is green.

## Recommended GitHub settings

On **Settings → Branches → Branch protection rules** for `main`:

- Require status check: **CI / build**
- Require branches to be up to date before merging
- (Optional) Require pull request reviews

This prevents broken builds from reaching production when Vercel would auto-deploy.
