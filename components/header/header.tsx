import type { ReactNode } from "react";
import { DiaGradient } from "@/components/effects/dia-gradient";
import { PALETTES, type GradientSettings } from "@/lib/gradient";
import { HeaderButton } from "./header-button";

/**
 * Every header is laid out on a logical canvas fitted to 960x540 (whichever
 * side is tighter) and zoomed to the real pixel size, so the title, button,
 * watermark and content keep the same proportions at any export size.
 */
export const BASE_WIDTH = 960;
export const BASE_HEIGHT = 540;

export interface HeaderProps {
  width: number;
  height: number;
  /** Top-left title. Omit it for a header that is only its centre. */
  title?: string;
  /** Bottom-left button label. Omit it for a header with no button. */
  button?: string;
  /** Show the logo watermark in the bottom-right corner. Default true. */
  watermark?: boolean;
  /** Dia glow rising from the bottom edge, or null for none. See `gradientFor`. */
  gradient?: GradientSettings | null;
  children: ReactNode;
}

export function Header({
  width,
  height,
  title,
  button,
  watermark = true,
  gradient = null,
  children,
}: HeaderProps) {
  const scale = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT);

  return (
    <div
      data-header
      className="relative overflow-hidden bg-[#151515] font-sans text-foreground"
      style={{ width, height }}
    >
      <div
        className="relative"
        style={{ width: width / scale, height: height / scale, zoom: scale }}
      >
        {gradient ? (
          <DiaGradient
            bars={gradient.bars}
            blur={gradient.blur}
            peak={gradient.peak / 100}
            valley={gradient.valley / 100}
            stops={PALETTES[gradient.palette].stops}
            width={width / scale}
            className="absolute inset-x-0 bottom-0"
            style={{ height: `${gradient.height}%`, opacity: gradient.opacity / 100 }}
          />
        ) : null}

        {title ? (
          <h1
            className="absolute top-10 left-12 leading-none font-semibold tracking-[-0.03em]"
            // A member's name goes in the title, so long ones step down a size
            // instead of running into the right edge.
            style={{ fontSize: title.length > 34 ? 40 : title.length > 26 ? 46 : 52 }}
          >
            {title}
          </h1>
        ) : null}

        <div className="absolute inset-0 grid place-items-center">
          {children}
        </div>

        {button || watermark ? (
          <div className="absolute right-12 bottom-10 left-12 flex items-center justify-between">
            {button ? <HeaderButton label={button} /> : <span />}
            {watermark ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/logotipo.png" alt="nerdsbrasil" className="size-[72px]" />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
