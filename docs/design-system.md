# Design system

The site borrows from the sleeves of blank VHS tapes from the 80s and 90s: bold stripes and
bands, spec labels like `T-120`, square corners, confident sans type on a plain ground.

**One structure, two skins.** Dark mode is *Diagonal*: a black sleeve with one rainbow tape
rising at an angle. Light mode is *Bands*: warm paper with the same tape lying flat as a stack.
Both modes share the same markup and the same token names. Values live in
`src/styles/tokens.css`; every per-mode difference lives in `src/styles/bundle.css` as a
variable or a `[data-theme="light"]` rule.

## The rule that keeps it from turning kitsch

Borrow the **sleeve**, not the **playback**. Blank-tape packaging was clean corporate graphic
design; the kitsch comes from imitating the VCR itself.

- No VCR glitch effects on content: no chromatic aberration, tracking noise, scanline overlays,
  CRT curvature or blinking `PLAY ▶` font. The 404 page is the one place a tracking glitch is
  allowed.
- One tape per page, large in the hero. It comes back only as small echoes: the band edge on
  the featured repo, the row hover, the footer strip.
- Body text, lists and metadata stay plain and modern. The retro lives in the display type, the
  bands and the labels.
- `band-1` to `band-6` are the only saturated colours. Everything else uses `ground`,
  `ground-raised`, `ink`, `ink-muted`, `rule` and `accent`.
- No tape brand names or marks anywhere. The references inspire the system and are never quoted.

## Content

- First person, plain English, short sentences.
- Sentence case for headings (`Contributing to`, `Writing`). Uppercase only in the `label` style.
- Real numbers only. Stars and merged PR counts come from the GitHub API at build time
  (`src/lib/github.ts`, falling back to `src/data/github-cache.json`); never hard-code or round
  them up.
- No emoji. The only glyphs are `↗` (external link), `→` (internal link) and, once in the
  footer, `◀◀ Rewind` (back to top).
- No icon set and no third-party logos. Links are text labels (`GitHub ↗`, `LinkedIn ↗`, `X ↗`).
- Homepage order: top bar (wordmark, nav, mode toggle), hero (role label, name, outline line,
  intro, links), Maintained, Contributing to, Writing, contact footer.

## Colour

| token | use |
| --- | --- |
| `ground` | Page background. Dark: the black sleeve. Light: warm paper. |
| `ground-raised` | Featured repo panel, light-mode spines, dark-mode row hover. Never a floating card with a shadow. |
| `ink` | Body copy and headings (15:1 or better). Light: also the angled section band, with `ground` text on it. |
| `ink-muted` | Intro copy, dates, repo metadata (6:1 or better). |
| `rule` | Hairlines, the spec list divider, the light footer's paper lines. Decorative, never the only boundary of a control. |
| `accent` | Role label, small section numbers (dark), link hover, primary button, focus ring. Yellow in dark, crimson in light (usable as text on paper, 5.3:1). |
| `on-accent` | Text on an `accent` fill. |
| `band-1`…`band-6` | The tape. Dark: yellow, orange, red, magenta, blue, green. Light: a warm stack from yellow to aubergine. Decorative only: never set text on a band. |

Text must reach 4.5:1 on its ground in both modes (3:1 at 24px+, for control borders, focus
rings and icons).

## Type

Archivo for everything except labels, using its width axis so one variable file serves both
modes; Martian Mono for labels. Both are self-hosted through `@fontsource-variable`.

| style | size / weight | notes |
| --- | --- | --- |
| `display` | 96px, 800 | The name (h1), once per page. Wide (`font-stretch: 125%`) in dark; normal width at 900 in light, via `--display-stretch` and `--display-weight`. |
| `outline` | 44px, 700 | One condensed (62%), outlined, uppercase line under the name. Never body text. |
| `h2` | 40px, 800 | Section titles; follows display's width and weight. Light: 34px, 900, `ground` text in the angled `ink` band. |
| `feature` | 56px, 800 | The maintained repo's name. Follows display per mode. |
| `num` | 80px, 900 | Light only: the line-cut section number. In dark the same element is a small `accent` label. |
| `post` | 22px, 600 | Post titles in the Writing list. |
| `body` | 17px / 1.6, 400 | Paragraphs, in `ink` or `ink-muted`. |
| `label` | 12px mono, 500, 0.08em | Spec lines, nav, dates, repo metadata, buttons, the mode toggle. Uppercase. |

## Layout and shape

- Content max 1200px with a `space-6` gutter (`space-3` on mobile). Sections are `space-7` apart.
- Contributions and posts are rows, not cards: hairline-divided in dark; in light,
  contributions become separate spines with a coloured angled tab.
- Keep the hero copy inside its 600px column so the dark tape never crosses text.
- Everything is square (`radius-0`); `radius-sm` is only for focus-ring corners. In light mode,
  40px angled cuts take the place of rounded corners (section-title band, spine tabs).
- No shadows.

## Focus and themes

- Focus: 2px solid `accent` outline, 3px offset, 3:1 or better on `ground` and `ground-raised`
  in both modes.
- `data-theme="dark"` or `"light"` on `<html>`, defaulting to `prefers-color-scheme`; the
  visitor's choice is saved in `localStorage`. `ThemeScript.astro` sets it before first paint.
- The mode toggle is a two-button group with `aria-pressed`.
- Under `prefers-reduced-motion: reduce`, nothing animates and the theme switch is instant.
