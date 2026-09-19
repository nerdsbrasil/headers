"use client";

import { Check, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/motion/button/base";

// Exporting writes public/exports, which only works under `bun dev`.
const LOCAL = process.env.NODE_ENV === "development";

/** Re-exports one header's PNG (gallery, dev only) and refreshes the download link. */
export function ExportButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  if (!LOCAL) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={state === "busy"}
      title={state === "error" ? "Falha ao exportar; veja o terminal do bun dev" : undefined}
      onClick={async () => {
        setState("busy");
        const res = await fetch("/api/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        setState(res.ok ? "done" : "error");
        router.refresh();
        setTimeout(() => setState("idle"), 2000);
      }}
    >
      {state === "done" ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <RefreshCw className={state === "busy" ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
      )}
      {state === "busy"
        ? "Exportando…"
        : state === "done"
          ? "Exportado"
          : state === "error"
            ? "Falhou, tentar de novo"
            : "Exportar PNG"}
    </Button>
  );
}
