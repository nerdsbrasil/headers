// The community's mark: logo and wordmark side by side, for the home screen
// header. No title, button or watermark around it — the lockup is the header.

export interface BrandLockupProps {
  /** Logo height in px on the 960x540 base canvas. Default 132. */
  size?: number;
  name?: string;
}

export function BrandLockup({ size = 132, name = "Nerds Brasil" }: BrandLockupProps) {
  return (
    <div className="flex items-center" style={{ gap: size * 0.22 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logotipo.png"
        alt="Nerds Brasil"
        width={size}
        height={size}
        style={{ width: size, height: size }}
      />
      <span
        className="leading-none font-semibold tracking-[-0.035em]"
        style={{ fontSize: size * 0.48 }}
      >
        {name}
      </span>
    </div>
  );
}
