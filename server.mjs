import http from "node:http";
import { createReadStream } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import initSqlJs from "sql.js";
import { createDigitalLifeStore } from "./src/digitalLife.mjs";
import { createDigitalLifeRoutes } from "./src/digitalLifeRoutes.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const RUNTIME_DIR = process.env.DIGITAL_LIFE_RUNTIME_DIR || path.join(ROOT, "runtime");
const DB_PATH = process.env.DIGITAL_LIFE_DB_PATH || path.join(RUNTIME_DIR, "digital-life.db");
const PORT = Number(process.env.DIGITAL_LIFE_PORT || 8788);
const HOST = process.env.DIGITAL_LIFE_HOST || "127.0.0.1";

await fs.mkdir(RUNTIME_DIR, { recursive: true });

const SQL = await initSqlJs();
const db = await openDatabase();

function saveDb() {
  const bytes = db.export();
  return fs.writeFile(DB_PATH, Buffer.from(bytes));
}

const store = createDigitalLifeStore(db, saveDb);
store.initSchema();

const digitalLifeRoutes = createDigitalLifeRoutes({
  store,
  readBody,
  json,
  appendLog,
  env: process.env,
});

function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("request body must be valid JSON");
    error.statusCode = 400;
    throw error;
  }
}

async function appendLog(event, data = {}) {
  const line = JSON.stringify({ event, data, at: new Date().toISOString() });
  await fs.appendFile(path.join(RUNTIME_DIR, "digital-life.log"), `${line}\n`).catch(() => {});
}

async function openDatabase() {
  try {
    const bytes = await fs.readFile(DB_PATH);
    return new SQL.Database(bytes);
  } catch {
    return new SQL.Database();
  }
}

function contentTypeFor(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js") || filePath.endsWith(".mjs")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  if (filePath.endsWith(".svg")) return "image/svg+xml; charset=utf-8";
  return "application/octet-stream";
}

async function serveStatic(req, res, url) {
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const decoded = decodeURIComponent(pathname);
  const safeRelative = decoded.replace(/^\/+/, "");
  const filePath = path.resolve(ROOT, safeRelative);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) throw new Error("not a file");
    res.writeHead(200, {
      "content-type": contentTypeFor(filePath),
      "cache-control": "no-store",
    });
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" });
    res.end("Not found");
  }
}

async function route(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);
  try {
    if (req.method === "GET" && url.pathname === "/api/status") {
      json(res, 200, {
        ok: true,
        name: "desktop-digital-life",
        mode: "standalone",
        runtime: digitalLifeRoutes.runtime.snapshot(),
      });
      return;
    }
    if (await digitalLifeRoutes.handle(req, res, url)) return;
    if (req.method === "GET" || req.method === "HEAD") {
      await serveStatic(req, res, url);
      return;
    }
    json(res, 404, { ok: false, error: "not found" });
  } catch (error) {
    json(res, error.statusCode || 500, { ok: false, error: error.message || String(error) });
  }
}

http.createServer(route).listen(PORT, HOST, () => {
  console.log(`Desktop Digital Life listening on http://${HOST}:${PORT}/`);
});
