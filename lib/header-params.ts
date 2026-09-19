import type { HeaderConfig, HeaderParams } from "@/headers/types";

// Params arrive from the public render API, so they are validated here before
// anything reaches the page: a header rendered with our branding must never
// carry an arbitrary image or a title someone smuggled in.

/** Hosts an `avatar` param may point at. Discord's CDN only. */
export const AVATAR_HOSTS = ["cdn.discordapp.com", "media.discordapp.net"];

const DEFAULT_MAX_LENGTH = 40;

export function parseHeaderParams(
  header: HeaderConfig,
  input: Record<string, string | undefined>,
): HeaderParams | string {
  const params: HeaderParams = {};

  for (const spec of header.params ?? []) {
    const raw = input[spec.name];
    if (raw === undefined || raw === "") return `Falta o parâmetro "${spec.name}".`;

    if (spec.kind === "avatar") {
      let url: URL;
      try {
        url = new URL(raw);
      } catch {
        return `"${spec.name}" não é uma URL válida.`;
      }
      if (url.protocol !== "https:" || !AVATAR_HOSTS.includes(url.hostname)) {
        return `"${spec.name}" só aceita imagens de ${AVATAR_HOSTS.join(" ou ")}.`;
      }
      params[spec.name] = url.toString();
      continue;
    }

    // Collapse whitespace and drop control characters, then cap the length so
    // a long name cannot push the title out of the header.
    const text = raw.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim();
    if (!text) return `"${spec.name}" está vazio.`;
    const max = spec.maxLength ?? DEFAULT_MAX_LENGTH;
    params[spec.name] = text.length > max ? `${text.slice(0, max - 1)}…` : text;
  }

  return params;
}
