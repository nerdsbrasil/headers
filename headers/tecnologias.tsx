import { HorizontalStack } from "@/components/illustrations/horizontal-stack";
import type { HeaderConfig } from "./types";

export const tecnologias: HeaderConfig = {
  slug: "tecnologias",
  title: "Tecnologias",
  button: "Escolha sua stack",
  watermark: true,
  gradient: true,
  content: (
    <HorizontalStack
      size={180}
      items={[
        { label: "C#", icon: "/icons/csharp.svg" },
        { label: "JavaScript", icon: "/icons/javascript.svg", iconScale: 0.92 },
        { label: "Python", icon: "/icons/python.svg" },
        { label: "Java", icon: "/icons/java.svg", iconScale: 1.1 },
        { label: "Go", icon: "/icons/go.svg", iconScale: 1.25 },
      ]}
    />
  ),
};
