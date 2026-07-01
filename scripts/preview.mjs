#!/usr/bin/env node
/**
 * Local preview server — behaves like GitHub Pages (directory → index.html).
 * Usage: node scripts/preview.mjs [--port 4173] [--no-open]
 */

import http from "http";
import net from "net";
import os from "os";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "output", "site");

const args = process.argv.slice(2);
const portIdx = args.indexOf("--port");
const PREFERRED_PORT = portIdx >= 0 ? Number(args[portIdx + 1]) || 4173 : 4173;
const NO_OPEN = args.includes("--no-open");
const LAN = args.includes("--lan");
const HOST = LAN ? "0.0.0.0" : "127.0.0.1";

function getLanAddresses() {
  const addrs = [];
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const iface of ifaces ?? []) {
      if (iface.family === "IPv4" && !iface.internal) addrs.push(iface.address);
    }
  }
  return [...new Set(addrs)];
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".ico": "image/x-icon",
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const rel = decoded.replace(/^\/+/, "") || "index.html";
  const resolved = path.normalize(path.join(ROOT, rel));
  if (!resolved.startsWith(ROOT)) return null;
  return resolved;
}

function resolveFile(urlPath) {
  let filePath = safePath(urlPath);
  if (!filePath) return null;

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  return fs.existsSync(filePath) && fs.statSync(filePath).isFile() ? filePath : null;
}

function openBrowser(url) {
  const r = spawnSync("open", [url], { stdio: "ignore" });
  if (r.error) console.log(`  Open in browser: ${url}`);
}

function portFree(port) {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.unref();
    s.once("error", () => resolve(false));
    s.listen(port, "127.0.0.1", () => s.close(() => resolve(true)));
  });
}

function probePreview(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/`, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function pickPort(preferred) {
  if (await portFree(preferred)) return { port: preferred, reused: false };

  if (await probePreview(preferred)) {
    return { port: preferred, reused: true };
  }

  for (let p = preferred + 1; p < preferred + 10; p++) {
    if (await portFree(p)) return { port: p, reused: false };
  }

  throw new Error(`找不到可用 port（${preferred}–${preferred + 9} 皆被占用）`);
}

function startServer(port) {
  const server = http.createServer((req, res) => {
    const filePath = resolveFile(req.url || "/");
    if (!filePath) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, HOST, () => resolve(server));
  });
}

if (!fs.existsSync(ROOT)) {
  console.error("  ✗ output/site/ not found. Run: npm run build:public");
  process.exit(1);
}

const { port, reused } = await pickPort(PREFERRED_PORT);
const url = `http://localhost:${port}/`;

if (reused) {
  console.log(`\n  Preview 已在運行: ${url}`);
  console.log("  若要重啟，請先在執行 preview 的 terminal 按 Ctrl+C。\n");
  if (!NO_OPEN) openBrowser(url);
  process.exit(0);
}

if (port !== PREFERRED_PORT) {
  console.log(`  ⚠ port ${PREFERRED_PORT} 已被占用，改用 ${port}`);
}

const server = await startServer(port);
console.log(`\n  Preview: ${url}`);
if (LAN) {
  for (const ip of getLanAddresses()) {
    console.log(`  LAN:     http://${ip}:${port}/`);
  }
  console.log("  同一 Wi‑Fi / 區域網內的裝置可用上方 LAN 網址開啟。");
}
console.log("  Press Ctrl+C to stop.\n");
if (!NO_OPEN) openBrowser(url);
