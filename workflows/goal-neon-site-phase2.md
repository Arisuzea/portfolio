# Goal Spec — neon-site phase 2 (content + motion)

## 1. Objective

Upgrade the existing Astro site at `/mnt/Storage/Projects/Active/neon-site/` to the user's real content and a living, animated background with scroll-linked motion, leaving a locally verified, commit-ready repo that the user then pushes themselves.

## 2. Background context

- **Prior mission already ran**: the repo exists (7 commits, remote already set to `https://github.com/ArisuZeA/portfolio.git`, branch `main`), `dist/` is built, `DESIGN.md`, `README.md`, `scripts/verify.mjs`, and `workflows/goal-neon-site.md` (phase-1 spec) exist. Read `DESIGN.md` and `public/css/styles.css` before touching anything — phase 1's design tokens, motion rules, and deviation rationale live there.
- **Stack state**: Astro (`inlineStylesheets: "never"`), single unminified stylesheet at `public/css/styles.css` (deliberate, per DESIGN.md), page at `src/pages/index.astro`, copy injected from root `content.json` at build time. `astro.config.mjs` already carries the correct project-page shape (`site: 'https://arisuZeA.github.io'`, `base: '/portfolio'`) — verify, do not change unless broken.
- **User-supplied content** (to land in `content.json`; keep the file's existing key structure):
  - hero: `name` "Conde Reister Gerald"; `role` "Full-Stack Developer"; `tagline` "In the age of AI, your advantage should be knowing how to organize them"; `status` "Available"; `cta` "See the work".
  - about: `heading` "About"; `blurb` "A computer science student specializing in AI — my workflow stays efficient because the AI agents I build grow alongside my work."; `roleLabel` "AI × CS".
  - projects: `heading` "Work"; `blurb` "Mods, tools, and apps I've built."; items — 1) "PunkCity" — "A modlist website for Cyberpunk 2077." — tag "web" — url `http://punkcity.vercel.app/`; 2) "Lingering Subtitles Fix" — "Skyrim C++ mod that fixes subtitle issues." — tag "C++ / Skyrim" — url `https://github.com/Arisuzea/Lingering-Subtitles-Fix`; 3) "Dialogue Scrolling Fix" — "Skyrim C++ mod that addresses dialogue/camera issues." — tag "C++ / Skyrim" — url `https://github.com/Arisuzea/Dialogue-Scrolling-Fix`; 4) "EduQuiz" — "A gamified quizzing app built during my SHS days." — tag "gamification" — url `https://github.com/Arisuzea/EduQUIZ---Research-Project`.
  - links: `heading` "Elsewhere"; `blurb` "Pick a door."; items — "GitHub" url `https://github.com/ArisuZeA?tab=repositories`, then keep LinkedIn / X / Instagram / Bandcamp slots exactly as PLACEHOLDER (labels and urls); `email` and `emailLabel` stay PLACEHOLDER (email stays unannounced publicly).
- **Motion brief (user-confirmed)**: "the background is dull and lifeless — add moving elements" and "scrolling should look animated too". Interpretation: ambient neon background layer(s) + scroll-linked parallax/reveal + neon scrollbar. CSS-only — no JS animation, no new runtime libraries.
- **Glossary**: *scroll-linked* — CSS `animation-timeline: scroll()`/`view()` (scroll-driven animations); *guard* — wrap scroll-driven features in `@supports (animation-timeline: scroll())` so non-supporting browsers fall back to the static, fully visible base; *reduced-motion rule* — phase 1's `@media (prefers-reduced-motion: reduce)` block that kills `animation`/`transition` on `*` — it must keep killing everything added this phase.

## 3. Success criteria

"Done" = ALL true.

