// Criterion 6 — assert every string value in content.json starts with PLACEHOLDER.
// Run from project root: `node scripts/check-placeholders.mjs`. Exit 0 = pass.
import process from "node:process";
import * as fs from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const CONTENT_JSON = join(dirname(fileURLToPath(import.meta.url)), "..", "content.json");
const data = JSON.parse(fs.readFileSync(CONTENT_JSON, "utf8"));

const offenders = [];
let total = 0;

const walk = (value, path) => {
  if (typeof value === "string") {
    total++;
    if (!value.startsWith("PLACEHOLDER")) offenders.push(`${path}: ${JSON.stringify(value)}`);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, `${path}[${i}]`));
  } else if (value === null) {
    // null is not a string value; nothing to assert
  } else if (typeof value === "object") {
    for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`);
  } else {
    offenders.push(`${path}: non-string scalar (${JSON.stringify(value)}) — copy must be strings`);
  }
};

walk(data, "$");

console.log(`content.json: ${total} string values checked`);
if (offenders.length > 0) {
  offenders.forEach((o) => console.log(`FAIL ${o}`));
  process.exit(1);
}
console.log("check-placeholders.mjs: PASS — every string value starts with PLACEHOLDER");
