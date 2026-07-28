"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getResponse, updateResponseStatus } from "@/services/responses";
import { Card, CardHeader } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { ResponseStatusBadge } from "@/components/ui/ResponseStatusBadge";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/utils/format";

export default function ResponseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["response", params.id],
    queryFn: () => getResponse(params.id),
  });

  const statusMutation = useMutation({
    mutationFn: (payload: { status: string; message?: string }) =>
      updateResponseStatus(params.id, payload.status, payload.message),
    onSuccess: (data) => {
      toast.success(`Response action marked as ${data.status}`);
      queryClient.invalidateQueries({ queryKey: ["response", params.id] });
      queryClient.invalidateQueries({ queryKey: ["responses"] });
    },
    onError: () => toast.error("Failed to update response status"),
  });

  if (isLoading) return <Loading label="Loading response details..." />;
  if (isError || !response) return <ErrorState description="Response action record not found." />;

  const isPending =
    response.status.toLowerCase() === "pending" ||
    response.status.toLowerCase() === "pending approval";

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => router.push("/responses")}>
        <ArrowLeft size={15} /> Back to Responses
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text">{response.action}</h1>
          <p className="text-xs text-text-muted">Response Action ID: <span className="font-mono">{response.id}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <ResponseStatusBadge status={response.status} />

          {isPending && (
            <div className="flex gap-2">
              <button
                onClick={() =>
                  statusMutation.mutate({
                    status: "success",
                    message: "Approved and executed by SOC analyst.",
                  })
                }
                disabled={statusMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow"
              >
                <CheckCircle size={14} /> Approve & Execute Action
              </button>
              <button
                onClick={() =>
                  statusMutation.mutate({
                    status: "rejected",
                    message: "Dismissed by SOC analyst as non-threat.",
                  })
                }
                disabled={statusMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-surface-hover border border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text transition-colors"
              >
                <XCircle size={14} /> Reject & Dismiss
              </button>
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader title="Action Information & Audit Trail" />
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-text-muted">Target Incident</dt>
            <dd className="mt-1">
              <button
                onClick={() => router.push(`/incidents/${response.incident_id}`)}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {response.incident_id.slice(0, 8)}... <ExternalLink size={12} />
              </button>
            </dd>
          </div>
          <Info label="Action Type" value={response.action} />
          <Info label="Lifecycle Status" value={<ResponseStatusBadge status={response.status} />} />
          <Info label="Executed At" value={formatDateTime(response.executed_at)} />
        </dl>
        <div className="mt-4">
          <dt className="text-xs text-text-muted">Audit Output / Execution Log Message</dt>
          <dd className="mt-1 rounded-lg bg-background p-3 text-sm text-text-muted font-mono border border-border">
            {response.message ?? "No audit message recorded."}
          </dd>
        </div>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-text">{value}</dd>
    </div>
  );
}
