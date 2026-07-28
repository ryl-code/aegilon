"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Zap, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { getResponses, createResponse } from "@/services/responses";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { SearchBox } from "@/components/ui/SearchBox";
import { Select } from "@/components/ui/Select";
import { ResponseStatusBadge } from "@/components/ui/ResponseStatusBadge";
import { ResponseActionModal } from "@/components/ui/ResponseActionModal";
import { Pagination } from "@/components/ui/Pagination";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader, PageCard } from "@/components/ui/PageHeader";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDateTime } from "@/utils/format";
import type { ResponseAction } from "@/types";

const LIMIT = 25;

export default function ResponsesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedActionToTrigger, setSelectedActionToTrigger] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["responses", skip],
    queryFn: () => getResponses(skip, LIMIT),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { action: string; message: string }) =>
      createResponse({
        incident_id: "00000000-0000-0000-0000-000000000000",
        action: payload.action,
        status: "executed",
        message: payload.message || `Automated execution completed for action: ${payload.action}`,
      }),
    onSuccess: () => {
      toast.success("Response action executed successfully");
      queryClient.invalidateQueries({ queryKey: ["responses"] });
    },
    onError: () => toast.error("Failed to execute response action"),
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
    { header: "Action", render: (r) => <span className="font-semibold text-text">{r.action}</span> },
    { header: "Status", render: (r) => <ResponseStatusBadge status={r.status} /> },
    { header: "Audit / Output Message", render: (r) => <span className="text-text-muted text-xs">{r.message ?? "-"}</span> },
    { header: "Executed At", render: (r) => <span className="text-text-muted text-xs">{formatDateTime(r.executed_at)}</span> },
  ];

  if (isLoading && !data) return <Loading label="Loading responses..." />;
  if (isError) return <ErrorState description="Failed to load responses from backend." />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Response Actions"
        description="Automated and manual active remediation action lifecycle"
        badge="Active Defense"
        badgeIcon={<Zap size={13} />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <SearchBox value={search} onChange={setSearch} placeholder="Search action..." />
            <Select value={status} onChange={setStatus} options={statusOptions} placeholder="All statuses" />
            <button
              onClick={() => setSelectedActionToTrigger("Isolate Host")}
              className="flex items-center gap-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-bold shadow transition-all duration-150"
            >
              <ShieldAlert size={14} /> + Isolate Host
            </button>
          </div>
        }
      />

      <PageCard noPadding>
        <div className="p-5">
          <DataTable
            columns={columns}
            rows={filtered}
            keyFn={(r) => r.id}
            onRowClick={(r) => router.push(`/responses/${r.id}`)}
            emptyTitle="No response actions found"
          />
        </div>
        <div className="px-5 pb-4 border-t border-border/40 pt-3">
          <Pagination
            skip={skip}
            limit={LIMIT}
            count={data?.length ?? 0}
            onPrev={() => setSkip((s) => Math.max(0, s - LIMIT))}
            onNext={() => setSkip((s) => s + LIMIT)}
          />
        </div>
      </PageCard>

      {selectedActionToTrigger && (
        <ResponseActionModal
          actionName={selectedActionToTrigger}
          targetHost="WIN-HOST-01"
          onClose={() => setSelectedActionToTrigger(null)}
          onConfirm={async (notes) => {
            await createMutation.mutateAsync({
              action: selectedActionToTrigger,
              message: notes,
            });
          }}
        />
      )}
    </div>
  );
}
