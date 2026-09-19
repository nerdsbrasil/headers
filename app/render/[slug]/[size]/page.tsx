import { notFound } from "next/navigation";
import { Header } from "@/components/header/header";
import { getHeader } from "@/headers";
import { resolveHeader } from "@/headers/types";
import { gradientFor, parseGradient } from "@/lib/gradient";
import { parseHeaderParams } from "@/lib/header-params";
import { getSize } from "@/lib/sizes";

// The page the PNG is taken from: one header at its exact pixel size. Params
// for templated headers come through the query string; without them the
// header's sample values are used, which is what the gallery links show.
export default async function RenderPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; size: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug, size: sizeId } = await params;
  const header = getHeader(slug);
  const size = getSize(sizeId);
  if (!header || !size) notFound();

  const query = await searchParams;
  const single = Object.fromEntries(
    Object.entries(query).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );

  // Params are only read when the caller sent any; otherwise use the sample.
  const sent = (header.params ?? []).some((p) => single[p.name] !== undefined);
  let values = header.sample;
  if (sent) {
    const parsed = parseHeaderParams(header, single);
    if (typeof parsed === "string") notFound();
    values = parsed;
  }

  // ?gradient=<json> renders with explicit settings (used by the PNG export
  // right after a save, before the dev server reloads lib/gradient.json).
  let gradient = gradientFor(header);
  if (single.gradient && header.gradient) {
    let parsed: ReturnType<typeof parseGradient>;
    try {
      parsed = parseGradient(JSON.parse(single.gradient));
    } catch {
      parsed = "JSON inválido.";
    }
    if (typeof parsed === "string") notFound();
    gradient = parsed;
  }

  const { title, content } = resolveHeader(header, values);

  return (
    <Header
      width={size.width}
      height={size.height}
      title={title}
      button={header.button}
      watermark={header.watermark}
      gradient={gradient}
    >
      {content}
    </Header>
  );
}
