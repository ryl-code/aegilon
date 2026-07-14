"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getAlerts } from "@/services/alerts";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchBox } from "@/components/ui/SearchBox";
import { Select } from "@/components/ui/Select";
import { SeverityBadge, StatusBadge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDateTime } from "@/utils/format";
import type { Alert } from "@/types";

const LIMIT = 25;

export default function AlertsPage() {
  const router = useRouter();
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["alerts", skip],
    queryFn: () => getAlerts(skip, LIMIT),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((a) => {
      const matchSearch = debouncedSearch
        ? a.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          (a.host?.hostname ?? "").toLowerCase().includes(debouncedSearch.toLowerCase())
        : true;
      const matchSeverity = severity ? a.severity === severity : true;
      return matchSearch && matchSeverity;
    });
  }, [data, debouncedSearch, severity]);

  const severityOptions = useMemo(
    () => Array.from(new Set((data ?? []).map((a) => a.severity))),
    [data]
  );

  const columns: Column<Alert>[] = [
    { header: "Rule", render: (a) => a.rule?.name ?? a.title },
    { header: "Description", render: (a) => <span className="text-text-muted">{a.description ?? "-"}</span> },
    { header: "Host", render: (a) => a.host?.hostname ?? "-" },
    { header: "Level", render: (a) => a.wazuh_level },
    { header: "Severity", render: (a) => <SeverityBadge severity={a.severity} /> },
    { header: "Status", render: (a) => <StatusBadge status={a.status} /> },
    { header: "Timestamp", render: (a) => formatDateTime(a.created_at) },
  ];

  if (isLoading) return <Loading label="Loading alerts..." />;
  if (isError) return <ErrorState description="Failed to load alerts from backend." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-text">Alerts</h1>
          <p className="text-sm text-text-muted">Raw detections synced from Wazuh</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SearchBox value={search} onChange={setSearch} placeholder="Search rule or host..." />
          <Select value={severity} onChange={setSeverity} options={severityOptions} placeholder="All severities" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <DataTable
          columns={columns}
          rows={filtered}
          keyFn={(a) => a.id}
          onRowClick={(a) => router.push(`/alerts/${a.id}`)}
          emptyTitle="No alerts found"
        />
        <div className="mt-4">
          <Pagination
            skip={skip}
            limit={LIMIT}
            count={data?.length ?? 0}
            onPrev={() => setSkip((s) => Math.max(0, s - LIMIT))}
            onNext={() => setSkip((s) => s + LIMIT)}
          />
        </div>
      </div>
    </div>
  );
}
