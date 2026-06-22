import { promises as fs } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const targets = [
  "server.mjs",
  "digital-life-expression.js",
  "digital-life.js",
  "src",
  "tests",
];

async function walk(target) {
  const full = path.join(ROOT, target);
  const stat = await fs.stat(full);
  if (stat.isFile()) return [full];
  const files = [];
  for (const entry of await fs.readdir(full, { withFileTypes: true })) {
    const child = path.join(full, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path.relative(ROOT, child)));
    else if (/\.(mjs|js)$/.test(entry.name)) files.push(child);
  }
  return files;
}

const files = [];
for (const target of targets) files.push(...await walk(target));

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    cwd: ROOT,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status || 1);
  }
  console.log(`ok ${path.relative(ROOT, file)}`);
}

console.log(`syntax check passed (${files.length} files)`);
