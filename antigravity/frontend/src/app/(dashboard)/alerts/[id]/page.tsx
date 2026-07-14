"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getAlert } from "@/services/alerts";
import { Card, CardHeader } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { SeverityBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/utils/format";

export default function AlertDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { data: alert, isLoading, isError } = useQuery({
    queryKey: ["alert", params.id],
    queryFn: () => getAlert(params.id),
  });

  if (isLoading) return <Loading label="Loading alert..." />;
  if (isError || !alert) return <ErrorState description="Alert not found." />;

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => router.push("/alerts")}>
        <ArrowLeft size={15} /> Back to Alerts
      </Button>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold text-text">{alert.title}</h1>
        <SeverityBadge severity={alert.severity} />
        <StatusBadge status={alert.status} />
      </div>

      <Card>
        <CardHeader title="Information" />
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Rule" value={alert.rule?.name ?? "-"} />
          <Info label="Host" value={alert.host?.hostname ?? "-"} />
          <Info label="Timestamp" value={formatDateTime(alert.created_at)} />
          <Info label="Wazuh Level" value={String(alert.wazuh_level)} />
          <Info label="Severity" value={<SeverityBadge severity={alert.severity} />} />
          <Info label="Description" value={alert.description ?? "-"} />
        </dl>
      </Card>

      <Card>
        <CardHeader title="Raw Log (Evidence)" />
        <pre className="max-h-96 overflow-auto rounded-lg bg-background p-4 text-xs text-text-muted">
          {JSON.stringify(alert.raw_log, null, 2)}
        </pre>
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
