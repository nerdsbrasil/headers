import { BrandLockup } from "@/components/illustrations/brand-lockup";
import type { HeaderConfig } from "./types";

// Foge do padrão de propósito: só a marca no centro, sem título, botão ou
// marca d'água. Usado na tela de início.
export const branding: HeaderConfig = {
  slug: "branding",
  watermark: false,
  gradient: true,
  sizes: ["1200x600", "960x540"],
  content: <BrandLockup />,
};
