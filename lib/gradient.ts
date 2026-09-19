import type { DiaStop } from "@/components/effects/dia-gradient";
import saved from "./gradient.json";

/** One header's Dia gradient, as edited in /gradiente. Percent values are 0–100. */
export interface GradientSettings {
  palette: GradientPalette;
  bars: number;
  blur: number;
  /** Tallest (middle) bar, as % of the gradient box. */
  peak: number;
  /** Edge bars, as % of the peak. */
  valley: number;
  /** Gradient box height, as % of the header. */
  height: number;
  opacity: number;
}

/** Evenly spaced stops, floor first, as the reference renders them. */
function even(colors: string[]): DiaStop[] {
  return colors.map((color, i) => ({ offset: i / (colors.length - 1), color }));
}

// Dia → Mono are the "Implementation" palettes from arlan.me/vault/dia-gradient,
// read from its rendered SVG. Branco is ours: the nerdsbrasil default.
export const PALETTES = {
  branco: {
    label: "Branco",
    stops: [
      { offset: 0, color: "rgba(255, 255, 255, 1)" },
      { offset: 0.35, color: "rgba(255, 255, 255, 0.75)" },
      { offset: 0.7, color: "rgba(255, 255, 255, 0.25)" },
      { offset: 1, color: "rgba(255, 255, 255, 0)" },
    ],
  },
  dia: {
    label: "Dia",
    stops: even([
      "rgba(52, 11, 5, 1)",
      "rgba(38, 60, 167, 1)",
      "rgba(16, 84, 236, 1)",
      "rgba(65, 129, 216, 1)",
      "rgba(153, 186, 222, 1)",
      "rgba(226, 236, 251, 1)",
      "rgba(240, 224, 180, 1)",
      "rgba(254, 213, 37, 1)",
      "rgba(251, 104, 26, 1)",
      "rgba(252, 41, 184, 1)",
      "rgba(253, 75, 246, 0.846)",
      "rgba(254, 146, 250, 0.423)",
      "rgba(255, 192, 253, 0)",
    ]),
  },
  ocean: {
    label: "Ocean",
    stops: even([
      "rgba(5, 18, 46, 1)",
      "rgba(4, 56, 156, 1)",
      "rgba(4, 77, 216, 1)",
      "rgba(9, 108, 243, 1)",
      "rgba(18, 151, 231, 1)",
      "rgba(23, 183, 219, 1)",
      "rgba(94, 209, 217, 1)",
      "rgba(149, 231, 222, 1)",
      "rgba(158, 212, 232, 1)",
      "rgba(137, 151, 247, 1)",
      "rgba(137, 130, 255, 0.833)",
      "rgba(167, 188, 255, 0.417)",
      "rgba(192, 232, 255, 0)",
    ]),
  },
  sunset: {
    label: "Sunset",
    stops: even([
      "rgba(42, 10, 5, 1)",
      "rgba(79, 20, 11, 1)",
      "rgba(104, 26, 15, 1)",
      "rgba(131, 33, 19, 1)",
      "rgba(187, 46, 23, 1)",
      "rgba(230, 56, 27, 1)",
      "rgba(251, 113, 26, 1)",
      "rgba(253, 179, 16, 1)",
      "rgba(255, 201, 84, 1)",
      "rgba(255, 163, 170, 1)",
      "rgba(255, 128, 220, 0.926)",
      "rgba(255, 163, 237, 0.463)",
      "rgba(255, 192, 253, 0)",
    ]),
  },
  aurora: {
    label: "Aurora",
    stops: even([
      "rgba(2, 16, 24, 1)",
      "rgba(7, 69, 52, 1)",
      "rgba(10, 96, 70, 1)",
      "rgba(15, 128, 90, 1)",
      "rgba(24, 168, 116, 1)",
      "rgba(30, 201, 137, 1)",
      "rgba(89, 221, 162, 1)",
      "rgba(133, 236, 185, 1)",
      "rgba(148, 242, 205, 1)",
      "rgba(118, 227, 220, 1)",
      "rgba(100, 217, 233, 0.926)",
      "rgba(163, 234, 237, 0.463)",
      "rgba(207, 250, 242, 0)",
    ]),
  },
  candy: {
    label: "Candy",
    stops: even([
      "rgba(255, 122, 182, 1)",
      "rgba(255, 136, 191, 1)",
      "rgba(255, 148, 200, 1)",
      "rgba(255, 160, 209, 1)",
      "rgba(240, 163, 225, 1)",
      "rgba(221, 166, 240, 1)",
      "rgba(201, 168, 255, 1)",
      "rgba(188, 189, 255, 1)",
      "rgba(173, 209, 255, 1)",
      "rgba(199, 225, 233, 1)",
      "rgba(243, 239, 191, 1)",
      "rgba(255, 248, 212, 0.595)",
      "rgba(255, 255, 255, 0)",
    ]),
  },
  ember: {
    label: "Ember",
    stops: even([
      "rgba(26, 4, 0, 1)",
      "rgba(80, 12, 0, 1)",
      "rgba(111, 17, 0, 1)",
      "rgba(134, 21, 0, 1)",
      "rgba(174, 41, 0, 1)",
      "rgba(214, 60, 0, 1)",
      "rgba(248, 74, 0, 1)",
      "rgba(255, 109, 15, 1)",
      "rgba(255, 141, 23, 1)",
      "rgba(255, 174, 75, 1)",
      "rgba(255, 212, 138, 1)",
      "rgba(255, 236, 184, 0.694)",
      "rgba(255, 246, 224, 0)",
    ]),
  },
  mono: {
    label: "Mono",
    stops: even([
      "rgba(10, 26, 74, 1)",
      "rgba(23, 50, 140, 1)",
      "rgba(31, 66, 184, 1)",
      "rgba(37, 78, 219, 1)",
      "rgba(42, 89, 249, 1)",
      "rgba(66, 109, 255, 1)",
      "rgba(87, 128, 255, 1)",
      "rgba(103, 144, 255, 1)",
      "rgba(132, 166, 255, 1)",
      "rgba(164, 190, 255, 1)",
      "rgba(191, 211, 255, 0.926)",
      "rgba(212, 226, 255, 0.463)",
      "rgba(232, 240, 255, 0)",
    ]),
  },
} satisfies Record<string, { label: string; stops: DiaStop[] }>;

