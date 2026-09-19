// PNGs written by `bun run export` into public/exports and served as-is, so a
// hosted build (which cannot run Playwright) still downloads the exact image.

/** `version` (the file's mtime) busts browser caches after a re-export. */
export function exportUrl(slug: string, size: string, version?: number | null) {
  return `/exports/${slug}/${size}.png${version ? `?v=${version}` : ""}`;
}

export function exportFileName(slug: string, size: string) {
  return `nerdsbrasil-${slug}-${size}.png`;
}
