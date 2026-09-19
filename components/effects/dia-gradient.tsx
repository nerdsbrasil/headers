// Static take on Dia Browser's bottom glow, matching the live implementation
// at arlan.me/vault/dia-gradient: blurred bars in a bell curve, all painted
// with one vertical gradient so they melt together. The original rises from
// the floor on mount; headers are still images, so this renders fully grown.

import { useId } from "react";
import { PALETTES } from "@/lib/gradient";

export type DiaStop = { offset: number; color: string };

const VBW = 1271;
const VBH = 599;
// Bars run past the floor so the blur never fades the bottom edge.
const BLEED = VBH * 0.14;
// Bars overlap their neighbours so no seam shows between them.
const OVERLAP = 1.23;

function bellHeights(n: number, peak: number, valley: number): number[] {
  const out: number[] = [];
  const mid = (n - 1) / 2;
  for (let i = 0; i < n; i++) {
    const t = mid === 0 ? 0 : Math.abs(i - mid) / mid;
    const eased = 1 - Math.pow(t, 1.24);
    out.push(peak * VBH * (valley + (1 - valley) * eased));
  }
  return out;
}

export interface DiaGradientProps {
  bars?: number;
  /** Blur in viewBox units; converted to CSS pixels using `width`. */
  blur?: number;
  /** Tallest (middle) bar as a fraction of the box. */
  peak?: number;
  /** Edge bars as a fraction of the peak. */
  valley?: number;
  stops?: DiaStop[];
  /** Rendered width in CSS px, so the blur scales like the reference. */
  width?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function DiaGradient({
  bars = 9,
  blur = 15,
  peak = 0.98,
  valley = 0.55,
  stops = PALETTES.dia.stops,
  width = VBW,
  className,
  style,
}: DiaGradientProps) {
  // useId output has characters that are awkward inside url(#…) references.
  const gradId = `dia-grad-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const heights = bellHeights(bars, peak, valley);
  const colW = VBW / bars;

  return (
    <div aria-hidden className={className} style={style}>
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${VBW} ${VBH}`}
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: `blur(${(blur * width) / VBW}px)` }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
            {stops.map((s) => (
              <stop key={s.offset} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>
        {heights.map((h, i) => (
          <g key={i}>
            <rect
              x={i * colW}
              y={VBH - h}
              width={colW * OVERLAP}
              height={h + BLEED}
              fill={`url(#${gradId})`}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
