import { defineConfig } from "astro/config";
export default defineConfig({
  site: 'https://arisuzea.github.io',
  base: '/portfolio',
  build: {
    inlineStylesheets: "never",
  },
});
