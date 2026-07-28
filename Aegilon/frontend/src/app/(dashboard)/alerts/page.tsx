"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";
import { getAlerts } from "@/services/alerts";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SeverityBadge, StatusBadge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { SeverityLegend } from "@/components/ui/SeverityLegend";
import { FilterBar } from "@/components/ui/FilterBar";
import { EventDetailsModal } from "@/components/ui/EventDetailsModal";
import { PageHeader, PageCard } from "@/components/ui/PageHeader";
import { ExportButtons } from "@/components/ui/ExportButtons";
import { formatDateTime } from "@/utils/format";
import type { Alert } from "@/types";

const LIMIT = 25;

export default function AlertsPage() {
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("ALL");
  const [timeRange, setTimeRange] = useState(0);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["alerts", skip, severity, timeRange],
    queryFn: () => getAlerts(skip, LIMIT, severity, timeRange),
  });

  const fetchAllForExport = async () => {
    return await getAlerts(0, 10000, severity, timeRange);
  };

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
    { header: "Host", render: (a) => <span className="font-mono text-xs text-text-muted">{a.host?.hostname ?? "-"}</span> },
    { header: "Wazuh Level", render: (a) => <span className="font-mono text-xs text-primary font-bold">L{a.wazuh_level}</span> },
    { header: "Severity", render: (a) => <SeverityBadge severity={a.severity} /> },
    { header: "Status", render: (a) => <StatusBadge status={a.status} /> },
    { header: "Timestamp", render: (a) => <span className="text-text-muted text-xs">{formatDateTime(a.created_at)}</span> },
    {
      header: "Action",
      render: (a) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedAlert(a); }}
          className="rounded-lg px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors border border-primary/20"
        >
          Inspect Log
        </button>
      ),
    },
  ];

  if (isLoading && !data) return <Loading label="Loading alerts..." />;
  if (isError) return <ErrorState description="Failed to load alerts from backend." />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Alerts Stream"
        description="Real-time detection events synced from the Wazuh engine"
        badge="Detection Events"
        badgeIcon={<ShieldAlert size={13} />}
        actions={
          <>
            <ExportButtons
              data={filtered}
              filenamePrefix="aegilon_alerts"
              title="AEGILON XDR Detection Alerts Stream Report"
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
            keyFn={(a) => a.id}
            onRowClick={(a) => setSelectedAlert(a)}
            emptyTitle="No alerts found matching filter criteria"
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

      {selectedAlert && (
        <EventDetailsModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}
    </div>
  );
}
