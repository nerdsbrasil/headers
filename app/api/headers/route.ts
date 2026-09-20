import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { HEADERS } from "@/headers";
import { resolveHeader } from "@/headers/types";
import {
  claudePrompt,
  requestPath,
  validateRequest,
  type HeaderRequest,
} from "@/lib/header-request";
import { sizesFor } from "@/lib/sizes";

const ROOT = process.cwd();

/** Headers and sizes for scripts/export.mjs, which skips pending ones. */
export function GET() {
  return Response.json({
    headers: HEADERS.map((h) => ({
      slug: h.slug,
      title: resolveHeader(h).title ?? h.slug,
      pending: !!h.pending,
      api: !!h.api,
      sizes: sizesFor(h).map((size) => size.id),
    })),
  });
}

function identifier(slug: string) {
  return slug.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

function headerSource(req: HeaderRequest) {
  const name = identifier(req.slug);
  return `import { PendingContent } from "@/components/illustrations/pending-content";
import type { HeaderConfig } from "./types";

export const ${name}: HeaderConfig = {
  slug: ${JSON.stringify(req.slug)},
  title: ${JSON.stringify(req.title.trim())},
  button: ${JSON.stringify(req.button.trim())},
  watermark: ${req.watermark},
  gradient: ${req.gradient},
  // Pedido em ${requestPath(req.slug)}: troque pelo componente do meio e remova \`pending\`.
  pending: true,
  content: <PendingContent description={${JSON.stringify(req.description.trim())}} />,
};
`;
}

function requestSource(req: HeaderRequest) {
  const today = new Date().toISOString().slice(0, 10);
  const references = req.references
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return `---
slug: ${req.slug}
status: pendente
criado: ${today}
---

# Header: ${req.title.trim()}

- Título: ${req.title.trim()}
- Botão: ${req.button.trim()}
- Marca d'água: ${req.watermark ? "sim" : "não"}
- Gradiente: ${req.gradient ? "sim" : "não"}
- Arquivo: \`headers/${req.slug}.tsx\`

## Conteúdo central

${req.description.trim()}
${references.length ? `\n## Referências\n\n${references.map((r) => `- ${r}`).join("\n")}\n` : ""}
## Para o Claude

${claudePrompt(req)}
`;
}

async function register(slug: string) {
  const file = path.join(ROOT, "headers", "index.ts");
  const source = await readFile(file, "utf8");
  const name = identifier(slug);
  const importAnchor = 'import type { HeaderConfig } from "./types";';
  const listAnchor = "\n];";
  if (!source.includes(importAnchor) || !source.includes(listAnchor)) {
    throw new Error("headers/index.ts não tem o formato esperado.");
  }
  const next = source
    .replace(importAnchor, `import { ${name} } from "./${slug}";\n${importAnchor}`)
    .replace(listAnchor, `\n  ${name},${listAnchor}`);
  await writeFile(file, next);
}

// Creates headers/<slug>.tsx with a placeholder middle, registers it and
// writes the request for the middle component. Dev only: it writes source.
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Disponível só no `bun dev`." }, { status: 403 });
  }

  const body = (await request.json()) as HeaderRequest;
  const req: HeaderRequest = {
    slug: String(body.slug ?? ""),
    title: String(body.title ?? ""),
    button: String(body.button ?? ""),
    watermark: Boolean(body.watermark),
    gradient: Boolean(body.gradient),
    description: String(body.description ?? ""),
    references: String(body.references ?? ""),
  };

  const existing = HEADERS.map((h) => h.slug);
  const headerFile = path.join(ROOT, "headers", `${req.slug}.tsx`);
  if (existsSync(headerFile)) existing.push(req.slug);
  const errors = validateRequest(req, existing);
  if (Object.keys(errors).length) {
    return Response.json({ error: "Campos inválidos.", fields: errors }, { status: 400 });
  }

  await mkdir(path.join(ROOT, "pedidos"), { recursive: true });
  await writeFile(headerFile, headerSource(req));
  await writeFile(path.join(ROOT, requestPath(req.slug)), requestSource(req));
  await register(req.slug);

  return Response.json({
    slug: req.slug,
    request: requestPath(req.slug),
    prompt: claudePrompt(req),
  });
}
