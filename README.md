# neon-site

Single scrolling personal page (hero → about → projects card grid → links hub),
dark neon-punk look with dominant purple accents and CSS-only hover
micro-interactions. Built with **Astro 5** (pinned `astro@^5.18.2`), all human
copy is **PLACEHOLDER** text in `content.json` — you paste the real content in
the morning, then push the repo yourself. The site was **not** deployed or
pushed by the overnight mission (by design).

Layout: `src/pages/index.astro` (single page) · `public/css/styles.css` (the one
stylesheet) · `astro.config.mjs` · `content.json` (all copy) · `DESIGN.md`
(tokens, motion, rationale) · `scripts/verify.mjs` (Playwright overflow check)
· `scripts/check-placeholders.mjs` (placeholder guard) · `.github/workflows/deploy.yml`
(official Astro GitHub Pages Action, ready but never run by the mission).

## Local commands

```sh
npm run build           # astro build → dist/ (must exist; ≤ 512 KB budget)
node scripts/verify.mjs # Playwright overflow check @ 375/768/1440 px
node scripts/check-placeholders.mjs  # asserts every content.json string starts with PLACEHOLDER
```

## Deploy (morning)

Run from the project root, in order (replace `<your-handle>` with your GitHub
handle everywhere; user-page style — the repo **must** be named
`<your-handle>.github.io`):

1. `cd /mnt/Storage/Projects/Active/neon-site`
2. Fill in content (see below) — placeholders break nothing but read badly:
   edit `content.json`, then in `astro.config.mjs` replace the placeholder
   `site: "https://your-handle.github.io/"` with your real handle
   (`https://<your-handle>.github.io/`; Astro rejects an empty site URL).
3. `git remote add origin https://github.com/<your-handle>/<your-handle>.github.io.git`
   — first create the repo on GitHub at https://github.com/new with exactly that
   name (empty; no README/license). The repo-local identity for the initial commit
   is already set (`rei` / `rei@localhost`); amend/re-author in the morning if you
   want your own identity.
4. `git push -u origin main` (the mission's commit lives on branch `main`).
5. Enable Pages: repo **Settings → Pages → Source: GitHub Actions** —
   `.github/workflows/deploy.yml` (official Astro Action, `withastro/action@v6`)
   is committed, so GitHub rebuilds `dist/` on every push and publishes it.

## Fill in content

Every visible string lives in `content.json` at the project root, read at build
time by `src/pages/index.astro`. Edit points (replace each `"PLACEHOLDER …"` value —
the guard `node scripts/check-placeholders.mjs` then reports FAIL, which is the
expected post-edit state):

- `hero` — `name` (displayed ALL-CAPS as the wordmark + nav brand), `role`
  (one line), `tagline`, `status` (small kicker above the wordmark), `cta`
  (button text, links to `#projects`).
- `about` — `heading`, `blurb` (the quoted left-rule paragraph), `roleLabel`
  (small role card under the blurb).
- `projects.items[]` — four cards: `title`, `blurb`, `tag`, `url` (card href;
  set real URLs like `https://github.com/<handle>/repo`).
- `links` — `heading`, `blurb`, `email` (an `href` value, e.g.
  `mailto:you@example.com`), `emailLabel` (display text), `items[]` — five
  named hub chips (`label`, `url`).

Keep `scripts/check-placeholders.mjs` in CI-or-head only as a guard for the
pre-content state; after pasting, rerun `npm run build` + `scripts/verify.mjs`
to reconfirm no horizontal overflow at 375/768/1440 with the real copy.
