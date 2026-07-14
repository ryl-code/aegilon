import { cn } from "@/utils/cn";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "primary" | "danger" | "critical" | "success" | "warning";
}) {
  const toneClasses: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    danger: "text-danger bg-danger/10",
    critical: "text-critical bg-critical/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-text-muted">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-text">{value}</p>
        </div>
        <div className={cn("rounded-lg p-2.5", toneClasses[tone])}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
