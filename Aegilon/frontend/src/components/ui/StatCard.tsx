import { cn } from "@/utils/cn";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  isActive = false,
  subtext,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "primary" | "danger" | "critical" | "success" | "warning";
  isActive?: boolean;
  subtext?: string;
}) {
  return (
    <div
      className={cn(
        "folder-tab relative p-5 transition-all duration-200 cursor-pointer hover:-translate-y-1 select-none",
        isActive
          ? "folder-tab-active"
          : "folder-tab-inactive hover:bg-surface-hover"
      )}
    >
      {/* Folder Tab Label */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-wider",
            isActive ? "text-blue-100" : "text-text-muted"
          )}
        >
          {label}
        </span>
        <div
          className={cn(
            "h-7 w-7 flex items-center justify-center rounded-lg",
            isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
          )}
        >
          <Icon size={16} />
        </div>
      </div>

      {/* Main Value & Count */}
      <div className="mt-1">
        <p className={cn("text-2xl font-bold tracking-tight", isActive ? "text-white" : "text-text")}>
          {value}
        </p>
        <p className={cn("text-[11px] font-medium mt-1 truncate", isActive ? "text-blue-100/90" : "text-text-muted")}>
          {subtext || "Real-time Metrics"}
        </p>
      </div>

      {/* Stacked Avatar Preview matching Screenshot */}
      <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-current/10">
        <div className="flex -space-x-1.5">
          <div className={cn("h-5 w-5 rounded-full border border-white text-[9px] font-bold flex items-center justify-center", isActive ? "bg-white text-primary" : "bg-primary text-white")}>
            A1
          </div>
          <div className={cn("h-5 w-5 rounded-full border border-white text-[9px] font-bold flex items-center justify-center", isActive ? "bg-blue-200 text-primary" : "bg-emerald-500 text-white")}>
            H2
          </div>
          <div className={cn("h-5 w-5 rounded-full border border-white text-[9px] font-bold flex items-center justify-center", isActive ? "bg-blue-300 text-primary" : "bg-amber-500 text-white")}>
            S3
          </div>
        </div>
        <span className={cn("text-[10px] font-semibold", isActive ? "text-blue-100" : "text-text-muted")}>
          Live Sync
        </span>
      </div>
    </div>
  );
}
