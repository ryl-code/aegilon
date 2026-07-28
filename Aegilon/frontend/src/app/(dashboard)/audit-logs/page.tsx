"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScrollText } from "lucide-react";
import { getAuditLogs } from "@/services/audit";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchBox } from "@/components/ui/SearchBox";
import { Pagination } from "@/components/ui/Pagination";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader, PageCard } from "@/components/ui/PageHeader";
import { ExportButtons } from "@/components/ui/ExportButtons";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDateTime } from "@/utils/format";
import type { AuditLog } from "@/types";

const LIMIT = 5;

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
    { header: "User", render: (l) => <span className="font-semibold text-text">{l.user?.name ?? l.user?.email ?? l.user_id.slice(0, 8)}</span> },
    { header: "Action", render: (l) => <span className="font-mono text-xs text-primary font-bold">{l.action}</span> },
    { header: "Resource", render: (l) => <span className="text-text-muted text-xs">{l.resource}</span> },
    { header: "IP Address", render: (l) => <span className="font-mono text-xs text-text-muted">{l.ip_address ?? "-"}</span> },
    { header: "Timestamp", render: (l) => <span className="text-text-muted text-xs">{formatDateTime(l.created_at)}</span> },
  ];

  if (isLoading) return <Loading label="Loading audit logs..." />;
  if (isError) return <ErrorState description="Failed to load audit logs from backend." />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit Trails"
        description="Complete security analyst action logging and governance activity"
        badge="Compliance Audit"
        badgeIcon={<ScrollText size={13} />}
        actions={
          <div className="flex items-center gap-2">
            <ExportButtons data={filtered} filenamePrefix="aegilon_audit_logs" />
            <SearchBox value={search} onChange={setSearch} placeholder="Search user, action, resource..." />
          </div>
        }
      />

      <PageCard noPadding>
        <div className="p-5">
          <DataTable columns={columns} rows={filtered} keyFn={(l) => l.id} emptyTitle="No audit logs found" />
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
