# Goal Spec — neon-site

## 1. Objective

Build a complete, locally verified, deploy-ready Astro site — a single scrolling personal home page (hero → about → project grid → link hub), dark neon-punk aesthetic with dominant purple accents and animated modern hover micro-interactions — at `/mnt/Storage/Projects/Active/neon-site/`, ready for the user to push to GitHub Pages themselves the next morning.

## 2. Background context

- **Implementing agent**: one autonomous Hermes mission, running overnight. No user interaction during the run.
- **Workspace root**: `/mnt/Storage/Projects/Active/` — all new projects live here; this project's folder `/mnt/Storage/Projects/Active/neon-site/` is pre-seeded (exists, with `workflows/` inside it). The mission works only inside it.
- **Machine facts (verified 2026-10-19)**: Node `v26.11.1`, npm `12.2.1` on PATH. No `gh` CLI installed. No global git identity configured.
- **Framework decision**: Astro (user-confirmed). GitHub Pages serves *any* static build, so React (via `@astrojs/react`), Tailwind, or animation libs are permitted — but only if the mission justifies each in `DESIGN.md`. Default is idiomatic Astro + CSS.
- **Deploy shape (user-confirmed)**: user-page style — repo will be named `<handle>.github.io`, served at the root URL. The user creates the repo and pushes in the morning; the mission prepares config and instructions only.
- **Content policy (user-confirmed)**: structure only. All human-visible copy is placeholder text; the user pastes real content in the morning.
- **Aesthetic brief**: "neon-punk-ish": near-black ground, dominant neon purple accents, punk-brute display typography, gritty decorative texture allowed. Interaction behavior, however, follows modern conventions: animated hover on every interactive element.
- **Glossary**:
  - *Hover micro-interaction* — animated state change on `:hover` (lift/shift transform and/or glow), 150–300ms, `ease-out`.
  - *User-page style* — GitHub Pages repo named `<username>.github.io`, served at site root (no `/repo/` base path).
  - *PLACEHOLDER copy* — string beginning with the literal token `PLACEHOLDER` in `content.json`.
  - *Vendored assets* — fonts/scripts bundled locally in the project, no runtime CDN references.

## 3. Success criteria

Every bullet is testable in one sentence. "Done" = ALL true.

1. `npm run build` in the project root exits 0 and `dist/index.html` exists.
2. `dist/index.html` contains `id="hero"`, `id="about"`, `id="projects"`, and `id="links"` in that document order.
3. A Playwright check at viewports 375, 768, and 1440 px wide reports `document.scrollWidth <= viewport width` (no horizontal overflow).
4. Built CSS contains at least 6 distinct `:hover` rules, each carrying a `transition` property.
5. Built CSS contains a `@media (prefers-reduced-motion: reduce)` block that neutralizes animation and transition.
6. Every string value in `content.json` starts with the literal prefix `PLACEHOLDER`, asserted by `scripts/check-placeholders.mjs` exiting 0.
7. `git remote -v` in the project root prints nothing, and `git log --oneline | wc -l` is ≥ 1 (repo initialized and committed by the mission, but never connected to any remote).
8. `README.md` contains a `## Deploy (morning)` section with the exact commands the user must run.
9. `dist/index.html` contains zero runtime-external asset references: no `<script src="http…`, no `<link rel="stylesheet" href="http…`, no `fonts.gstatic.com`.
10. `du -sk dist` is ≤ 512 (KB).
11. `DESIGN.md` exists and lists the color tokens, motion specs, and a justified rationale for every non-default framework/library used.
12. The final chat message matches the section-13 report format exactly.

## 4. Constraints

