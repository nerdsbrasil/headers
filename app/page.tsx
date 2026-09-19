import { Download, Plus, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header/header";
import { ButtonLink } from "@/components/motion/button/base";
import { HEADERS } from "@/headers";
import { resolveHeader } from "@/headers/types";
import { gradientFor } from "@/lib/gradient";
import { ExportButton } from "@/components/header/export-button";
import { exportVersion } from "@/lib/export-png";
import { exportFileName, exportUrl } from "@/lib/exports";
import { requestPath } from "@/lib/header-request";
import { SIZES } from "@/lib/sizes";

const PREVIEW_WIDTH = 880;

const NAV_LINK =
  "inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-primary/5";

export default async function GalleryPage() {
  const versions = new Map(
    await Promise.all(
      HEADERS.flatMap((header) =>
        SIZES.map(async (size) => {
          const key = `${header.slug}/${size.id}`;
          return [key, await exportVersion(header.slug, size.id)] as const;
        }),
      ),
    ),
  );

  return (
    <main className="mx-auto flex max-w-[960px] flex-col gap-16 px-4 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Headers</h1>
        <nav className="flex gap-2">
          <Link href="/gradiente" className={NAV_LINK}>
            <SlidersHorizontal className="h-4 w-4" />
            Gradiente
          </Link>
          <Link href="/novo" className={NAV_LINK}>
            <Plus className="h-4 w-4" />
            Novo header
          </Link>
        </nav>
      </div>

      {HEADERS.map((header) => resolveHeader(header)).map((resolved, index) => {
        const header = HEADERS[index];
        return (
        <section key={header.slug} className="flex flex-col gap-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="inline-flex items-center gap-3 text-2xl font-semibold tracking-tight">
              {resolved.title}
              {header.pending ? (
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  pendente · {requestPath(header.slug)}
                </span>
              ) : null}
            </h2>
            {header.gradient ? (
              <Link
                href={`/gradiente?header=${header.slug}`}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Ajustar gradiente
              </Link>
            ) : null}
          </div>
          {SIZES.map((size) => (
            <figure key={size.id} className="flex flex-col gap-3">
              <figcaption className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="flex items-baseline gap-3">
                  <span className="font-mono">{size.id}</span>
                  <span className="text-muted-foreground">{size.label}</span>
                </span>
                <span className="flex items-center gap-4">
                  <Link
                    href={`/render/${header.slug}/${size.id}`}
                    className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Abrir em tamanho real
                  </Link>
                  {header.pending ? null : <ExportButton slug={header.slug} />}
                  {versions.get(`${header.slug}/${size.id}`) ? (
                    <ButtonLink
                      href={exportUrl(header.slug, size.id, versions.get(`${header.slug}/${size.id}`))}
                      download={exportFileName(header.slug, size.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Baixar PNG
                    </ButtonLink>
                  ) : (
                    <span className="text-muted-foreground">
                      {header.pending ? "PNG após o componente do meio" : "PNG ainda não exportado"}
                    </span>
                  )}
                </span>
              </figcaption>
              <div
                className="overflow-hidden rounded-xl border border-border"
                style={{ zoom: PREVIEW_WIDTH / size.width, width: size.width }}
              >
                <Header
                  width={size.width}
                  height={size.height}
                  title={resolved.title}
                  button={header.button}
                  watermark={header.watermark}
                  gradient={gradientFor(header)}
                >
                  {resolved.content}
                </Header>
              </div>
            </figure>
          ))}
        </section>
        );
      })}
    </main>
  );
}
