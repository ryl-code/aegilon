"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getHosts } from "@/services/hosts";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchBox } from "@/components/ui/SearchBox";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/Badge";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDateTime } from "@/utils/format";
import type { Host } from "@/types";

export default function HostsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["hosts"],
    queryFn: () => getHosts(0, 200),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((h) => {
      const matchSearch = debouncedSearch
        ? h.hostname.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          (h.ip_address ?? "").includes(debouncedSearch)
        : true;
      const matchStatus = status ? h.status === status : true;
      return matchSearch && matchStatus;
    });
  }, [data, debouncedSearch, status]);

  const statusOptions = useMemo(
    () => Array.from(new Set((data ?? []).map((h) => h.status))),
    [data]
  );

  const columns: Column<Host>[] = [
    { header: "Hostname", render: (h) => <span className="font-medium text-text">{h.hostname}</span> },
    { header: "IP Address", render: (h) => <span className="font-mono text-xs">{h.ip_address ?? "-"}</span> },
    { header: "Operating System", render: (h) => h.operating_system ?? "-" },
    {
      header: "CIS Benchmark Score",
      render: (h) => (
        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
          32% (127 Passed / 260 Failed)
        </span>
      ),
    },
    { header: "Status", render: (h) => <StatusBadge status={h.status} /> },
    { header: "Last Seen", render: (h) => formatDateTime(h.last_seen) },
  ];

  if (isLoading && !data) return <Loading label="Loading hosts..." />;
  if (isError) return <ErrorState description="Failed to load hosts from backend." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-text">Hosts</h1>
          <p className="text-sm text-text-muted">{filtered.length} endpoints registered</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SearchBox value={search} onChange={setSearch} placeholder="Search hostname or IP..." />
          <Select value={status} onChange={setStatus} options={statusOptions} placeholder="All statuses" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <DataTable
          columns={columns}
          rows={filtered}
          keyFn={(h) => h.id}
          onRowClick={(h) => router.push(`/hosts/${h.id}`)}
          emptyTitle="No hosts found"
          emptyDescription="Hosts appear automatically once Wazuh sends telemetry."
        />
      </div>
    </div>
  );
}
