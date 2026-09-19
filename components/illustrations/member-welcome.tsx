// Welcome card for a member: their avatar in a rounded square frame (same
// dark card language as the horizontal stack). The member's name goes in the
// header title, so the card itself is just the photo.

export interface MemberWelcomeProps {
  /** Local path under /public; download remote avatars so exports stay stable. */
  avatar: string;
  /** Member name, used for the image's alt text. */
  name: string;
  /**
   * Avatar side in px on the 960x540 base canvas (×1.11 in the 1200x600 PNG).
   * Discord avatars top out at 256px, so much past 256 turns soft. Default 256.
   */
  size?: number;
}

export function MemberWelcome({ avatar, name, size = 256 }: MemberWelcomeProps) {
  const frame = 8;

  return (
    <div
      className="border border-white/10 bg-[#222222]"
      style={{
        padding: frame,
        borderRadius: size * 0.2 + frame,
        boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.04)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatar}
        alt={`Foto de ${name}`}
        width={size}
        height={size}
        className="block object-cover"
        style={{ width: size, height: size, borderRadius: size * 0.2 }}
      />
    </div>
  );
}
