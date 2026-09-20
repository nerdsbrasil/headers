import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { GradientSettings } from "@/lib/gradient";
import { renderHeaderPng } from "@/lib/render-header";
import { getHeader } from "@/headers";
import { sizesFor } from "@/lib/sizes";

// Dev-only PNG export used by the API routes, so saving a gradient or clicking
// "Exportar PNG" refreshes public/exports right away. The same capture as
// scripts/export.mjs, which exports everything after a production build.

export async function exportHeaderPngs({
  origin,
  slug,
  params,
  gradient,
}: {
  origin: string;
  slug: string;
  params?: Record<string, string>;
  /**
   * Settings to render with. Passed explicitly because the dev server may not
   * have picked up a just-written lib/gradient.json yet.
   */
  gradient?: GradientSettings;
}) {
  const header = getHeader(slug);
  const written: string[] = [];
  for (const size of sizesFor(header ?? {})) {
    const png = await renderHeaderPng({ origin, slug, size: size.id, params, gradient });
    const dir = path.join(process.cwd(), "public", "exports", slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${size.id}.png`), png);
    written.push(`public/exports/${slug}/${size.id}.png`);
  }
  return written;
}

/** Modification time of an exported PNG, for cache-busting download links. */
export async function exportVersion(slug: string, size: string) {
  try {
    const info = await stat(path.join(process.cwd(), "public", "exports", slug, `${size}.png`));
    return Math.floor(info.mtimeMs);
  } catch {
    return null;
  }
}
