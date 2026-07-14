"use client";

import { useQuery } from "@tanstack/react-query";
import { getRules } from "@/services/rules";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SeverityBadge, Badge } from "@/components/ui/Badge";
import { Loading } from "@/components/ui/Loading";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Rule } from "@/types";

const columns: Column<Rule>[] = [
  { header: "Rule ID", render: (r) => <span className="font-mono text-xs">{r.rule_id ?? r.id.slice(0, 8)}</span> },
  { header: "Name", render: (r) => r.name },
  { header: "Description", render: (r) => <span className="text-text-muted">{r.description ?? "-"}</span> },
  { header: "MITRE", render: (r) => r.mitre ?? "-" },
  { header: "Severity", render: (r) => <SeverityBadge severity={r.severity} /> },
  {
    header: "Enabled",
    render: (r) => <Badge tone={r.enabled ? "success" : "muted"}>{r.enabled ? "Enabled" : "Disabled"}</Badge>,
  },
];

export default function RulesPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["rules"],
    queryFn: () => getRules(0, 200),
    retry: false,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-text">Rules</h1>
        <p className="text-sm text-text-muted">Detection rules evaluated by the AEGILON engine</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        {isLoading ? (
          <Loading label="Loading rules..." />
        ) : isError ? (
          <EmptyState
            title="Rules endpoint not available yet"
            description={`The backend does not expose GET /rules yet (${
              (error as { response?: { status?: number } })?.response?.status ?? "network error"
            }). This page is wired up per the UI spec and will populate automatically once the backend adds the endpoint.`}
          />
        ) : (
          <DataTable columns={columns} rows={data ?? []} keyFn={(r) => r.id} emptyTitle="No rules found" />
        )}
      </div>
    </div>
  );
}
