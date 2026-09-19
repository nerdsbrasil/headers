import { HEADERS } from "@/headers";
import { exportHeaderPngs } from "@/lib/export-png";

// Re-exports one header's PNG from the gallery's "Exportar PNG" button, e.g.
// after editing its file. Dev only: it writes into public/exports.
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Disponível só no `bun dev`." }, { status: 403 });
  }

  const { slug } = (await request.json()) as { slug?: string };
  const header = HEADERS.find((h) => h.slug === slug);
  if (!header) return Response.json({ error: "Header inválido." }, { status: 400 });
  if (header.pending) {
    return Response.json({ error: "O componente do meio ainda está pendente." }, { status: 400 });
  }

  try {
    const exported = await exportHeaderPngs({ origin: new URL(request.url).origin, slug: header.slug });
    return Response.json({ exported });
  } catch (error) {
    return Response.json({ error: `Falha ao exportar: ${String(error)}` }, { status: 500 });
  }
}