1. `npm run build` exits 0 and `dist/index.html` exists.
2. `dist/index.html` contains `id="hero"`, `id="about"`, `id="projects"`, `id="links"` in document order, and contains "Reister Gerald" plus all four project URLs.
3. `content.json` matches the section-2 content exactly (real hero/about/projects/GitHub values; LinkedIn/X/Instagram/Bandcamp/email slots still prefixed `PLACEHOLDER`).
4. `dist/index.html` contains at least one element with `class="bg-layer"` (or `bg-` prefixed equivalent) — the animated background exists.
5. Motion exists in the built site: three distinct animations covering ambient drift, section reveal, and scroll-parallax — implemented in CSS (`@keyframes` prefixed `bg-`/`scroll-`) or via a bundled JS script in `dist/`; at least one is scroll-linked (`animation-timeline:` in built CSS, or a scroll handler in built JS).
6. Scroll-driven rules are wrapped in `@supports (animation-timeline:` blocks, and the base (unguarded) styles for those elements are fully visible (opacity 1) — failure mode must be "no motion", never "invisible content".
7. The phase-1 `prefers-reduced-motion: reduce` kill-switch still exists in built CSS, unchanged and universal; and if ANY JS motion exists, that script contains a `matchMedia("(prefers-reduced-motion: reduce)")` gate — a CSS media query cannot stop JS.
8. `scripts/verify.mjs` (Playwright, viewports 375/768/1440) exits 0 — no horizontal overflow introduced.
9. A neon scrollbar is styled (`::-webkit-scrollbar` or `scrollbar-style` + thumb/track colors) in purple tokens.
10. `du -sk dist` ≤ 512 — motion is CSS-only; zero new runtime assets, zero external requests (re-run the phase-1 external-ref grep: still zero matches).
11. `git log --oneline | wc -l` is ≥ 8 (≥ 1 new local commit) and `git status -s` is clean.
12. `DESIGN.md` gained a `## Phase-2 motion` section documenting each new layer, its duration/parallax, and its fallback.
13. Final report follows section 13 exactly.

## 4. Constraints

- **Motion design**: (a) at least one `position: fixed` background layer (`pointer-events: none`, negative z-index, `inset: 0`) carrying 2–3 slow-drifting purple radial glows (`@keyframes`, 60–120s, `alternate`, transform-only animation — no layout-triggering props); optionally a synthwave grid/scanline layer with scroll-linked vertical parallax via `animation-timeline: scroll(root)`; (b) section reveals via `animation-timeline: view()` (`@keyframes` from `opacity: 0, translateY(12px)` to visible; animation ends at visible; base state visible under `@supports` fallback); (c) one-time hero entrance (`opacity`/letter-spacing, ≤ 600ms). Keep total ambient layers ≤ 3 to stay GPU-cheap.
- **Style continuity**: reuse only existing `:root` tokens (`--accent`, `--accent-hot`, glows); purple-magenta dominance rules from phase 1 still apply to every new visual; grain/scanline base must remain; nothing may reduce legibility (glow layer opacity ≤ ~0.25 per layer).
- **Overflow safety**: fixed/absolute layers must never extend the scrollable area (`inset: 0`, no positive right/bottom offsets, `overflow: hidden` where a transform moves a layer).
- **Motion implementation**: CSS-first (simplest, cheapest — scroll-driven CSS is the preferred path); JS is explicitly allowed where CSS is clumsy (user-approved). Astro bundles client JS into `dist/` like any static build, so GSAP (or a hand-rolled script) is compatible — but: vendored only (npm-installed, no runtime CDN), transform/opacity-only handlers, no per-frame layout reads, and JS motion MUST self-gate on `matchMedia("(prefers-reduced-motion: reduce)")`. The `@supports` fallback rule applies to the CSS half regardless of choice.
- **Research-first (hard rule)**: before writing `animation-timeline: scroll()/view()`, scrollbar pseudo-element, or `@supports` feature syntax, `web_search` + `web_extract` MDN ("CSS scroll-driven animations", "::-webkit-scrollbar", "@supports") — code from the docs, cite the URLs in the report.
- **Content**: section-2 values are authoritative; do not invent additional biographical content; placeholder slots stay PLACEHOLDER.
- **Git**: local commits only — **never push** (see §7/§9). Do not amend existing commits; add new ones.
- **Doc honesty**: update `DESIGN.md` (and README if instructions change) so docs describe the new state.

