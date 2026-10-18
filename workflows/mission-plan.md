# Mission Plan — neon-site (companion to goal-neon-site.md)

Executor: ONE autonomous overnight mission (per spec §2). This file is the phase map; the goal spec is the source of truth and wins on any conflict.

## Phase A — setup & research (gate before any coding)
- Confirm workspace pre-seeded: `neon-site/` exists under `/mnt/Storage/Projects/Active/`; do not create a second one.
- Research-first (hard rule): web_search → web_extract official docs for Astro 5 config, GitHub Pages user-page semantics, Playwright, `@fontsource-variable/*` vendoring. Record every consulted URL for the report.

## Phase B — build
- Idiomatic Astro 5 + CSS preferred; any deviation justified in DESIGN.md.
- Sections in order: hero → about → projects grid → links hub, ids `hero/about/projects/links`.
- CSS tokens §4; ≥6 `:hover` rules with transitions; `:focus-visible` rings; reduced-motion block neutralizes all motion.
- All copy from `content.json`, every value prefixed `PLACEHOLDER`; fonts vendored (no CDN).

## Phase C — scripts + git
- `scripts/verify.mjs` (Playwright, viewports 375/768/1440, no h-overflow) and `scripts/check-placeholders.mjs`.
- `git init` with **repo-local** identity `rei` / `rei@localhost`; one commit; NO remote, ever.

## Phase D — verify gate (spec §11, all 10 commands)
- Run the full list after every fix; never relax a check. Then `du -sk dist` ≤ 512.

## Phase E — docs & handoff
- README `## Deploy (morning)` + `## Fill in content`; DESIGN.md with `Deviation rationale`.
- Final message = spec §13 BUILD REPORT shape exactly, with real command outputs. Morning tasks stay with the user (deploy, push, paste real content).

## Ownership notes (fleet mapping, informational)
- research → researcher; UI/CSS/motion → frontend-dev; content.json wiring + scripts → backend-dev; git init/commit hygiene → devops-security; README/DESIGN.md → documenter. Spec mandates a single mission, so the mission covers all phases itself; this map is for morning triage if the report shows gaps.
