"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getResponses } from "@/services/responses";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchBox } from "@/components/ui/SearchBox";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDateTime } from "@/utils/format";
import type { ResponseAction } from "@/types";

const LIMIT = 25;

export default function ResponsesPage() {
  const router = useRouter();
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["responses", skip],
    queryFn: () => getResponses(skip, LIMIT),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((r) => {
      const matchSearch = debouncedSearch
        ? r.action.toLowerCase().includes(debouncedSearch.toLowerCase())
        : true;
      const matchStatus = status ? r.status === status : true;
      return matchSearch && matchStatus;
    });
  }, [data, debouncedSearch, status]);

  const statusOptions = useMemo(
    () => Array.from(new Set((data ?? []).map((r) => r.status))),
    [data]
  );

  const columns: Column<ResponseAction>[] = [
    { header: "Incident", render: (r) => <span className="font-mono text-xs">{r.incident_id.slice(0, 8)}</span> },
    { header: "Action", render: (r) => r.action },
    { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { header: "Output", render: (r) => <span className="text-text-muted">{r.message ?? "-"}</span> },
    { header: "Executed At", render: (r) => formatDateTime(r.executed_at) },
  ];

  if (isLoading) return <Loading label="Loading responses..." />;
  if (isError) return <ErrorState description="Failed to load responses from backend." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-text">Responses</h1>
          <p className="text-sm text-text-muted">Automated and manual remediation actions</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SearchBox value={search} onChange={setSearch} placeholder="Search action..." />
          <Select value={status} onChange={setStatus} options={statusOptions} placeholder="All statuses" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <DataTable
          columns={columns}
          rows={filtered}
          keyFn={(r) => r.id}
          onRowClick={(r) => router.push(`/responses/${r.id}`)}
          emptyTitle="No response actions found"
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
