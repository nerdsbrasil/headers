import type { Browser } from "playwright";
import type { HeaderParams } from "@/headers/types";
import type { GradientSettings } from "@/lib/gradient";
import { getSize, SIZES } from "@/lib/sizes";

// Shot-taking for both the on-demand API and the dev export. One browser is
// kept alive across requests: launching Chrome costs ~1.5s, a page ~50ms.

let browserPromise: Promise<Browser> | null = null;

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = (async () => {
      const { chromium } = await import("playwright");
      // The container ships Playwright's own Chromium; locally we use Chrome.
      const channel = process.env.CHROME_CHANNEL || (process.env.NODE_ENV === "development" ? "chrome" : undefined);
      const browser = await chromium.launch({ channel });
      browser.on("disconnected", () => {
        browserPromise = null;
      });
      return browser;
    })().catch((error) => {
      browserPromise = null;
      throw error;
    });
  }
  return browserPromise;
}

/**
 * Where Chrome should load the page from, best candidate first: the explicit
 * RENDER_ORIGIN, then this process's own port (so a container that listens on
 * something other than 3000 still works), then the origin of the request that
 * asked for the image, which is the public URL and may pass through a proxy.
 */
function renderOrigins(requestOrigin: string) {
  const candidates = [
    process.env.RENDER_ORIGIN,
    `http://127.0.0.1:${process.env.PORT ?? 3000}`,
    requestOrigin,
  ];
  return [...new Set(candidates.filter((value): value is string => Boolean(value)))];
}

export interface RenderOptions {
  /**
   * Where this server answers, e.g. http://localhost:3000. Set RENDER_ORIGIN to
   * pin it (e.g. http://127.0.0.1:2828) when neither PORT nor the request
   * origin reaches this server from inside.
   */
  origin: string;
  slug: string;
  size?: string;
  params?: HeaderParams;
  /** Render with these settings instead of the header's saved gradient. */
  gradient?: GradientSettings;
}

/** Screenshots a header and returns the PNG bytes. */
export async function renderHeaderPng({
  origin,
  slug,
  size: sizeId = SIZES[0].id,
  params,
  gradient,
}: RenderOptions) {
  const size = getSize(sizeId);
  if (!size) throw new Error(`Tamanho desconhecido: ${sizeId}`);

  const browser = await getBrowser();
  const origins = renderOrigins(origin);
  let refused: unknown;

  for (const candidate of origins) {
    // A fresh page per attempt: after a refused navigation the old one sits on
    // chrome-error://, and the next goto races with it.
    const page = await browser.newPage({
      viewport: { width: size.width, height: size.height },
      deviceScaleFactor: 1,
      colorScheme: "dark",
      // proxy.ts closes /render to the outside world in production; the key
      // rides along on the page and every asset it loads.
      extraHTTPHeaders: process.env.RENDER_API_KEY
        ? { "x-api-key": process.env.RENDER_API_KEY }
        : undefined,
    });
    try {
      const url = new URL(`/render/${slug}/${size.id}`, candidate);
      for (const [key, value] of Object.entries(params ?? {})) url.searchParams.set(key, value);
      if (gradient) url.searchParams.set("gradient", JSON.stringify(gradient));

      const response = await page.goto(url.toString(), { waitUntil: "networkidle" });
      if (!response?.ok()) throw new Error(`Render respondeu ${response?.status()} para ${slug}`);
      // The dev server's "N" indicator and error toasts float over the header.
      await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
      await page.evaluate(() => document.fonts.ready);

      return await page.locator("[data-header]").screenshot({ type: "png" });
    } catch (error) {
      // Nothing listening there: try the next address before giving up.
      if (!String(error).includes("ERR_CONNECTION_REFUSED")) throw error;
      refused = error;
    } finally {
      await page.close();
    }
  }

  throw new Error(
    `Nenhum destes endereços respondeu: ${origins.join(", ")}. ` +
      `Defina RENDER_ORIGIN com o endereço interno do servidor. (${refused})`,
  );
}
