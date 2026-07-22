"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getHost } from "@/services/hosts";
import { getIncidents } from "@/services/incidents";
import { getAlerts } from "@/services/alerts";
import { Card, CardHeader } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge, SeverityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/utils/format";

export default function HostDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const hostQuery = useQuery({
    queryKey: ["host", params.id],
    queryFn: () => getHost(params.id),
  });

  const incidentsQuery = useQuery({
    queryKey: ["incidents", "byHost", hostQuery.data?.hostname],
    queryFn: () => getIncidents({ host_name: hostQuery.data!.hostname, limit: 50 }),
    enabled: !!hostQuery.data,
  });

  const alertsQuery = useQuery({
    queryKey: ["alerts", "all-for-host"],
    queryFn: () => getAlerts(0, 200),
    enabled: !!hostQuery.data,
  });

  if (hostQuery.isLoading) return <Loading label="Loading host..." />;
  if (hostQuery.isError || !hostQuery.data) {
    return <ErrorState description="Host not found." />;
  }

  const host = hostQuery.data;
  const hostAlerts = (alertsQuery.data ?? []).filter((a) => a.host_id === host.id);

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => router.push("/hosts")}>
        <ArrowLeft size={15} /> Back to Hosts
      </Button>

      <div>
        <h1 className="text-xl font-semibold text-text">{host.hostname}</h1>
        <p className="text-sm text-text-muted">Agent {host.agent_id}</p>
      </div>

      <Card>
        <CardHeader title="Information" />
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Hostname" value={host.hostname} />
          <Info label="Agent ID" value={host.agent_id} />
          <Info label="Operating System" value={host.operating_system ?? "-"} />
          <Info label="IP Address" value={host.ip_address ?? "-"} />
          <Info label="Status" value={<StatusBadge status={host.status} />} />
          <Info label="Last Seen" value={formatDateTime(host.last_seen)} />
        </dl>
      </Card>

      <Card>
        <CardHeader title="Incident History" />
        {incidentsQuery.isLoading ? (
          <Loading label="Loading incidents..." />
        ) : (incidentsQuery.data ?? []).length === 0 ? (
          <EmptyState title="No incidents linked to this host" />
        ) : (
          <ul className="divide-y divide-border">
            {incidentsQuery.data!.map((inc) => (
              <li
                key={inc.id}
                onClick={() => router.push(`/incidents/${inc.id}`)}
                className="flex cursor-pointer items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-background/80"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">{inc.title}</p>
                  <p className="text-xs text-text-muted">{inc.incident_number}</p>
                </div>
                <div className="flex gap-2">
                  <SeverityBadge severity={inc.severity} />
                  <StatusBadge status={inc.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Alert History" />
        {alertsQuery.isLoading ? (
          <Loading label="Loading alerts..." />
        ) : hostAlerts.length === 0 ? (
          <EmptyState title="No alerts linked to this host" />
        ) : (
          <ul className="divide-y divide-border">
            {hostAlerts.slice(0, 20).map((alert) => (
              <li
                key={alert.id}
                onClick={() => router.push(`/alerts/${alert.id}`)}
                className="flex cursor-pointer items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-background/80"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">{alert.title}</p>
                  <p className="text-xs text-text-muted">{formatDateTime(alert.created_at)}</p>
                </div>
                <SeverityBadge severity={alert.severity} />
              </li>
            ))}
          </ul>
        )}
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
