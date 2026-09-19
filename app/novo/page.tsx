import type { Metadata } from "next";
import { HeaderCreator } from "./creator";

export const metadata: Metadata = {
  title: "Novo header · Headers",
};

export default function NewHeaderPage() {
  return <HeaderCreator />;
}
