"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getResponse } from "@/services/responses";
import { Card, CardHeader } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/utils/format";

export default function ResponseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["response", params.id],
    queryFn: () => getResponse(params.id),
  });

  if (isLoading) return <Loading label="Loading response..." />;
  if (isError || !response) return <ErrorState description="Response not found." />;

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => router.push("/responses")}>
        <ArrowLeft size={15} /> Back to Responses
      </Button>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold text-text">{response.action}</h1>
        <StatusBadge status={response.status} />
      </div>

      <Card>
        <CardHeader title="Information" />
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-text-muted">Incident</dt>
            <dd className="mt-1">
              <button
                onClick={() => router.push(`/incidents/${response.incident_id}`)}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {response.incident_id.slice(0, 8)}... <ExternalLink size={12} />
              </button>
            </dd>
          </div>
          <Info label="Action" value={response.action} />
          <Info label="Status" value={<StatusBadge status={response.status} />} />
          <Info label="Executed At" value={formatDateTime(response.executed_at)} />
        </dl>
        <div className="mt-4">
          <dt className="text-xs text-text-muted">Output</dt>
          <dd className="mt-1 rounded-lg bg-background p-3 text-sm text-text-muted">
            {response.message ?? "No output recorded."}
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
