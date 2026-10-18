# DESIGN.md — neon-site

Neon-punk single scrolling page: hero → about → projects card grid → links hub.
Dark ground, dominant purple accents, punk-brute display type, mono body, modern
hover micro-interactions. All copy placeholder (`content.json`).

## Color tokens

Defined in `:root` of `public/styles.css` (the single stylesheet):

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#0B0B10` | near-black ground (spec §4) |
| `--bg-panel` | `#141420` | card/panel fill |
| `--bg-raise` | `#1B1B2B` | raised surfaces |
| `--ink` | `#E8E8F0` | primary text |
| `--ink-dim` | `#A2A2C4` | secondary text |
| `--accent` | `#A855F7` | dominant purple (≈90% of accent usage) |
| `--accent-hot` | `#D946EF` | magenta-purple accent, glows, focus rings |
| `--line` | rgba purple | hairline borders |
| `--glow-soft` / `--glow-hard` | purple text/box shadows | neon glow |

Accent hue audit: every accent use is `#A855F7` (271°) or `#D946EF` (307°), both
purple/magenta-purple; neutral grays carry no hue. Well above the 90% bar.

## Typography

- Display: **Anton** (punk-brute condensed grotesque; near-condensed + heavy =
  brutal, all-caps by class rule). Single static weight 400 — the only weight
  that ships for the face, so weight variety is a font-feature dead-end; all-caps
  + letter-spacing carry the hierarchy.
- Body/UI: **Spline Sans Mono Variable** (`wght` axis 100–800) — mechanical
  mono suits a punk-technical vibe and keeps CJK-free placeholder text honest.
- Both vendored via Fontsource npm packages imported in `src/index.astro`
  (Astro bundles the CSS + woff2 into `dist/`; no runtime CDN — criterion 9).

## Motion specs

- Every interactive element (nav items, CTA button, role card, project cards,
  card title/tag sub-elements, link chips, email link) has a `:hover` rule — 8
  distinct rules total; **each hover block re-declares its `transition`** so the
  built CSS passes per-rule greps.
- Durations: 150–220 ms, all `ease-out` (spec §4 band is 150–300 ms).
- Hover vocabulary: `translateY(-2..-4px)` lift, `translateX` tag nudge, `scale(1.015)`,
  hard offset shadow on the CTA, purple glow via `box-shadow`/`text-shadow`.
- `:focus-visible` universal ring: 2px `--accent-hot` outline, 3px offset.
- `@media (prefers-reduced-motion: reduce)` sets `animation: none !important`
  and `transition: none !important` on `*` (+ pseudo-elements) — all motion
  neutralized. No ambient loops exist, so the guard is the only motion kill-switch.
- Gritty texture: inline SVG `feTurbulence` grain (data URI, zero requests) +
  4px scanline `repeating-linear-gradient`. Decorative, no animation.

## Layout / overflow strategy

- One page, sections carry their own padding (`--edge: clamp(14px, 4vw, 44px)`).
- Card grid `repeat(2, minmax(1px, 1fr))`, single column under 640px; cards and
  chips set `min-width: 0` and rely on `overflow-wrap: break-word` (inherited from
  body) so pasted long words wrap instead of forcing `scrollWidth` past viewport.
- Fluid type via `clamp()` throughout; nothing sized in px above ~90px wide.
- `dist/index.html` keeps `id="hero|about|projects|links"` in document order
  (verified by grep gate).

## Deviation rationale

Non-default choices vs idiomatic Astro + CSS (spec §4 "stack freedom" audit):

1. **Stylesheet lives in `publicDir` (`public/styles.css`), not a `<style>` block
   or `src/**/*.css` import.** Astro 5.18.2 has no way to keep built page CSS
   un-minified (no `--no-minify` in `astro build --help`; no `minify` key in the
   configuration reference), and Astro minifies any bundled stylesheet — minified
   CSS collapses selectors onto one line, breaking criteria §11-4 and §11-5
   greps. `publicDir` files are copied as-is (configuration reference), so the
   stylesheet arrives in `dist/` untouched and greppable. This *is* idiomatic
   Astro (publicDir is the documented escape hatch), just used deliberately.
2. **`@fontsource/anton` (static) instead of `@fontsource-variable/*` for the
   display face.** Fontsource publishes no variable build of Anton (Anton ships
   one weight); spec §5 *prefers* variable packages, so the static package is
   used with the reasoning recorded here. Spline Sans Mono is the variable
   package as preferred.
3. **Placeholder `site: "https://your-handle.github.io/"` in `astro.config.mjs`** —
   Astro 5.18.2 hard-rejects an empty `site` value ("site: Invalid url", build
   aborts), so the overnight state ships a syntactically valid placeholder handle
   for the morning task to replace with the real one (user-page style per spec §10;
   project-page switch `base: "/neon-site"` is a documented comment).
4. **Playwright (npm `playwright@^1.64.1`, chromium channel) for the viewport
   check** — spec §3-3 mandates a Playwright check; no other animation/testing
   library was added.
5. **No React, Tailwind, GSAP, or content-cards runtime.** Spec default is
   idiomatic Astro + CSS; hover micro-interactions are pure CSS transitions,
   content is static JSON → nothing justifies a framework deviation, so none was
   taken. `scripts/` are plain Node (node:fs, node:url) + Playwright only.
6. **Fonts imported in frontmatter (`import "@fontsource/anton"`) rather than
   hand-copied woff2.** Fontsource npm + Astro CSS import is the documented
   vendoring path (spec §5); Astro rewrites the woff2 URLs to local hashed paths.

## Anti-decisions

- No JS animation, no autoplay ambience (spec §4 motion rule + no guard needed).
- No secondary pages (spec §4 layout).
- No remote assets of any kind (spec §7 / criterion 9).
