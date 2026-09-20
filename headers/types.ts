import type { ReactNode } from "react";

/** A value the API fills in per request, e.g. the member's name or avatar. */
export interface HeaderParam {
  name: string;
  /** `text` is escaped and length-capped; `avatar` must be an allowed image URL. */
  kind: "text" | "avatar";
  /** Shown in the docs and in error messages. */
  description: string;
  maxLength?: number;
}

export type HeaderParams = Record<string, string>;

export interface HeaderConfig {
  slug: string;
  /** Static text, or built from the request's params. Omit for a header with no title. */
  title?: string | ((params: HeaderParams) => string);
  /** Omit for a header with no button. */
  button?: string;
  watermark: boolean;
  /** Subtle Dia gradient behind the content. Settings live in lib/gradient.json. */
  gradient?: boolean;
  /**
   * Served by `GET /api/render/<slug>`. Off by default: a header is only public
   * when something outside (the Discord bot) needs to generate it on demand.
   */
  api?: boolean;
  /**
   * The middle component is still a request in `pedidos/<slug>.md`.
   * Pending headers show a placeholder and are skipped by the export.
   */
  pending?: boolean;
  /** Size ids from lib/sizes.ts. Defaults to the official 1200x600 only. */
  sizes?: string[];
  /** Params this header accepts through `/api/render/<slug>`. */
  params?: HeaderParam[];
  /** Values used by the gallery, the playground and `bun run export`. */
  sample?: HeaderParams;
  /** Static content, or built from the request's params. */
  content: ReactNode | ((params: HeaderParams) => ReactNode);
}

/** Title and content for a set of params (the sample values when none given). */
export function resolveHeader(header: HeaderConfig, params?: HeaderParams) {
  const values = params ?? header.sample ?? {};
  const title = typeof header.title === "function" ? header.title(values) : header.title;
  return {
    title,
    content: typeof header.content === "function" ? header.content(values) : header.content,
  };
}
