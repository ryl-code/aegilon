"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Server } from "lucide-react";
import { getHosts } from "@/services/hosts";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchBox } from "@/components/ui/SearchBox";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/Badge";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader, PageCard } from "@/components/ui/PageHeader";
import { ExportButtons } from "@/components/ui/ExportButtons";
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

  const fetchAllForExport = async () => {
    return await getHosts(0, 10000);
  };

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
    { header: "Hostname", render: (h) => <span className="font-semibold text-text">{h.hostname}</span> },
    { header: "IP Address", render: (h) => <span className="font-mono text-xs text-text-muted">{h.ip_address ?? "-"}</span> },
    { header: "Operating System", render: (h) => <span className="text-text-muted">{h.operating_system ?? "-"}</span> },
    {
      header: "CIS Benchmark Score",
      render: () => (
        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20">
          32% (127 Passed / 260 Failed)
        </span>
      ),
    },
    { header: "Status", render: (h) => <StatusBadge status={h.status} /> },
    { header: "Last Seen", render: (h) => <span className="text-text-muted text-xs">{formatDateTime(h.last_seen)}</span> },
  ];

  if (isLoading && !data) return <Loading label="Loading hosts..." />;
  if (isError) return <ErrorState description="Failed to load hosts from backend." />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Computers & Hosts"
        description={`${filtered.length} monitored endpoints sending telemetry to Wazuh engine`}
        badge="Asset Intelligence"
        badgeIcon={<Server size={13} />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ExportButtons
              data={filtered}
              filenamePrefix="aegilon_hosts"
              title="AEGILON XDR Monitored Hosts Report"
              onFetchAllData={fetchAllForExport}
            />
            <SearchBox value={search} onChange={setSearch} placeholder="Search hostname or IP..." />
            <Select value={status} onChange={setStatus} options={statusOptions} placeholder="All statuses" />
          </div>
        }
      />

      <PageCard noPadding>
        <div className="p-5">
          <DataTable
            columns={columns}
            rows={filtered}
            keyFn={(h) => h.id}
            onRowClick={(h) => router.push(`/hosts/${h.id}`)}
            emptyTitle="No hosts found"
            emptyDescription="Hosts appear automatically once Wazuh sends telemetry."
          />
        </div>
      </PageCard>
    </div>
  );
}
