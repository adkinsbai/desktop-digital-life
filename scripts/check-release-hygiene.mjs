import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const files = [
  "README.md",
  "index.html",
  "digital-life.js",
  "digital-life.css",
  "server.mjs",
  ".env.example",
  "package.json",
];

const forbidden = [
  { pattern: /\bVibeBoard\b/i, reason: "standalone release should not mention VibeBoard" },
  { pattern: /\b8789\b/, reason: "standalone release should not depend on the old 8789 app port" },
  {
    pattern: /\u93c1|\u9477|\u9422|\u6d60|\u6fc2|\u93b6|\u7f03|\u5a34|\u935b|\u8b01|\u951b|\u9286|\u6d93\u8b33\u6c49|\u7f01\u64b3\u608e/,
    reason: "possible mojibake or leaked roleplay/internal text",
  },
  { pattern: />[^<]*(mock fallback|loop unknown|server loop)[^<]*</i, reason: "user-visible debug wording should stay out of the interface" },
  { pattern: /sk-[A-Za-z0-9_-]{16,}/, reason: "possible committed API key" },
];

let failed = false;

for (const file of files) {
  const fullPath = path.join(ROOT, file);
  const text = await fs.readFile(fullPath, "utf8");
  for (const rule of forbidden) {
    if (!rule.pattern.test(text)) continue;
    failed = true;
    console.error(`release hygiene failed in ${file}: ${rule.reason}`);
  }
}

if (failed) process.exit(1);

console.log(`release hygiene passed (${files.length} files)`);
