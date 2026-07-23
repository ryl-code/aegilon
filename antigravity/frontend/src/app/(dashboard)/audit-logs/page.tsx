"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/services/audit";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchBox } from "@/components/ui/SearchBox";
import { Pagination } from "@/components/ui/Pagination";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDateTime } from "@/utils/format";
import { ExportButtons } from "@/components/ui/ExportButtons";
import type { AuditLog } from "@/types";

const LIMIT = 25;

export default function AuditLogsPage() {
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["audit-logs", skip],
    queryFn: () => getAuditLogs(skip, LIMIT),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!debouncedSearch) return data;
    const q = debouncedSearch.toLowerCase();
    return data.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        l.resource.toLowerCase().includes(q) ||
        (l.user?.name ?? "").toLowerCase().includes(q)
    );
  }, [data, debouncedSearch]);

  const columns: Column<AuditLog>[] = [
    { header: "User", render: (l) => l.user?.name ?? l.user?.email ?? l.user_id.slice(0, 8) },
    { header: "Action", render: (l) => l.action },
    { header: "Resource", render: (l) => <span className="text-text-muted">{l.resource}</span> },
    { header: "IP Address", render: (l) => l.ip_address ?? "-" },
    { header: "Timestamp", render: (l) => formatDateTime(l.created_at) },
  ];

  if (isLoading) return <Loading label="Loading audit logs..." />;
  if (isError) return <ErrorState description="Failed to load audit logs from backend." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-text">Audit Logs</h1>
          <p className="text-sm text-text-muted">Analyst activity across the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons data={filtered} filenamePrefix="aegilon_audit_logs" />
          <SearchBox value={search} onChange={setSearch} placeholder="Search user, action, resource..." />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <DataTable columns={columns} rows={filtered} keyFn={(l) => l.id} emptyTitle="No audit logs found" />
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
