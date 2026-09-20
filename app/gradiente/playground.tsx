"use client";

import { Check, Copy, RotateCcw, Save, Undo2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DiaGradient } from "@/components/effects/dia-gradient";
import { Header } from "@/components/header/header";
import { Button } from "@/components/motion/button/base";
import { FluidSlider } from "@/components/motion/range-slider-fluid";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { HEADERS } from "@/headers";
import { resolveHeader } from "@/headers/types";
import {
  GRADIENT_RANGES,
  PALETTES,
  REFERENCE_DEFAULTS,
  gradientFor,
  type GradientPalette,
  type GradientSettings,
} from "@/lib/gradient";
import { SIZES } from "@/lib/sizes";

type NumericKey = Exclude<keyof GradientSettings, "palette">;

const SLIDERS: { key: NumericKey; label: string; unit?: string }[] = [
  { key: "bars", label: "Barras" },
  { key: "blur", label: "Blur" },
  { key: "peak", label: "Pico", unit: "%" },
  { key: "valley", label: "Vale", unit: "%" },
  { key: "height", label: "Altura", unit: "%" },
  { key: "opacity", label: "Opacidade", unit: "%" },
];

const SIZE = SIZES[0];
// Saving writes lib/gradient.json, which only exists under `bun dev`.
const LOCAL = process.env.NODE_ENV === "development";

// Only headers with the glow switched on have anything to edit.
const GRADIENT_HEADERS = HEADERS.filter((h) => h.gradient);
const INITIAL = Object.fromEntries(
  GRADIENT_HEADERS.map((h) => [h.slug, gradientFor(h) as GradientSettings]),
);

const same = (a: GradientSettings, b: GradientSettings) =>
  JSON.stringify(a) === JSON.stringify(b);

type View = "header" | "isolado";
type Status = { kind: "idle" } | { kind: "ok"; text: string } | { kind: "error"; text: string };

