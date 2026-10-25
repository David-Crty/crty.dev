# crty.dev

David Courtey's personal site: Astro, static, pnpm, Node 24.

- `pnpm dev`, `pnpm check`, `pnpm build`. CI runs `check` then `build`.
- `pnpm github:cache` refreshes `src/data/github-cache.json`, the fallback for star and merged-PR
  counts when the GitHub API is unreachable at build time.
- `pnpm og` re-renders `public/og.png` from `scripts/og/og.html`.

## Design

Read `docs/design-system.md` before touching anything visual: it holds the rules the CSS cannot
express (no VCR kitsch, one tape per page, what each token is for, content rules).

`src/styles/tokens.css` is the source of truth for token values, and `src/styles/bundle.css` for
how the two modes differ. The site began from a Design System artifact on claude.ai; that is a
historical snapshot and the code has moved on, so never sync from it.
