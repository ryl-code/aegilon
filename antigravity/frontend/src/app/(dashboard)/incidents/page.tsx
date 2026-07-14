"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getIncidents } from "@/services/incidents";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchBox } from "@/components/ui/SearchBox";
import { Select } from "@/components/ui/Select";
import { SeverityBadge, StatusBadge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDateTime } from "@/utils/format";
import type { Incident } from "@/types";

const LIMIT = 25;
const SEVERITIES = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["Open", "Investigating", "Contained", "Resolved", "Closed", "False Positive", "Ignored"];

export default function IncidentsPage() {
  const router = useRouter();
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["incidents", skip, severity, status, debouncedSearch],
    queryFn: () =>
      getIncidents({
        skip,
        limit: LIMIT,
        severity: severity || undefined,
        status: status || undefined,
        incident_number: debouncedSearch || undefined,
      }),
  });

  const columns: Column<Incident>[] = [
    { header: "Incident Number", render: (i) => <span className="font-mono text-xs">{i.incident_number}</span> },
    { header: "Title", render: (i) => i.title },
    { header: "Severity", render: (i) => <SeverityBadge severity={i.severity} /> },
    { header: "Risk Score", render: (i) => i.risk_score ?? "-" },
    { header: "Occurrence", render: (i) => i.occurrence },
    { header: "Status", render: (i) => <StatusBadge status={i.status} /> },
    { header: "Created At", render: (i) => formatDateTime(i.created_at) },
  ];

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!debouncedSearch) return data;
    return data.filter(
      (i) =>
        i.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        i.incident_number.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [data, debouncedSearch]);

  if (isLoading) return <Loading label="Loading incidents..." />;
  if (isError) return <ErrorState description="Failed to load incidents from backend." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-text">Incidents</h1>
          <p className="text-sm text-text-muted">Threats detected and tracked across the fleet</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SearchBox value={search} onChange={setSearch} placeholder="Search title or number..." />
          <Select value={severity} onChange={setSeverity} options={SEVERITIES} placeholder="All severities" />
          <Select value={status} onChange={setStatus} options={STATUSES} placeholder="All statuses" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <DataTable
          columns={columns}
          rows={filtered}
          keyFn={(i) => i.id}
          onRowClick={(i) => router.push(`/incidents/${i.id}`)}
          emptyTitle="No incidents found"
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
