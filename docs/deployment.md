# Deployment (not done yet)

The site builds to static files in `dist/`. CI (`.github/workflows/ci.yml`)
checks and builds; nothing deploys yet. The old Docker/Helm deployment was
removed with the Hugo site, so the current crty.dev keeps serving the old
site until this is wired up.

## Known facts

- `crty.dev` is delegated to Route 53 (`ns-*.awsdns-*`), so the records can be
  managed from Terraform with the Route 53 provider.
- The default branch is `master`; the rename to `main` is a separate task.

## Open questions

- AWS account and region for the bucket; whether the Route 53 hosted zone is
  in that same account.
- Terraform state backend.

## Plan (`infra/`, Terraform)

- Private S3 bucket, reachable only through CloudFront with Origin Access
  Control.
- CloudFront: ACM certificate in `us-east-1`, HTTP/2 and HTTP/3, 403/404
  mapped to `/404.html`.
- A CloudFront Function on viewer request rewriting `/path/` and `/path` to
  `/path/index.html` (S3 behind OAC serves no index documents). Leave paths
  with an extension alone.
- Response-headers policy: HSTS, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and this CSP:

  ```
  default-src 'self'; script-src 'self' 'sha256-ewHRV69hODM8imyUDH8JKeRkCDczYCgfgLtWQpQTS5Q='; style-src 'self'; style-src-attr 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'
  ```

  The hash is of the inline theme script in `src/components/ThemeScript.astro`
  and changes whenever that script changes; recompute it from `dist/index.html`.
  Everything else is external on purpose (`assetsInlineLimit: 0`,
  `inlineStylesheets: 'never'`). The JSON-LD block is data, not script, and
  needs no hash. `style-src-attr 'unsafe-inline'` is for Shiki, which colours
  code blocks through `style` attributes (pointing at the token variables);
  it allows attributes only, never `<style>` blocks or script.
- An IAM role for GitHub Actions via OIDC (no long-lived keys), allowed to
  `s3 sync` the bucket and create invalidations on the distribution.

## Plan (GitHub Actions)

On push to the default branch, and daily on a schedule so GitHub stats stay
fresh:

1. `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build` (with
   `GITHUB_TOKEN`, used for the stars and merged-PR counts).
2. `aws s3 sync dist/_astro s3://<bucket>/_astro --cache-control "public, max-age=31536000, immutable"`
3. `aws s3 sync dist s3://<bucket> --exclude "_astro/*" --delete --cache-control "public, max-age=0, must-revalidate"`
4. Invalidate the HTML paths (`/`, `/*/`, `/404.html`, `/rss.xml`,
   `/sitemap-*`) on CloudFront.

## GitHub stats

`src/lib/github.ts` fetches at build time and falls back per value to
`src/data/github-cache.json`. Refresh the committed cache with
`GITHUB_TOKEN=... pnpm github:cache`; set `GITHUB_OFFLINE=1` to build from the
cache only.
