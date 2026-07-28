import { cn } from "@/utils/cn";
import { severityTone, statusTone, type SeverityTone } from "@/utils/severity";

const TONE_CLASSES: Record<SeverityTone, string> = {
  critical: "bg-critical/15 text-critical border-critical/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  success: "bg-success/15 text-success border-success/30",
  muted: "bg-background text-text-muted border-border",
};

export function Badge({
  tone = "muted",
  children,
}: {
  tone?: SeverityTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE_CLASSES[tone]
      )}
    >
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string | null | undefined }) {
  return <Badge tone={severityTone(severity)}>{severity ?? "Unknown"}</Badge>;
}

export function StatusBadge({ status }: { status: string | null | undefined }) {
  return <Badge tone={statusTone(status)}>{status ?? "Unknown"}</Badge>;
}
