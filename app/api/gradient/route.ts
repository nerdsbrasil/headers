import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { HEADERS } from "@/headers";
import { exportHeaderPngs } from "@/lib/export-png";
import { parseGradient, type GradientSettings } from "@/lib/gradient";

const FILE = path.join(process.cwd(), "lib", "gradient.json");

// Saves one header's gradient into lib/gradient.json (keyed by slug), leaving
// the other headers untouched, then re-exports that header's PNG so the
// download matches. Dev only: it writes into the source tree.
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Disponível só no `bun dev`." }, { status: 403 });
  }

  const body = (await request.json()) as { slug?: string; settings?: unknown };
  const slug = String(body.slug ?? "");
  if (!HEADERS.some((h) => h.slug === slug && h.gradient)) {
    return Response.json({ error: "Header inválido." }, { status: 400 });
  }
  const settings = parseGradient(body.settings);
  if (typeof settings === "string") {
    return Response.json({ error: settings }, { status: 400 });
  }

  // Re-read so a save never clobbers another header saved meanwhile.
  const all = JSON.parse(await readFile(FILE, "utf8")) as Record<string, GradientSettings>;
  all[slug] = settings;
  await writeFile(FILE, `${JSON.stringify(all, null, 2)}\n`);

  try {
    const exported = await exportHeaderPngs({
      origin: new URL(request.url).origin,
      slug,
      gradient: settings,
    });
    return Response.json({ settings, exported });
  } catch (error) {
    // The config is saved either way; say so and let `bun run export` catch up.
    return Response.json({ settings, exported: [], exportError: String(error) });
  }
}