export type GradientPalette = keyof typeof PALETTES;

/** Slider ranges. Bars/blur/peak/valley match the reference playground. */
export const GRADIENT_RANGES: Record<
  Exclude<keyof GradientSettings, "palette">,
  { min: number; max: number; step: number }
> = {
  bars: { min: 3, max: 21, step: 1 },
  blur: { min: 2, max: 40, step: 1 },
  peak: { min: 40, max: 100, step: 1 },
  valley: { min: 10, max: 100, step: 1 },
  height: { min: 10, max: 100, step: 1 },
  opacity: { min: 0, max: 100, step: 1 },
};

/** The reference's defaults, for "restore original". */
export const REFERENCE_DEFAULTS: GradientSettings = {
  palette: "dia",
  bars: 9,
  blur: 15,
  peak: 98,
  valley: 55,
  height: 100,
  opacity: 100,
};

/** Fallback for headers without their own entry: the subtle white glow. */
export const DEFAULT_GRADIENT: GradientSettings = {
  palette: "branco",
  bars: 9,
  blur: 32,
  peak: 98,
  valley: 55,
  height: 75,
  opacity: 12,
};

/** Per-header settings keyed by slug, written by "Salvar" in /gradiente. */
export const SAVED_GRADIENTS = saved as Record<string, GradientSettings>;

/** Settings for a header's glow, or null when the header has it off. */
export function gradientFor(header: { slug: string; gradient?: boolean }) {
  if (!header.gradient) return null;
  return SAVED_GRADIENTS[header.slug] ?? DEFAULT_GRADIENT;
}

/** Validates untrusted input (API body, URL param) into settings, or an error message. */
export function parseGradient(input: unknown): GradientSettings | string {
  const value = (input ?? {}) as Partial<Record<keyof GradientSettings, unknown>>;
  if (typeof value.palette !== "string" || !(value.palette in PALETTES)) {
    return "Paleta inválida.";
  }
  const settings = { palette: value.palette as GradientPalette } as GradientSettings;
  for (const [key, { min, max }] of Object.entries(GRADIENT_RANGES)) {
    const n = Number(value[key as keyof typeof GRADIENT_RANGES]);
    if (!Number.isFinite(n) || n < min || n > max) return `Valor inválido para ${key}.`;
    settings[key as keyof typeof GRADIENT_RANGES] = n;
  }
  return settings;
}
