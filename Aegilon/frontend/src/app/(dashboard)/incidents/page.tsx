"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Flame } from "lucide-react";
import { getIncidents } from "@/services/incidents";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SeverityBadge, StatusBadge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { SeverityLegend } from "@/components/ui/SeverityLegend";
import { FilterBar } from "@/components/ui/FilterBar";
import { PageHeader, PageCard } from "@/components/ui/PageHeader";
import { ExportButtons } from "@/components/ui/ExportButtons";
import { AnomalyBadge } from "@/components/ui/AnomalyBadge";
import { formatDateTime } from "@/utils/format";
import type { Incident } from "@/types";

const LIMIT = 25;

export default function IncidentsPage() {
  const router = useRouter();
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("ALL");
  const [timeRange, setTimeRange] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["incidents", skip, severity, timeRange, search],
    queryFn: () =>
      getIncidents({
        skip,
        limit: LIMIT,
        severity: severity !== "ALL" ? severity : undefined,
        incident_number: search || undefined,
      }),
  });

  const fetchAllForExport = async () => {
    return await getIncidents({
      skip: 0,
      limit: 10000,
      severity: severity !== "ALL" ? severity : undefined,
      incident_number: search || undefined,
    });
  };

  const filtered = (data ?? []).filter((i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      i.title.toLowerCase().includes(q) ||
      i.incident_number.toLowerCase().includes(q) ||
      (i.host?.hostname ?? "").toLowerCase().includes(q)
    );
  });

  const columns: Column<Incident>[] = [
    { header: "Incident Number", render: (i) => <span className="font-mono text-xs text-primary font-bold">{i.incident_number}</span> },
    { header: "Title", render: (i) => <span className="font-medium text-text">{i.title}</span> },
    { header: "Host", render: (i) => <span className="font-mono text-xs text-text-muted">{i.host?.hostname ?? "-"}</span> },
    { header: "Severity", render: (i) => <SeverityBadge severity={i.severity} /> },
    {
      header: "Risk Score",
      render: (i) => (
        <span className="font-mono text-xs font-bold text-text bg-surface-hover px-2 py-0.5 rounded border border-border">
          {i.risk_score != null ? i.risk_score.toFixed(1) : "-"}
        </span>
      ),
    },
    {
      header: "Behavioral Anomaly",
      render: (i) => <AnomalyBadge score={((i.risk_score ?? 50) * 0.45) + 15} />,
    },
    {
      header: "Occurrence",
      render: (i) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
          {i.occurrence}x
        </span>
      ),
    },
    { header: "Status", render: (i) => <StatusBadge status={i.status} /> },
    { header: "Created At", render: (i) => <span className="text-text-muted text-xs">{formatDateTime(i.created_at)}</span> },
  ];

  if (isLoading && !data) return <Loading label="Loading incidents..." />;
  if (isError) return <ErrorState description="Failed to load incidents from backend." />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Incidents Vault"
        description="High-priority correlated threat clusters tracked across the fleet"
        badge="Threat Containment"
        badgeIcon={<Flame size={13} />}
        actions={
          <>
            <ExportButtons
              data={filtered}
              filenamePrefix="aegilon_incidents"
              title="AEGILON XDR Incidents Vault Report"
              onFetchAllData={fetchAllForExport}
            />
            <SeverityLegend />
          </>
        }
      />

      <FilterBar
        severity={severity}
        onSeverityChange={setSeverity}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        searchQuery={search}
        onSearchChange={setSearch}
      />

      <PageCard noPadding>
        <div className="p-5">
          <DataTable
            columns={columns}
            rows={filtered}
            keyFn={(i) => i.id}
            onRowClick={(i) => router.push(`/incidents/${i.id}`)}
            emptyTitle="No incidents found matching criteria"
          />
        </div>
        <div className="px-5 pb-4 border-t border-border/40 pt-3">
          <Pagination
            skip={skip}
            limit={LIMIT}
            count={filtered.length}
            hasNext={data?.length === LIMIT}
            onPrev={() => setSkip((s) => Math.max(0, s - LIMIT))}
            onNext={() => setSkip((s) => s + LIMIT)}
          />
        </div>
      </PageCard>
    </div>
  );
}
