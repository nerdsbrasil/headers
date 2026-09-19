import { Sparkles } from "lucide-react";

/**
 * Stand-in for a header's middle component while its request in
 * `pedidos/<slug>.md` is still open. Headers using it are marked
 * `pending: true` and are skipped by the export.
 */
export function PendingContent({ description }: { description: string }) {
  return (
    <div className="flex w-[560px] max-w-[70%] flex-col items-center gap-3 rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-10 py-8 text-center">
      <Sparkles className="size-6 text-muted-foreground" />
      <p className="text-lg font-medium">Componente do meio pendente</p>
      <p className="line-clamp-3 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
