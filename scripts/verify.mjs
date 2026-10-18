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
const PORT = 8199;
const notFound = new Set(); // request URLs that 404'd — a built page must request only assets that exist
const server = http.createServer((req, res) => {
  const rel = req.url === "/" ? "index.html" : req.url.replace(/^\//, "").split("?")[0];
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
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: vw,
      offenders: offenders.slice(0, 10),
    };
  });
  const ok = m.scrollWidth <= width;
  console.log(`[viewport ${width}] document.scrollWidth=${m.scrollWidth} viewport=${width} -> ${ok ? "PASS" : "FAIL (horizontal overflow)"}`);
  if (!ok) {
    failures++;
    if (m.offenders.length) console.log(`  offenders: ${m.offenders.join(", ")}`);
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