- **Aesthetic**: dark theme only — near-black background, purple accents dominant. Define CSS custom properties: `--bg` (≈`#0B0B10`), `--ink` (≈`#E8E8F0`), `--accent` (≈`#A855F7`), `--accent-hot` (≈`#D946EF`). At least 90% of all accent-color usage must be purple/magenta-purple hues. Neon glow via `text-shadow`/`box-shadow` permitted.
- **Layout**: exactly one scrolling page. Sections in this order: hero (name/role/tagline), about, projects (card grid, placeholder entries), links (hub of named link slots). No secondary pages.
- **Motion**: every interactive element (buttons, cards, links, nav items) has an animated hover state — transform and/or glow, duration 150–300ms, `ease-out`; visible `:focus-visible` ring on all of them; the `prefers-reduced-motion` block disables all animation/transition. No autoplay ambience loops without a reduced-motion guard.
- **Content**: no real personal information anywhere. All copy comes from `content.json`; every value starts with `PLACEHOLDER`.
- **Self-contained build**: fonts and any scripts vendored locally; no runtime CDN or external-asset requests.
- **Budget**: final `dist/` ≤ 500KB excluding nothing — measured by `du -sk dist` ≤ 512.
- **Research-first (hard rule)**: before coding against any framework, package, config key, or technique the mission is not 100% certain of, run `web_search`, then `web_extract` the official documentation, and code from what it says — never from memory or assumption. Record every consulted URL in the final report. If docs contradict recall, the docs win.
- **Stack freedom**: React (`@astrojs/react`), Tailwind, GSAP, etc. are allowed only if GitHub Pages static serving fully supports them AND the rationale is written in `DESIGN.md`; idiomatic Astro + CSS is preferred.
- **Scope**: never write or modify anything outside `/mnt/Storage/Projects/Active/neon-site/`.
- **Deploy**: out of scope — config and instructions only (see sections 9 and 10).

## 5. Files, folders, links, or sources to inspect

- `/mnt/Storage/Projects/Active/` — parent; confirm the project folder `neon-site/` already exists (it is pre-seeded; do not create a second one).
- `/mnt/Storage/Projects/Active/neon-site/workflows/goal-neon-site.md` — this spec (source of truth).
- Official Astro docs, read before/while building:
  - https://docs.astro.build/en/get-started/
  - https://docs.astro.build/en/reference/configuration-reference/
  - https://docs.astro.build/en/guides/deploy/github/
  - https://docs.astro.build/en/built-in/page-commands/ (site: {}, content cards)
- GitHub Pages docs for user vs project page semantics: https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#types-of-pages
- Playwright docs (for the viewport check script): https://playwright.io/docs — and the Astro/Playwright integration guide if any, found via search.
- Google Fonts / self-hosting guide (for vendoring chosen display + mono fonts): https://developers.google.com/fonts/docs/getting_started or the npm `@fontsource` packages (prefer `@fontsource-variable/*` via `npm install`).
- Before using ANY package or API beyond those listed: search + extract its official docs first (section 4 hard rule).

## 6. Tools to use

- **Phase A — setup & research**: `terminal` (npm init/create, installs), `web_search` + `web_extract` for every uncertain API, plus `read_file` of seeded workspace.
- **Phase B — build**: `write_file`, `patch`, `search_files`, `terminal` (astro build loops).
- **Phase C — verify**: `terminal` (build, greps, scripts), `read_file` of `dist/index.html` snippets.
- Every use of a tool against an unfamiliar API is preceded by `web_search`/`web_extract` of its official docs.

## 7. Tools or actions to avoid

- `git push`, `git remote add`, any remote git operation, `gh` (absent — do not install), `astro deploy` (it uploads), any Netlify/Vercel/Cloudflare deploy action.
- No creating a GitHub repo, no GitHub API calls, no publishing of any kind — deployment is the user's morning task.
- No `sudo`. No `rm` targeting anything outside the project root; deletes inside it are limited to `node_modules/`, `dist/`, and files the mission itself created.
- Do not use `browser_vault` or attempt any login/auth flow.
- Do not install global system packages; `npm install` only inside the project root.

## 8. Safety rules

- Never type, store, or commit secrets, tokens, credentials, or personal identifiers; the mission has no account and needs none.
- Never touch, read, or copy files outside `/mnt/Storage/Projects/Active/neon-site/` (reading this spec inside it is of course allowed).
- Never run destructive ops: no recursive deletes outside project root, no `chmod 777` style tampering, no `kill` of foreign processes.
- Never fabricate: no invented build output, no claiming a check passed without running it (section 11 is the proof).
- Never place real-seeming biographical content into `content.json`; placeholders only.

## 9. Approval rules

