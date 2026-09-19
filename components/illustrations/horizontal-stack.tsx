// Static frame of beUI Pro's "Horizontal Stack" illustration
// (pro.beui.dev/illustrations/horizontal-stack). The Pro original rolls cards
// through focus; headers are exported as still images, so this renders the
// settled state only: the middle item in focus, neighbours stepping down in
// scale and opacity.

import { cn } from "@/lib/utils";

export interface HorizontalStackItem {
  /** Accessible name, also used as the key. */
  label: string;
  /** Path to a monochrome SVG, painted as a mask in the icon color. */
  icon: string;
  /** Optical size correction for icons that read small or large. Default 1. */
  iconScale?: number;
}

export interface HorizontalStackProps {
  items: HorizontalStackItem[];
  /** Index of the focused card. Defaults to the middle item. */
  focus?: number;
  /** Base card size in px before the per-slot scale. Default 80. */
  size?: number;
  className?: string;
}

// Settled values measured from the Pro preview, indexed by distance from focus.
const SCALE = [1.05, 0.9, 0.8, 0.7];
const OPACITY = [1, 0.8, 0.5, 0.25];
const GAP_RATIO = 0.08;
const ICON_RATIO = 0.36;

function at<T>(list: T[], distance: number) {
  return list[Math.min(distance, list.length - 1)];
}

export function HorizontalStack({
  items,
  focus = Math.floor(items.length / 2),
  size = 80,
  className,
}: HorizontalStackProps) {
  const gap = size * GAP_RATIO;
  const widths = items.map((_, i) => size * at(SCALE, Math.abs(i - focus)));

  // Walk outwards from the focused card so every gap stays equal.
  const centers: number[] = [];
  centers[focus] = 0;
  for (let i = focus + 1; i < items.length; i++) {
    centers[i] = centers[i - 1] + (widths[i - 1] + widths[i]) / 2 + gap;
  }
  for (let i = focus - 1; i >= 0; i--) {
    centers[i] = centers[i + 1] - (widths[i + 1] + widths[i]) / 2 - gap;
  }

  const left = centers[0] - widths[0] / 2;
  const right = centers[items.length - 1] + widths[items.length - 1] / 2;

  return (
    <div
      role="list"
      className={cn("relative", className)}
      style={{ width: right - left, height: size * SCALE[0] }}
    >
      {items.map((item, i) => {
        const distance = Math.abs(i - focus);
        const w = widths[i];
        const iconSize = w * ICON_RATIO * (item.iconScale ?? 1);
        const mask = {
          maskImage: `url(${item.icon})`,
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
        };

        return (
          <div
            key={item.label}
            role="listitem"
            aria-label={item.label}
            className={cn(
              "absolute top-1/2 grid place-items-center border",
              distance === 0
                ? "border-white/10 bg-[#222222]"
                : "border-border bg-card",
            )}
            style={{
              width: w,
              height: w,
              left: centers[i] - left - w / 2,
              marginTop: -w / 2,
              borderRadius: w * 0.2,
              opacity: at(OPACITY, distance),
              zIndex: items.length - distance,
              boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.04)",
            }}
          >
            <span
              aria-hidden
              className="block bg-foreground"
              style={{ width: iconSize, height: iconSize, ...mask }}
            />
          </div>
        );
      })}
    </div>
  );
}
