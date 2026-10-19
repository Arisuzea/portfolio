# DESIGN.md — neon-site

Neon-punk single scrolling page: hero → about → projects card grid → links hub.
Dark ground, dominant purple accents, punk-brute display type, mono body, modern
hover micro-interactions, phase-2 ambient neon background + scroll-linked motion.
All copy comes from `content.json` (real content since phase 2; social/email slots
stay `PLACEHOLDER`).

## Color tokens

Defined in `:root` of `public/css/styles.css` (the single stylesheet):

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
- Both vendored via Fontsource npm packages imported in `src/pages/index.astro`
  (Astro bundles the CSS + woff2 into `dist/`; no runtime CDN — criterion 9).

## Motion specs

- Every interactive element (nav items, CTA button, role card, project cards,
  card title/tag sub-elements, link chips, email link) has a `:hover` rule — 8
  distinct rules in the phase-1 set; phase 2 adds a scrollbar-thumb hover, 9
  total; **each hover block re-declares its `transition`** so the
  built CSS passes per-rule greps.
- Durations: 150–220 ms, all `ease-out` (spec §4 band is 150–300 ms).
- Hover vocabulary: `translateY(-2..-4px)` lift, `translateX` tag nudge, `scale(1.015)`,
  hard offset shadow on the CTA, purple glow via `box-shadow`/`text-shadow`.
- `:focus-visible` universal ring: 2px `--accent-hot` outline, 3px offset.
- `@media (prefers-reduced-motion: reduce)` sets `animation: none !important`
  and `transition: none !important` on `*` (+ pseudo-elements) — all motion
  neutralized. Phase 1 had no ambient loops; phase 2's layers/reveals are stopped
  by the same universal block (`animation: none` also clears scroll-driven
  timelines), and it stays the LAST section of the stylesheet.
- Gritty texture: inline SVG `feTurbulence` grain (data URI, zero requests) +
  4px scanline `repeating-linear-gradient`. Decorative, no animation.

## Phase-2 motion

CSS-only (zero JS, zero new runtime assets — criterion §3-10). All new `@keyframes`
are `bg-`/`scroll-` prefixed. Ambient layer budget: 2 of 3 (spec §4). Sources: MDN
scroll-driven animations guide (via `animation-timeline` reference), `@supports`
at-rule reference, `::-webkit-scrollbar` reference.

| Layer / effect | Element | Motion | Duration / parallax | Fallback |
| --- | --- | --- | --- | --- |
| Ambient glow | `.bg-layer` (fixed, `inset: 0`, z-index −2, `pointer-events: none`, `overflow: hidden`) | 3 radial purple glows (tokens rgba, alphas 0.16–0.22 ≤ 0.25 rule), drift via `@keyframes bg-drift` — scale(1.12) constant + translate3d ≤ 2vw/1.5vh, transform-only | 90s linear infinite `alternate` | layer visible at rest; no guard needed (animation is the only motion on it) |
| Scroll parallax | `.bg-grid` (fixed, `inset: 0`, z-index −1) | synthwave 72px grid pans one tile across root scroll via `@keyframes scroll-grid-pan` + `animation-timeline: scroll(root block)` | parallax ≈ 72px per full scroll (factor ~0.06×), scale(1.06) keeps edges covered | wrapped in `@supports (animation-timeline: scroll(root block))` — non-supporting browsers: grid static, fully visible |
| Section reveals | `.sec-heading` `.sec-blurb` `.about-blurb` `.card-grid` `.link-hub` (wrappers only — never a hover-transform element, so phase-1 hovers stay intact) | `@keyframes scroll-reveal`: opacity 0→1 + translateY 12→0 | `animation-timeline: view()`, `animation-range: entry 0% entry 55%`, `fill both` | `@supports (animation-timeline: view())` guard; base (unguarded) opacity is 1 → failure mode "no motion", never "invisible content" |
| Hero entrance | `.hero-status` + `.hero-name` | one-time `scroll-hero-in`: opacity 0→1, letter-spacing easing back to each element's base, translateY 10→0 | 550ms ease-out, fill both (≤ 600ms band) | time-based; with reduced-motion the universal kill-switch leaves elements at base style |
| Neon scrollbar | `::-webkit-scrollbar` + `-track` + `-thumb` (thumb gradient `--accent`→`--accent-hot`, track `--bg-raise`, 10px + 2px transparent-border inset) | hover: thumb → `--accent-hot` (9th `:hover` rule) | n/a | Firefox et al.: standard `scrollbar-color`/`scrollbar-width` inside `@supports not selector(::-webkit-scrollbar)` (MDN's fallback pattern; set only where the pseudo-element is absent so it never overrides webkit styling per MDN's override warning) |

Overflow safety: both fixed layers are `inset: 0`, `overflow: hidden`, transforms
bounded and constant-scale-padded — fixed elements never contribute to the
document's scrollable area. `scripts/verify.mjs` now additionally asserts
`getComputedStyle(section).opacity >= 0.99` for the four section ids at scrollY 0
(§11-6 base-visible check); existing 375/768/1440 overflow checks untouched.

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

1. **Stylesheet lives in `publicDir` (`public/css/styles.css`), not a `<style>` block
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
7. **Phase 2: `compressHTML: false` in `astro.config.mjs`.** Astro 5.18.2 minifies
   built HTML by default (`compressHTML` defaults to true per the configuration
   reference), collapsing `dist/index.html` to one line — that makes criterion
   §11-2's `grep -c '<four project URLs>' ≥ 4` unsatisfiable (one physical line can
   match once). `compressHTML: false` is the documented Astro switch; cost is a few
   KB of whitespace in a 1-page dist, and `site`/`base` stay untouched.

## Anti-decisions

- No JS animation, no autoplay ambience (spec §4 motion rule + no guard needed).
- No secondary pages (spec §4 layout).
- No remote assets of any kind (spec §7 / criterion 9).