export function GradientPlayground({ initialSlug }: { initialSlug?: string }) {
  const [headerSlug, setHeaderSlug] = useState(
    GRADIENT_HEADERS.find((h) => h.slug === initialSlug)?.slug ?? GRADIENT_HEADERS[0]?.slug,
  );
  // One draft per header, so switching tabs never loses unsaved edits.
  const [drafts, setDrafts] = useState<Record<string, GradientSettings>>(INITIAL);
  const [saved, setSaved] = useState<Record<string, GradientSettings>>(INITIAL);
  const [view, setView] = useState<View>("header");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [saving, setSaving] = useState(false);

  const header = GRADIENT_HEADERS.find((h) => h.slug === headerSlug);
  const resolved = header ? resolveHeader(header) : null;
  const settings = header ? drafts[header.slug] : null;
  const dirty = header && settings ? !same(settings, saved[header.slug]) : false;

  const previewRef = useRef<HTMLDivElement>(null);
  const [previewWidth, setPreviewWidth] = useState(1000);
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setPreviewWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!header || !settings || !resolved) {
    return (
      <main className="mx-auto flex max-w-[1040px] flex-col gap-4 px-4 py-12">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Headers
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Dia gradient</h1>
        <p className="text-muted-foreground">
          Nenhum header tem o gradiente ligado (<code className="font-mono">gradient: true</code>).
        </p>
      </main>
    );
  }

  const selectHeader = (slug: string) => {
    if (saving) return;
    setHeaderSlug(slug);
    setStatus({ kind: "idle" });
    window.history.replaceState(null, "", `?header=${slug}`);
  };

  const update = (next: GradientSettings) => {
    setDrafts((prev) => ({ ...prev, [header.slug]: next }));
    setStatus({ kind: "idle" });
  };
  const set = <K extends keyof GradientSettings>(key: K, value: GradientSettings[K]) =>
    update({ ...settings, [key]: value });

  const copy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
    setStatus({ kind: "ok", text: "Config copiada" });
  };

  const save = async () => {
    const target = header;
    setSaving(true);
    setStatus({ kind: "idle" });
    try {
      const res = await fetch("/api/gradient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: target.slug, settings }),
      });
      const body = await res.json();
      if (!res.ok) {
        setStatus({ kind: "error", text: body.error ?? "Falha ao salvar" });
        return;
      }
      setSaved((prev) => ({ ...prev, [target.slug]: body.settings }));
      setStatus(
        body.exportError
          ? { kind: "error", text: `Salvo, mas o PNG não foi exportado (rode bun run export).` }
          : { kind: "ok", text: `Salvo e PNG exportado para “${resolveHeader(target).title ?? target.slug}”` },
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-[1040px] flex-col gap-8 px-4 py-12">
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Headers
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Dia gradient</h1>
        <p className="max-w-[62ch] text-muted-foreground">
          Mesma implementação de{" "}
          <a
            href="https://www.arlan.me/vault/dia-gradient"
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline underline-offset-4"
          >
            arlan.me/vault/dia-gradient
          </a>
          , estática. Cada header tem o próprio gradiente: “Salvar” grava só o header selecionado
          em <code className="font-mono text-foreground">lib/gradient.json</code> e já exporta o
          PNG dele para o botão “Baixar PNG”.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm text-muted-foreground">Header</span>
        <Tabs value={header.slug} onValueChange={selectHeader} variant="pill">
          <TabsList>
            {GRADIENT_HEADERS.map((h) => (
              <TabsTrigger key={h.slug} value={h.slug}>
                <span className="inline-flex items-center gap-2">
                  {resolveHeader(h).title ?? h.slug}
                  {!same(drafts[h.slug], saved[h.slug]) ? (
                    <span aria-label="alterações não salvas" className="size-1.5 rounded-full bg-accent" />
                  ) : null}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-3">
        <Tabs value={view} onValueChange={(v) => setView(v as View)} variant="pill">
          <TabsList>
            <TabsTrigger value="header">No header</TabsTrigger>
            <TabsTrigger value="isolado">Isolado</TabsTrigger>
          </TabsList>
        </Tabs>

        <div
          ref={previewRef}
          className="w-full overflow-hidden rounded-xl border border-border"
          style={{
            aspectRatio: view === "header" ? `${SIZE.width} / ${SIZE.height}` : "16 / 9",
          }}
        >
          {view === "header" ? (
            <div style={{ zoom: previewWidth / SIZE.width, width: SIZE.width }}>
              <Header
                width={SIZE.width}
                height={SIZE.height}
                title={resolved.title}
                button={header.button}
                watermark={header.watermark}
                gradient={settings}
              >
                {resolved.content}
              </Header>
            </div>
          ) : (
            // Same stage as the reference preview: gradient on the floor, full width.
            <div className="relative flex h-full items-end bg-[#151515]">
              <DiaGradient
                bars={settings.bars}
                blur={settings.blur}
                peak={settings.peak / 100}
                valley={settings.valley / 100}
                stops={PALETTES[settings.palette].stops}
                width={previewWidth}
                className="h-full w-full"
                style={{ opacity: settings.opacity / 100 }}
              />
            </div>
          )}
        </div>
      </div>

      <section className="flex flex-col gap-5 rounded-xl border border-border bg-card/40 p-5">
        <div className="flex flex-col gap-3">
          <span className="text-sm text-muted-foreground">Paleta</span>
          <Tabs
            value={settings.palette}
            onValueChange={(v) => set("palette", v as GradientPalette)}
            variant="pill"
          >
            <TabsList>
              {Object.entries(PALETTES).map(([key, palette]) => (
                <TabsTrigger key={key} value={key}>
                  <span className="inline-flex items-center gap-2">
                    <span
                      aria-hidden
                      className="size-3 rounded-full border border-white/10"
                      style={{
                        background: `linear-gradient(to top, ${palette.stops
                          .map((s) => `${s.color} ${s.offset * 100}%`)
                          .join(", ")})`,
                      }}
                    />
                    {palette.label}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {SLIDERS.map((s) => (
            <FluidSlider
              key={s.key}
              label={s.label}
              aria-label={s.label}
              {...GRADIENT_RANGES[s.key]}
              value={settings[s.key]}
              onValueChange={(v) => set(s.key, v)}
              format={(v) => `${v}${s.unit ?? ""}`}
              className="h-11"
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
          <Button variant="primary" size="md" onClick={save} disabled={!dirty || !LOCAL || saving}>
            <Save className="h-4 w-4" />
            {saving ? "Salvando e exportando…" : "Salvar neste header"}
          </Button>
          <Button variant="outline" size="md" onClick={copy}>
            <Copy className="h-4 w-4" />
            Copiar config
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => update(saved[header.slug])}
            disabled={!dirty}
          >
            <Undo2 className="h-4 w-4" />
            Voltar ao salvo
          </Button>
          <Button variant="ghost" size="md" onClick={() => update(REFERENCE_DEFAULTS)}>
            <RotateCcw className="h-4 w-4" />
            Original do arlan.me
          </Button>
          <span
            role="status"
            className={
              status.kind === "error"
                ? "text-sm text-destructive"
                : "inline-flex items-center gap-1.5 text-sm text-muted-foreground"
            }
          >
            {status.kind === "ok" ? <Check className="h-4 w-4" /> : null}
            {status.kind === "idle"
              ? !LOCAL
                ? "Salvar só funciona rodando local (bun dev). Use “Copiar config”."
                : dirty
                  ? "Alterações não salvas"
                  : "Igual ao salvo"
              : status.text}
          </span>
        </div>
      </section>

      <pre className="overflow-x-auto rounded-xl border border-border bg-card/40 p-5 font-mono text-sm text-muted-foreground">
        {`"${header.slug}": ${JSON.stringify(settings, null, 2)}`}
      </pre>
    </main>
  );
}
