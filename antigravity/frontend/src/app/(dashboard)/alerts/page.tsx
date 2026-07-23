"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAlerts } from "@/services/alerts";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SeverityBadge, StatusBadge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { SeverityLegend } from "@/components/ui/SeverityLegend";
import { FilterBar } from "@/components/ui/FilterBar";
import { EventDetailsModal } from "@/components/ui/EventDetailsModal";
import { formatDateTime } from "@/utils/format";
import type { Alert } from "@/types";

import { ExportButtons } from "@/components/ui/ExportButtons";

const LIMIT = 25;

export default function AlertsPage() {
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("ALL");
  const [timeRange, setTimeRange] = useState(0); // in minutes
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["alerts", skip, severity, timeRange],
    queryFn: () => getAlerts(skip, LIMIT, severity, timeRange),
  });

  const filtered = (data ?? []).filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      (a.host?.hostname ?? "").toLowerCase().includes(q) ||
      (a.rule?.name ?? "").toLowerCase().includes(q)
    );
  });

  const columns: Column<Alert>[] = [
    { header: "Rule / Title", render: (a) => <span className="font-medium text-text">{a.rule?.name ?? a.title}</span> },
    { header: "Host", render: (a) => <span className="font-mono text-xs">{a.host?.hostname ?? "-"}</span> },
    { header: "Wazuh Level", render: (a) => <span className="font-mono text-xs text-primary font-semibold">L{a.wazuh_level}</span> },
    { header: "Severity", render: (a) => <SeverityBadge severity={a.severity} /> },
    { header: "Status", render: (a) => <StatusBadge status={a.status} /> },
    { header: "Timestamp", render: (a) => formatDateTime(a.created_at) },
    {
      header: "Action",
      render: (a) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedAlert(a);
          }}
          className="rounded px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors border border-primary/20"
        >
          Inspect Log
        </button>
      ),
    },
  ];

  if (isLoading) return <Loading label="Loading alerts..." />;
  if (isError) return <ErrorState description="Failed to load alerts from backend." />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-text">Alerts</h1>
          <p className="text-sm text-text-muted">Real-time detection events synced from Wazuh engine</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons data={filtered} filenamePrefix="aegilon_alerts" />
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
          keyFn={(a) => a.id}
          onRowClick={(a) => setSelectedAlert(a)}
          emptyTitle="No alerts found matching filter criteria"
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

      {/* Event Details Drawer Modal */}
      {selectedAlert && (
        <EventDetailsModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}
    </div>
  );
}
