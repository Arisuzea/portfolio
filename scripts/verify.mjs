// Criterion 3 — Playwright horizontal-overflow check at 375 / 768 / 1440 px viewports.
// Run from project root: `node scripts/verify.mjs` (also works from anywhere).
// Exit 0 = document.scrollWidth <= viewport width at ALL three widths.
//
// Note: the page links its stylesheet with absolute paths (/css/styles.css), so
// the check serves dist/ over a local micro HTTP server — under file:// those
// links would silently 404 and the check would pass vacuously.
//
// Browsers are installed HERMETICALLY (`PLAYWRIGHT_BROWSERS_PATH=0` → binaries
// live in node_modules/playwright-core/.local-browsers, inside the project).
import process from "node:process";
import nodeFs from "node:fs";
import http from "node:http";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), ".."); // scripts/.. = project root
const DIST = join(ROOT, "dist");
const INDEX = join(DIST, "index.html");

if (!nodeFs.existsSync(INDEX)) {
  console.error("verify.mjs: FAIL — dist/index.html does not exist (run `npm run build` first)");
  process.exit(2);
}

// Serve dist/ locally so absolute-path asset links resolve correctly.
// Phase-2: with astro.config base: "/portfolio", the built page requests assets at
// /portfolio/... (Astro rewrites generated URLs to include the base). GH Pages serves
// dist/ AT that base path, so the micro-server mirrors the deployment: strip the base
// prefix before resolving inside dist/. Assets that genuinely do not exist in dist/
// still 404 and are still recorded by the guard.
const PORT = 8199;
const SITE_BASE = "/portfolio"; // keep in sync with astro.config.mjs base
const notFound = new Set(); // request URLs that 404'd — a built page must request only assets that exist
const server = http.createServer((req, res) => {
  let path = req.url.split("?")[0];
  if (path === SITE_BASE || path.startsWith(SITE_BASE + "/")) path = path.slice(SITE_BASE.length) || "/";
  const rel = path === "/" ? "index.html" : path.replace(/^\//, "");
  const abs = join(DIST, rel);
  if (!abs.startsWith(DIST) || !nodeFs.existsSync(abs) || nodeFs.lstatSync(abs).isDirectory()) {
    notFound.add(req.url);
    res.statusCode = 404;
    res.end("not found");
    return;
  }
  const MIME = { css: "text/css", html: "text/html; charset=utf-8", woff2: "font/woff2", woff: "font/woff", js: "text/javascript", svg: "image/svg+xml", json: "application/json", ico: "image/x-icon" };
  const ext = abs.split(".").pop().toLowerCase();
  res.setHeader("content-type", MIME[ext] || "application/octet-stream");
  res.end(nodeFs.readFileSync(abs));
});
server.listen(PORT, "127.0.0.1");

// Imported here (not at the top) so PLAYWRIGHT_BROWSERS_PATH is already set when
// the playwright module initializes — static imports run before the body, which
// would make the env assignment on this line too late.
process.env.PLAYWRIGHT_BROWSERS_PATH = "0"; // hermetic: node_modules/playwright-core/.local-browsers
const { chromium } = await import("playwright");

const browser = await chromium.launch();
const VIEWPORTS = [375, 768, 1440];
let failures = 0;

for (const width of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewportSize({ width, height: 1000 }); // docs: set viewport size before navigating
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "load" });
  if (notFound.size) {
    failures++;
    console.log(`[viewport ${width}] FAIL (${notFound.size} missing asset(s)) — ${[...notFound].join(", ")} 404'd: dist links to assets that do not exist in dist/`);
    await page.close();
    continue;
  }
  const m = await page.evaluate(() => {
    const doc = document.documentElement;
    const vw = doc.clientWidth;
    const offenders = [];
    document.querySelectorAll("body *").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) {
        offenders.push(`${el.tagName}.${String(el.className || "_")}:${Math.round(r.right)}:${Math.round(r.left)}`);
      }
    });
    // Phase-2 §11-6: base-visible fallback — at scrollY 0 (fresh load, no scroll) every
    // section element must report computed opacity >= 0.99. The reveal animations live on
    // wrapper children inside the sections, never on the sections themselves, so an
    // invisible section means the @supports fallback regressed to "invisible content".
    const sections = ["hero", "about", "projects", "links"].map((id) => {
      const el = document.getElementById(id);
      return { id, opacity: el ? Number(getComputedStyle(el).opacity) : 0 };
    });
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: vw,
      offenders: offenders.slice(0, 10),
      sections,
    };
  });
  const ok = m.scrollWidth <= width;
  const dimSections = m.sections.filter((s) => s.opacity < 0.99);
  console.log(`[viewport ${width}] document.scrollWidth=${m.scrollWidth} viewport=${width} -> ${ok ? "PASS" : "FAIL (horizontal overflow)"}`);
  console.log(`[viewport ${width}] section opacity at scrollY 0: ${m.sections.map((s) => `${s.id}=${s.opacity}`).join(" ")} -> ${dimSections.length ? "FAIL (invisible section)" : "PASS (base-visible fallback)"}`);
  if (!ok) {
    failures++;
    if (m.offenders.length) console.log(`  offenders: ${m.offenders.join(", ")}`);
  }
  if (dimSections.length) {
    failures++;
    console.log(`  dim sections: ${dimSections.map((s) => `${s.id} opacity=${s.opacity}`).join(", ")}`);
  }
  await page.close();
}

await browser.close();
server.close();

if (failures > 0) {
  console.error(`verify.mjs: FAIL — ${failures} viewport(s) failed (horizontal overflow or missing assets)`);
  process.exit(1);
}
console.log("verify.mjs: PASS at 375/768/1440");
