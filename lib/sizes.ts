export interface HeaderSize {
  id: string;
  width: number;
  height: number;
  label: string;
}

// Official header size.
export const SIZES: HeaderSize[] = [
  { id: "1200x600", width: 1200, height: 600, label: "2:1 · tamanho oficial" },
];

export function getSize(id: string) {
  return SIZES.find((size) => size.id === id);
}
