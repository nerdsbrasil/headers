"use client";

import { Check, Copy, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/header/header";
import { PendingContent } from "@/components/illustrations/pending-content";
import { Button } from "@/components/motion/button/base";
import { Input } from "@/components/motion/input";
import { Switch } from "@/components/motion/switch";
import { HEADERS } from "@/headers";
import { resolveHeader } from "@/headers/types";
import { DEFAULT_GRADIENT } from "@/lib/gradient";
import {
  claudePrompt,
  requestPath,
  slugify,
  validateRequest,
  type HeaderRequest,
} from "@/lib/header-request";
import { cn } from "@/lib/utils";
import { SIZES } from "@/lib/sizes";

const SIZE = SIZES[0];
// Creating writes headers/ and pedidos/, which only exist under `bun dev`.
const LOCAL = process.env.NODE_ENV === "development";

const EMPTY: HeaderRequest = {
  slug: "",
  title: "",
  button: "",
  watermark: true,
  gradient: true,
  description: "",
  references: "",
};

type Created = { slug: string; title: string; request: string; prompt: string };

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copiado" : label}
    </Button>
  );
}

function Textarea({
  label,
  hint,
  error,
  ...props
}: {
  label: string;
  hint?: string;
  error?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="px-1 text-sm font-medium">{label}</span>
      <textarea
        {...props}
        className={cn(
          "min-h-28 resize-y rounded-2xl border border-border bg-transparent px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground",
          "focus:border-foreground/40 focus:ring-2 focus:ring-ring/40",
          error && "border-destructive ring-2 ring-destructive/25",
        )}
      />
      {error ? (
        <span className="px-1 text-xs text-destructive">{error}</span>
      ) : hint ? (
        <span className="px-1 text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

export function HeaderCreator() {
  const [form, setForm] = useState<HeaderRequest>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [created, setCreated] = useState<Created | null>(null);
  const [saving, setSaving] = useState(false);

  const existing = HEADERS.map((h) => h.slug);
  const errors = validateRequest(form, created ? [] : existing);
  const shown = submitted ? errors : {};
  const pending = HEADERS.filter((h) => h.pending);

  const previewRef = useRef<HTMLDivElement>(null);
  const [previewWidth, setPreviewWidth] = useState(600);
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setPreviewWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const set = <K extends keyof HeaderRequest>(key: K, value: HeaderRequest[K]) =>
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !slugTouched) next.slug = slugify(String(value));
      return next;
    });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setServerError(null);
    if (Object.keys(errors).length) return;
    setSaving(true);
    try {
      const res = await fetch("/api/headers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) {
        setServerError(
          body.fields ? Object.values(body.fields).join(" ") : (body.error ?? "Falha ao criar"),
        );
        return;
      }
      setCreated({ ...body, title: form.title.trim() });
      setForm(EMPTY);
      setSlugTouched(false);
      setSubmitted(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-10 px-4 py-12">
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Headers
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Novo header</h1>
        <p className="max-w-[64ch] text-muted-foreground">
          Defina título e botão e descreva o componente do meio. O header é criado na hora com um
          espaço reservado no centro, e o pedido do componente fica em{" "}
          <code className="font-mono text-foreground">pedidos/</code> para o Claude implementar.
        </p>
      </div>

      {!LOCAL ? (
        <p className="rounded-xl border border-border bg-card/40 p-4 text-sm text-muted-foreground">
          Criar headers só funciona rodando o projeto local (<code className="font-mono">bun dev</code>
          ), porque grava arquivos no código. Aqui dá para montar e ver o preview.
        </p>
      ) : null}

      {created ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/40 p-5">
          <p className="inline-flex items-center gap-2 font-medium">
            <Check className="h-4 w-4" />
            Header “{created.title}” criado
          </p>
          <p className="text-sm text-muted-foreground">
            Criado <code className="font-mono">headers/{created.slug}.tsx</code> e o pedido{" "}
            <code className="font-mono">{created.request}</code>. Cole isto no Claude Code para
            gerar o componente do meio:
          </p>
          <pre className="whitespace-pre-wrap rounded-lg bg-background/60 p-4 font-mono text-sm">
            {created.prompt}
          </pre>
          <div className="flex flex-wrap gap-3">
            <CopyButton text={created.prompt} label="Copiar pedido" />
            <Button variant="ghost" size="sm" onClick={() => setCreated(null)}>
              <Plus className="h-3.5 w-3.5" />
              Criar outro
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <Input
            label="Título"
            placeholder="Ex.: Boas-vindas"
            value={form.title}
            onChange={(v) => set("title", v)}
            error={shown.title}
          />
          <Input
            label="Texto do botão"
            placeholder="Ex.: Entre na comunidade"
            value={form.button}
            onChange={(v) => set("button", v)}
            error={shown.button}
          />
          <Input
            label="Slug"
            placeholder="boas-vindas"
            value={form.slug}
            onChange={(v) => {
              setSlugTouched(true);
              set("slug", v);
            }}
            error={shown.slug}
          />

          <div className="flex flex-wrap gap-6 px-1">
            <Switch
              label="Marca d'água"
              checked={form.watermark}
              onCheckedChange={(v) => set("watermark", v)}
            />
            <Switch
              label="Dia gradient"
              checked={form.gradient}
              onCheckedChange={(v) => set("gradient", v)}
            />
          </div>

          <Textarea
            label="Componente do meio"
            placeholder="Ex.: Uma fila de avatares da comunidade em cards escuros, o do centro em foco…"
            hint="Como no prompt.md: o que aparece no centro, estilo, ícones, cores."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            error={shown.description}
          />
          <Textarea
            label="Referências (opcional)"
            placeholder={"https://beui.dev/components/…\nhttps://pro.beui.dev/illustrations/…"}
            hint="Um link por linha: componentes do beUI, inspirações."
            value={form.references}
            onChange={(e) => set("references", e.target.value)}
            rows={3}
          />

          {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}

          <div>
            <Button type="submit" variant="primary" size="md" disabled={saving || !LOCAL}>
              <Plus className="h-4 w-4" />
              {saving ? "Criando…" : "Criar header e pedir componente"}
            </Button>
          </div>
        </form>

        <div className="flex flex-col gap-3 lg:sticky lg:top-8">
          <span className="text-sm text-muted-foreground">Preview · {SIZE.id}</span>
          <div
            ref={previewRef}
            className="w-full overflow-hidden rounded-xl border border-border"
            style={{ aspectRatio: `${SIZE.width} / ${SIZE.height}` }}
          >
            <div style={{ zoom: previewWidth / SIZE.width, width: SIZE.width }}>
              <Header
                width={SIZE.width}
                height={SIZE.height}
                title={form.title || "Título"}
                button={form.button || "Texto do botão"}
                watermark={form.watermark}
                gradient={form.gradient ? DEFAULT_GRADIENT : null}
              >
                <PendingContent
                  description={form.description || "A descrição do componente aparece aqui."}
                />
              </Header>
            </div>
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Pedidos pendentes</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum pedido aberto.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
            {pending.map((h) => (
              <li key={h.slug} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex flex-col">
                  <span className="font-medium">{resolveHeader(h).title ?? h.slug}</span>
                  <code className="font-mono text-xs text-muted-foreground">
                    {requestPath(h.slug)}
                  </code>
                </div>
                <CopyButton
                  text={claudePrompt({ slug: h.slug, title: resolveHeader(h).title ?? h.slug })}
                  label="Copiar pedido"
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
