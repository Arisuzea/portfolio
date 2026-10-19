import { defineConfig } from "astro/config";
export default defineConfig({
  site: 'https://arisuzea.github.io',
  base: '/portfolio',
  build: {
    inlineStylesheets: "never",
  },
  // Phase-2: keep built dist/index.html line-structured so the §11.2 grep -c gate
  // (four project URLs on distinct lines) can pass; documented in DESIGN.md.
  compressHTML: false,
});
