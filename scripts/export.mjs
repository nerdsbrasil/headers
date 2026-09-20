// Screenshots every finished header at every size into public/exports/<slug>/<size>.png,
// which the gallery's download button serves (commit them before deploying).
// Headers and sizes come from /api/headers; pending ones (middle component
// still requested in pedidos/) are skipped.
// Usage: bun run export  (builds, starts `next start`, captures, shuts down)

import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

function envLocal(name) {
  if (!existsSync(".env.local")) return undefined;
  const line = readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .find((l) => l.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim();
}

const PORT = 3123;
const BASE = `http://localhost:${PORT}`;

// A leftover server on this port would serve a stale build.
try {
  await fetch(BASE);
  console.error(`Port ${PORT} is already in use; stop that process and retry.`);
  process.exit(1);
} catch {}

const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  shell: true,
  stdio: "ignore",
});

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(BASE);
      return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("next start did not come up");
}

function stopServer() {
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(server.pid), "/t", "/f"], { stdio: "ignore" });
  } else {
    server.kill();
  }
}

try {
  await waitForServer();
  // proxy.ts asks for the key in production, which is what `next start` runs as.
  // `next start` reads .env.local on its own; this script has to be told.
  const key = process.env.RENDER_API_KEY ?? envLocal("RENDER_API_KEY");
  const auth = key ? { "x-api-key": key } : undefined;
  const { headers } = await (await fetch(`${BASE}/api/headers`, { headers: auth })).json();
  for (const header of headers.filter((h) => h.pending)) {
    console.log("… pulando", header.slug, "(componente do meio pendente)");
  }
  const browser = await chromium.launch({ channel: "chrome" });

  // Each header declares its own sizes.
  for (const { slug, sizes } of headers.filter((h) => !h.pending)) {
    await mkdir(`public/exports/${slug}`, { recursive: true });
    for (const size of sizes) {
      const [width, height] = size.split("x").map(Number);
      const page = await browser.newPage({
        viewport: { width, height },
        deviceScaleFactor: 1,
        colorScheme: "dark",
        extraHTTPHeaders: auth,
      });
      await page.goto(`${BASE}/render/${slug}/${size}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const path = `public/exports/${slug}/${size}.png`;
      await page.locator("[data-header]").screenshot({ path });
      console.log("✓", path);
      await page.close();
    }
  }

  await browser.close();
} finally {
  stopServer();
}
