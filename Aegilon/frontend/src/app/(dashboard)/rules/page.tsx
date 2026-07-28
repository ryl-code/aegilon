"use client";

import { useQuery } from "@tanstack/react-query";
import { BookMarked } from "lucide-react";
import { getRules } from "@/services/rules";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SeverityBadge, Badge } from "@/components/ui/Badge";
import { Loading } from "@/components/ui/Loading";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader, PageCard } from "@/components/ui/PageHeader";
import type { Rule } from "@/types";

const columns: Column<Rule>[] = [
  { header: "Rule ID", render: (r) => <span className="font-mono text-xs font-bold text-primary">{r.rule_id ?? r.id.slice(0, 8)}</span> },
  { header: "Name", render: (r) => <span className="font-semibold text-text">{r.name}</span> },
  { header: "Description", render: (r) => <span className="text-text-muted text-xs">{r.description ?? "-"}</span> },
  { header: "MITRE ATT&CK", render: (r) => <span className="font-mono text-xs bg-surface-secondary px-2 py-0.5 rounded border border-border">{r.mitre ?? "-"}</span> },
  { header: "Severity", render: (r) => <SeverityBadge severity={r.severity} /> },
  {
    header: "Enabled",
    render: (r) => <Badge tone={r.enabled ? "success" : "muted"}>{r.enabled ? "Active" : "Disabled"}</Badge>,
  },
];

export default function RulesPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["rules"],
    queryFn: () => getRules(0, 200),
    retry: false,
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Detection Rules"
        description="SIEM & XDR detection signatures evaluated by the AEGILON engine"
        badge="Ruleset Catalog"
        badgeIcon={<BookMarked size={13} />}
      />

      <PageCard noPadding>
        <div className="p-5">
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
      </PageCard>
    </div>
  );
}
