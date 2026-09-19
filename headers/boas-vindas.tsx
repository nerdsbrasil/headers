import { MemberWelcome } from "@/components/illustrations/member-welcome";
import type { HeaderConfig } from "./types";

// Template: the bot fills in the member through /api/render/boas-vindas.
export const boasVindas: HeaderConfig = {
  slug: "boas-vindas",
  title: (p) => `Boas-vindas, ${p.username}`,
  button: "Explore a comunidade",
  watermark: true,
  gradient: true,
  params: [
    { name: "username", kind: "text", description: "Nome do membro", maxLength: 24 },
    { name: "avatar", kind: "avatar", description: "URL da foto do membro no CDN do Discord" },
  ],
  sample: {
    username: "audibert",
    avatar: "/avatars/audibert.png",
  },
  // Pedido em pedidos/boas-vindas.md (feito).
  content: (p) => <MemberWelcome avatar={p.avatar} name={p.username} />,
};
