import { defineConfig } from "astro/config";

// Deploy shape: GitHub Pages *user-page* style — repo named `<handle>.github.io`,
// served at the site root (no `/repo/` base path). See README.md "Deploy (morning)".
export default defineConfig({
  // PLACEHOLDER url — morning task: replace `your-handle` with your real GitHub
  // handle (angle brackets are not valid inside a config string; the final value
  // must be e.g. https://<your-handle>.github.io/ once you know the handle):
  site: "https://your-handle.github.io/",
  // For GitHub Pages user-page style the repo name is exactly `<handle>.github.io`
  // and no `base` is needed (docs: skip `base` for the special repo-name pattern).

  // Switch for project-page style (repo NOT named `<handle>.github.io`):
  //   site: "https://your-handle.github.io/",
  //   base: "/neon-site",

  build: {
    // Keep page CSS in external stylesheet files (never inlined into HTML),
    // so the built CSS stays greppable for hover/reduced-motion checks.
    inlineStylesheets: "never",
  },
});
