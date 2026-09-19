// Shared by the /novo form and the API that writes the files.

export interface HeaderRequest {
  slug: string;
  title: string;
  button: string;
  watermark: boolean;
  gradient: boolean;
  /** What the middle component should be, in the user's words. */
  description: string;
  /** Optional links (beUI pages, references), one per line. */
  references: string;
}

export const SLUG_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const RESERVED = new Set(["index", "types"]);

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^[^a-z]+|-+$/g, "");
}

/** Returns an error message per invalid field. */
export function validateRequest(req: HeaderRequest, existing: string[]) {
  const errors: Partial<Record<keyof HeaderRequest, string>> = {};
  if (!req.title.trim()) errors.title = "Informe o título.";
  if (!req.button.trim()) errors.button = "Informe o texto do botão.";
  if (!SLUG_PATTERN.test(req.slug)) {
    errors.slug = "Use letras minúsculas, números e hífens (ex.: boas-vindas).";
  } else if (RESERVED.has(req.slug) || existing.includes(req.slug)) {
    errors.slug = "Já existe um header com esse slug.";
  }
  if (req.description.trim().length < 10) {
    errors.description = "Descreva o componente do meio (pelo menos uma frase).";
  }
  return errors;
}

export function requestPath(slug: string) {
  return `pedidos/${slug}.md`;
}

/** What to paste into Claude Code to get the middle component built. */
export function claudePrompt(req: Pick<HeaderRequest, "slug" | "title">) {
  return [
    `Implemente o componente do meio do header "${req.title}" seguindo o pedido em ${requestPath(req.slug)}.`,
    `Troque o <PendingContent> em headers/${req.slug}.tsx pelo componente, remova \`pending: true\`, rode \`bun run export\`, confira o PNG e marque o pedido como feito.`,
  ].join(" ");
}
