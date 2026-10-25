# Deployment

Static files from `dist/` in a private S3 bucket (`crty-dev-site`, eu-west-3),
served by CloudFront at crty.dev; www.crty.dev redirects to the apex. The
infrastructure is Terraform in `David-Crty/infra`, under `terraform/crty.dev`.

## CI (`.github/workflows/ci.yml`)

Every push and pull request type-checks and builds. On `main` (a push or a
manual run) the `deploy` job then:

1. assumes the `crty-dev-deploy` role through GitHub OIDC: no AWS keys are
   stored anywhere, and the role only trusts runs on `main` of this repo;
2. uploads `_astro/` with `public, max-age=31536000, immutable` (file names are
   hashed), never deleting old files a cached page may still reference;
3. syncs everything else with `public, max-age=21600` (6 h) and `--delete`;
4. invalidates `/*` on CloudFront (one path, whatever the number of files).

CloudFront follows each object's `Cache-Control`. The edge is refreshed by the
invalidation; a browser that already has a page may keep it up to 6 hours.

The job reads three repository variables, from the Terraform outputs:
`AWS_ROLE_ARN`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`.

## CloudFront

- A CloudFront Function rewrites `/path/` to `/path/index.html` (S3 behind an
  origin access control serves no index documents), 301s `/path` to the
  canonical `/path/`, and 301s www to the apex.
- 403 and 404 from S3 both serve `/404.html` with status 404.
- Response headers: HSTS (2 years, subdomains, preload), `nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
  and a CSP.

## CSP and the theme script

The CSP allows scripts from `'self'` plus the hash of the one inline script,
`src/components/ThemeScript.astro`. **Changing that script changes its hash**:
update `theme_script_hash` in `terraform/crty.dev/cdn.tf` and apply, or the
mode is no longer set before first paint. Recompute it from a build:

```bash
node -e 'const h=require("fs").readFileSync("dist/index.html","utf8").match(/<script>([\s\S]*?)<\/script>/)[1];
console.log("sha256-"+require("crypto").createHash("sha256").update(h).digest("base64"))'
```

Everything else stays external on purpose (`assetsInlineLimit: 0`,
`inlineStylesheets: 'never'`), so no other hash is needed. The JSON-LD block is
data, not script. `style-src-attr 'unsafe-inline'` is for Shiki, which colours
code blocks through `style` attributes; it allows attributes only, never
`<style>` blocks or script.

## GitHub stats

`src/lib/github.ts` fetches at build time and falls back per value to
`src/data/github-cache.json`. Refresh the committed cache with
`GITHUB_TOKEN=... pnpm github:cache`; set `GITHUB_OFFLINE=1` to build from the
cache only.
