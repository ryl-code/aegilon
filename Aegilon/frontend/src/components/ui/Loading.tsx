import { Loader2 } from "lucide-react";

export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-muted">
      <Loader2 className="animate-spin text-primary" size={28} />
      <p className="text-sm">{label}</p>
    </div>
  );
}