- **Pre-launch approval gate belongs to the *designing* agent (already done outside this mission) — see section 13 handoff. The mission itself never pauses.**
- Every step above runs autonomously; no mid-mission human checkpoints — the user has granted full overnight autonomy.
- Deploy/push is **out of mission scope entirely** (not paused — just not the mission's job); README `## Deploy (morning)` hands it to the user.
- If the runtime presents tool-approval prompts (one-shot launch auto-bypasses them), the mission must not add extra permissive flags; constraints in sections 4 and 7 do the real gating.
- Git identity for the mission's local initial commit: set **repository-local** `user.name = rei`, `user.email = rei@localhost` (not global config); the user may amend in the morning.

## 10. Deliverables

All inside `/mnt/Storage/Projects/Active/neon-site/`:

| Artifact | Format | Notes |
| --- | --- | --- |
| Astro project (config, `src/`, `package.json`, components/layouts) | Astro 5.x idiomatic | `astro.config.mjs` with `site: ""` and `url` set to `https://<your-handle>.github.io/` (literal placeholder; a commented one-line switch documents project-page style: `site: "neon-site"`) |
| `content.json` | JSON at project root | every string value prefixed `PLACEHOLDER`; hero/about/projects/links content cards read from it at build time |
| `DESIGN.md` | Markdown | color tokens, hover/motion specs, typography, and a "Deviation rationale" section justifying any non-default framework/library |
| `README.md` | Markdown | plain-language overview + `## Deploy (morning)` section with exact commands (create repo `<handle>.github.io` on GitHub, `git remote add origin …`, `git push -u origin main`, enable Pages, fill `content.json`, set `url` in config) + `## Fill in content` section explaining the `content.json` edit points |
| `scripts/verify.mjs` | Node + Playwright | runs the 3 viewport overflow checks (criterion 3) |
| `scripts/check-placeholders.mjs` | Node | asserts criterion 6; exit 0 = pass |
| `.git` initialized, local identity per section 9 | git | ≥1 initial commit; **no remote** |
| `dist/` after final build | static output | ≤ 512 KB; must exist when the mission ends |
| Vendored fonts (e.g. `@fontsource-variable/...`) | npm-installed locally | criterion 9 proves no CDN refs |

## 11. Verification steps

The mission runs ALL of these before reporting, and quotes real results in the report:

1. `cd /mnt/Storage/Projects/Active/neon-site && npm run build` → exit 0, `dist/index.html` exists.
2. `grep -o 'id="hero"\|id="about"\|id="projects"\|id="links"' dist/index.html` → four matches, in order.
3. `node scripts/verify.mjs` → exits 0; prints pass for 375/768/1440.
4. `grep -c ':hover' $(find dist -name '*.css')` → ≥ 6; each hover rule block contains `transition` (mission greps per selector).
5. `grep -c 'prefers-reduced-motion' dist/**/*.css` → ≥ 1 and the block sets `animation: none` / `transition: none`.
6. `node scripts/check-placeholders.mjs` → exit 0.
7. `git remote -v` → empty; `git log --oneline | wc -l` → ≥ 1.
8. `grep -oE '<script src="http|<link rel="stylesheet" href="http|fonts.gstatic' dist/index.html` → zero matches.
9. `du -sk dist` → ≤ 512.
10. `test -f DESIGN.md && grep -c 'Deviation rationale' DESIGN.md` → ≥ 1.

If any check fails, fix and re-run the whole list; do not relax the check, do not comment it out.

## 12. If blocked

Retry ladder, in order, per blocked step:
1. Re-search with a broader/different query; then `site:docs.astro.build` style narrowed queries; then `web_extract` the official docs page directly.
2. Different tool for the same fact: `web_extract` a different source (GitHub Discussions on the astro repo, Stack Overflow, package README on npm) — community sources may *explain* but official docs *decide*.
3. Package/install failures: retry `npm install` once; then pin an exact existing version; then drop the optional package and hand-roll CSS.
4. Playwright install failure: fall back to `puppeteer` (search its docs first) or rewrite the check as a static CSS-overflow assertion grep — but never delete the criterion from section 3/11.
5. Still blocked: STOP and report the blocker with exactly what was tried, in the section-13 format, under `Blockers`. Never fabricate a result, never claim a check without running it.

## 13. Final response format

End the mission with exactly this report shape (plain text):

```
== BUILD REPORT ==

Built: <one line: what now exists at the project path>

Verified — each line one section-11 command:
- <command> → <exit code> — <measured result>

Sources consulted (research-first rule):
- <url> — what it settled

Design decisions (max 10):
- <decision> — <why>

Morning tasks for the user (numbered, from README, ≤ 6):
1. ...

Left open / not done by design:
- deploy + push (user's task, per spec)
- real content (user pastes in)

Blockers: none — or exactly what was tried and where it stopped
```
