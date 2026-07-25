"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getIncidents } from "@/services/incidents";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SeverityBadge, StatusBadge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { SeverityLegend } from "@/components/ui/SeverityLegend";
import { FilterBar } from "@/components/ui/FilterBar";
import { formatDateTime } from "@/utils/format";
import { ExportButtons } from "@/components/ui/ExportButtons";
import { AnomalyBadge } from "@/components/ui/AnomalyBadge";
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
    { header: "Incident Number", render: (i) => <span className="font-mono text-xs text-primary font-semibold">{i.incident_number}</span> },
    { header: "Title", render: (i) => <span className="font-medium text-text">{i.title}</span> },
    { header: "Host", render: (i) => <span className="font-mono text-xs">{i.host?.hostname ?? "-"}</span> },
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
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
          {i.occurrence}x
        </span>
      ),
    },
    { header: "Status", render: (i) => <StatusBadge status={i.status} /> },
    { header: "Created At", render: (i) => formatDateTime(i.created_at) },
  ];

  if (isLoading && !data) return <Loading label="Loading incidents..." />;
  if (isError) return <ErrorState description="Failed to load incidents from backend." />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-text">Incidents</h1>
          <p className="text-sm text-text-muted">High-priority threats detected and tracked across the fleet</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons data={filtered} filenamePrefix="aegilon_incidents" />
          <SeverityLegend />
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        severity={severity}
        onSeverityChange={setSeverity}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        searchQuery={search}
        onSearchChange={setSearch}
      />

      {/* Data Table */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <DataTable
          columns={columns}
          rows={filtered}
          keyFn={(i) => i.id}
          onRowClick={(i) => router.push(`/incidents/${i.id}`)}
          emptyTitle="No incidents found matching criteria"
        />
        <div className="mt-4">
          <Pagination
            skip={skip}
            limit={LIMIT}
            count={filtered.length}
            onPrev={() => setSkip((s) => Math.max(0, s - LIMIT))}
            onNext={() => setSkip((s) => s + LIMIT)}
          />
        </div>
      </div>
    </div>
  );
}
