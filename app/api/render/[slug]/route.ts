import { getHeader, HEADERS } from "@/headers";
import { parseHeaderParams } from "@/lib/header-params";
import { renderHeaderPng } from "@/lib/render-header";
import { sizesFor } from "@/lib/sizes";

// Public image API: GET /api/render/<slug>?<params> → PNG.
// Example (Discord bot):
//   /api/render/boas-vindas?username=audibert&avatar=https://cdn.discordapp.com/...
// Nothing is written to disk; the PNG is streamed back.

function unauthorized() {
  return Response.json({ error: "Chave inválida." }, { status: 401 });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  // RENDER_API_KEY unset means the API is open — fine locally, not in production.
  const key = process.env.RENDER_API_KEY;
  if (key) {
    const sent = request.headers.get("x-api-key") ?? new URL(request.url).searchParams.get("key");
    if (sent !== key) return unauthorized();
  }

  const { slug } = await params;
  const header = getHeader(slug);
  // Só headers marcados com `api: true` são servidos; os outros existem
  // apenas para a galeria e o export.
  if (!header || !header.api || header.pending) {
    return Response.json(
      {
        error: `Header "${slug}" não está disponível na API.`,
        headers: HEADERS.filter((h) => h.api && !h.pending).map((h) => h.slug),
      },
      { status: 404 },
    );
  }

  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());

  const sizes = sizesFor(header);
  const sizeId = query.size ?? sizes[0].id;
  if (!sizes.some((size) => size.id === sizeId)) {
    return Response.json(
      { error: `Tamanho "${sizeId}" não existe para esse header.`, sizes: sizes.map((s) => s.id) },
      { status: 400 },
    );
  }

  const values = parseHeaderParams(header, query);
  if (typeof values === "string") {
    return Response.json(
      {
        error: values,
        params: (header.params ?? []).map((p) => ({
          name: p.name,
          kind: p.kind,
          descricao: p.description,
        })),
      },
      { status: 400 },
    );
  }

  try {
    const png = await renderHeaderPng({
      origin: url.origin,
      slug: header.slug,
      size: sizeId,
      params: values,
    });
    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `inline; filename="${header.slug}-${sizeId}.png"`,
        // Same params give the same image; a member only joins once anyway.
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("render failed", error);
    return Response.json({ error: "Falha ao gerar a imagem." }, { status: 500 });
  }
}
