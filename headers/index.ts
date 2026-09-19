import { tecnologias } from "./tecnologias";
import { boasVindas } from "./boas-vindas";
import type { HeaderConfig } from "./types";

// New headers from /novo are appended here by app/api/headers/route.ts.
export const HEADERS: HeaderConfig[] = [
  tecnologias,
  boasVindas,
];

export function getHeader(slug: string) {
  return HEADERS.find((header) => header.slug === slug);
}
