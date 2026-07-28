export type SeverityTone = "critical" | "danger" | "warning" | "success" | "muted";

const SEVERITY_MAP: Record<string, SeverityTone> = {
  critical: "critical",
  high: "danger",
  medium: "warning",
  low: "success",
  info: "muted",
};

export function severityTone(severity: string | null | undefined): SeverityTone {
  if (!severity) return "muted";
  return SEVERITY_MAP[severity.toLowerCase()] ?? "muted";
}

const STATUS_TONE_MAP: Record<string, SeverityTone> = {
  open: "danger",
  investigating: "warning",
  contained: "warning",
  resolved: "success",
  closed: "muted",
  responded: "success",
  "false positive": "muted",
  ignored: "muted",
  new: "danger",
  processed: "success",
  active: "success",
  inactive: "muted",
  success: "success",
  failed: "danger",
  pending: "warning",
};

export function statusTone(status: string | null | undefined): SeverityTone {
  if (!status) return "muted";
  return STATUS_TONE_MAP[status.toLowerCase()] ?? "muted";
}
