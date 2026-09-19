import type { Metadata } from "next";
import { GradientPlayground } from "./playground";

export const metadata: Metadata = {
  title: "Dia gradient · Headers",
};

export default async function GradientPage({
  searchParams,
}: {
  searchParams: Promise<{ header?: string }>;
}) {
  const { header } = await searchParams;
  return <GradientPlayground initialSlug={header} />;
}