## 5. Files, folders, links, or sources to inspect

- `/mnt/Storage/Projects/Active/neon-site/` — the existing project; inspect `src/pages/index.astro`, `public/css/styles.css`, `content.json`, `DESIGN.md`, `workflows/goal-neon-site.md` (phase-1 spec) first.
- MDN references (extract, don't skim snippets): https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scrolling/Scroll-driven_animations ; https://developer.mozilla.org/en-US/docs/Web/CSS/@supports ; https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-scrollbar
- Astro config reference only if needed: https://docs.astro.build/en/reference/configuration-reference/
- Playwright usage: reuse the existing `scripts/verify.mjs` pattern — consult its own code and https://playwright.io/docs before changing it.

## 6. Tools to use

- **Read & research first**: `read_file` (existing source + DESIGN.md), `web_search` + `web_extract` (MDN scroll-driven, scrollbar, @supports).
- **Edit**: `patch`/`write_file` on `content.json`, `src/pages/index.astro` (markup for bg layers), `public/css/styles.css` (motion sections), `DESIGN.md`.
- **Verify**: `terminal` (build, greps, `node scripts/verify.mjs`, `du`, git checks), `read_file` of built `dist/` snippets.
- Optional `browser_exec` for a visual sanity check of the dev server (`npm run dev`, view at `http://localhost:4321/portfolio/`) — allowed, but section 11 is the proof.

## 7. Tools or actions to avoid

- `git push`, `git push --force`, any remote operation, `gh`, `astro deploy`, any hosting/publish action — the remote already belongs to the user.
- No `rm` of `scripts/` files, `DESIGN.md`, `workflows/`, or existing content — this phase extends, never erases.
- No new npm dependencies except a justified motion library (e.g. GSAP) that the mission documents in `DESIGN.md` — installed via npm into the project, bundled into `dist/`, still zero runtime-external requests and inside the 512 KB budget.
- No edits to any path outside `/mnt/Storage/Projects/Active/neon-site/`.
- Do not run `scripts/check-placeholders.mjs` as a pass/fail gate — it intentionally fails now (content is partially real); leave the script file itself untouched.

## 8. Safety rules

- Never handle, commit, or paste secrets/tokens; no auth flows, no `browser_vault`.
- Never write outside the project root; never touch the git remote or credentials.
- Never delete phase-1 verified features: the four section ids, the reduced-motion block, the hover rules (≥ 6 `:hover` rules must remain), vendored fonts.
- Never fabricate: every criterion in section 3 is backed by a command run in section 11.
- Email stays PLACEHOLDER — do not surface a real address; do not search the web for the user's personal info.

## 9. Approval rules

- Fully autonomous mission; no mid-mission pauses.
- The push to `ArisuZeA/portfolio` is explicitly **the user's decision** — the mission stops at "committed, clean, verified" and the user pushes when ready.
- The mission must not alter the remote or GitHub settings of any kind.

## 10. Deliverables

Inside `/mnt/Storage/Projects/Active/neon-site/`, extending the existing project:

- `content.json` — updated to section-2 values, same key structure, placeholder slots intact.
- `src/pages/index.astro` — background layer(s) markup (`class="bg-layer"` fixed layers) inserted after `<body>`.
- `public/css/styles.css` — new commented sections: `Phase-2: ambient background`, `Phase-2: scroll reveals`, `Phase-2: scrollbar`, all new keyframes `bg-`/`scroll-` prefixed, `@supports`-guarded, reduced-motion block still last and still universal; if JS motion was chosen, a `src/` script module (imported by the page, bundled by Astro) plus its reduced-motion self-gate.
- `DESIGN.md` — new `## Phase-2 motion` section (layers, durations, parallax factors, fallback behavior).
- ≥ 1 new local commit on `main`, tree clean; `README.md` deploy section untouched unless something genuinely changed.
- Fresh `dist/` from the final build (≤ 512 KB).

## 11. Verification steps

Run ALL before reporting; quote real results:

1. `npm run build` → exit 0; `ls dist/index.html` exists.
2. `grep -o 'id="hero"\|id="about"\|id="projects"\|id="links"' dist/index.html` → 4 in order; `grep -c 'Reister Gerald' dist/index.html` ≥ 1; `grep -c 'EduQUIZ---Research-Project\|Lingering-Subtitles-Fix\|Dialogue-Scrolling-Fix\|punkcity.vercel.app' dist/index.html` ≥ 4.
3. `diff`-style check: `grep -c 'Conde Reister Gerald"\|"Full-Stack Developer"' content.json` ≥ 1 and PLACEHOLDER slots still ≥ 6 (4 links ×2 + 2 email) → spot-check each.
4. `grep -c 'class="bg-' dist/index.html` ≥ 1.
5. Motion grep, per chosen implementation: CSS — `grep -c '@keyframes bg-\|@keyframes scroll-' dist/css/styles.css` ≥ 3 and `grep -c 'animation-timeline:' dist/css/styles.css` ≥ 1; JS — `grep -l 'gsap\|scroll' dist/assets/*.js` finds the script AND `grep -c 'prefers-reduced-motion' dist/assets/*.js` ≥ 1 (self-gate).
6. `grep -c '@supports (animation-timeline:' public/css/styles.css` ≥ 1; confirm base-visible fallback by loading `dist/` in Playwright at 768px WITHOUT scroll animation support path — simplest: assert section elements report `opacity >= 0.99` in `getComputedStyle` at scrollY 0 in `scripts/verify.mjs` or an inline check.
7. `grep -A3 'prefers-reduced-motion' dist/css/styles.css` → universal `animation: none !important` block intact and still the last motion section.
8. `grep -c ':hover' dist/css/styles.css` ≥ 6 (phase-1 hover set preserved).
9. `node scripts/verify.mjs` → exit 0 (extend it for the opacity assertion from step 6).
10. `grep -c 'scrollbar' dist/css/styles.css` ≥ 1.
11. `du -sk dist` ≤ 512; `grep -oE '<script src="http|<link rel="stylesheet" href="http|fonts.gstatic' dist/index.html` → zero.
12. `git log --oneline | wc -l` ≥ 8; `git status -s` empty; `git remote -v` shows the user's existing remote (not modified, not used).

## 12. If blocked

1. Scroll-driven syntax rejected: re-read the extracted MDN page (`animation-timeline` longhand vs shorthand order), then fall back to a small hand-rolled JS scroll handler (transform-only, self-gated) or `background-attachment: fixed` + slow transform drift — pick one, document the deviation in `DESIGN.md`.
2. Playwright check fails after adding layers: locate the overflowing element via `page.evaluate` scan, fix its positioning; never delete the check.
3. `dist/` over budget: minify motion layers (fewer gradients), never the criteria.
4. Still blocked: stop and report with what was tried under section 13's `Blockers`. Never fabricate.

## 13. Final response format

End with exactly this shape:

```
== PHASE-2 REPORT ==

Built: <one line: what changed at the project path>

Verified — each line one section-11 command:
- <command> → <exit code> — <measured result>

Sources consulted (research-first rule):
- <url> — what it settled

Motion design (max 6):
- <layer/reveal/scrollbar decision> — <duration, parallax, fallback>

Ready to push (user decides when):
- branch main, N new commits, remote untouched: <remote url>

Left open by design:
- LinkedIn/X/Instagram/Bandcamp + email slots (PLACEHOLDER)
- push to GitHub (user's task)

Blockers: none — or exact attempts + stop point
```
