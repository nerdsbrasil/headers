export interface HeaderSize {
  id: string;
  width: number;
  height: number;
  label: string;
}

export const SIZES: HeaderSize[] = [
  { id: "1200x600", width: 1200, height: 600, label: "2:1 · tamanho oficial" },
  { id: "960x540", width: 960, height: 540, label: "16:9" },
];

/** Headers are exported at the official size unless they ask for more. */
export const DEFAULT_SIZE_IDS = ["1200x600"];

export function getSize(id: string) {
  return SIZES.find((size) => size.id === id);
}

/** The sizes a header is exported and shown at. */
export function sizesFor(header: { sizes?: string[] }) {
  const ids = header.sizes ?? DEFAULT_SIZE_IDS;
  return SIZES.filter((size) => ids.includes(size.id));
}
