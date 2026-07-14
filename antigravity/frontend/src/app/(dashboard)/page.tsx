"use client";

import { useQuery } from "@tanstack/react-query";
import { Server, ShieldAlert, Flame, AlertOctagon, Zap } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { SeverityDonut } from "@/components/charts/SeverityDonut";
import { TopBarList } from "@/components/charts/TopBarList";
import { StatusBadge, SeverityBadge } from "@/components/ui/Badge";
import { formatRelative, isToday } from "@/utils/format";
import { getIncidents, getIncidentStats } from "@/services/incidents";
import { getResponses } from "@/services/responses";
import { getHosts } from "@/services/hosts";
import { getUnprocessedAlerts } from "@/services/alerts";

export default function DashboardPage() {
  const statsQuery = useQuery({ queryKey: ["incidents", "stats"], queryFn: getIncidentStats });
  const recentIncidentsQuery = useQuery({
    queryKey: ["incidents", "recent"],
    queryFn: () => getIncidents({ limit: 5 }),
  });
  const responsesQuery = useQuery({ queryKey: ["responses", "dash"], queryFn: () => getResponses(0, 20) });
  const hostsQuery = useQuery({ queryKey: ["hosts", "dash"], queryFn: () => getHosts(0, 100) });
  const unprocessedQuery = useQuery({
    queryKey: ["alerts", "unprocessed", "dash"],
    queryFn: () => getUnprocessedAlerts(0, 100),
  });

  const isLoading =
    statsQuery.isLoading ||
    responsesQuery.isLoading;

  if (isLoading) return <Loading label="Loading dashboard..." />;

  if (statsQuery.isError) {
    return <ErrorState description="Failed to load incident statistics from the backend." />;
  }

  const stats = statsQuery.data;
  const responsesToday = (responsesQuery.data ?? []).filter((r) => isToday(r.executed_at)).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Dashboard</h1>
        <p className="text-sm text-text-muted">Real-time overview of the AEGILON XDR platform.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total Hosts" value={hostsQuery.data?.length ?? 0} icon={Server} tone="primary" />
        <StatCard
          label="Active Alerts"
          value={unprocessedQuery.data?.length ?? 0}
          icon={ShieldAlert}
          tone="warning"
        />
        <StatCard
          label="Open Incidents"
          value={stats?.open_incidents ?? 0}
          icon={Flame}
          tone="danger"
        />
        <StatCard
          label="Critical Incidents"
          value={stats?.critical_incidents ?? 0}
          icon={AlertOctagon}
          tone="critical"
        />
        <StatCard label="Responses Today" value={responsesToday} icon={Zap} tone="success" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Severity Distribution" />
          <SeverityDonut data={stats?.severity_counts ?? {}} />
        </Card>
        <Card>
          <CardHeader title="Top Triggered Rules" />
          <TopBarList
            items={stats?.most_triggered_rules ?? []}
            labelKey="rule_name"
            valueKey="count"
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Top Affected Hosts" />
          <TopBarList
            items={stats?.top_affected_hosts ?? []}
            labelKey="host_name"
            valueKey="count"
          />
        </Card>

        <Card>
          <CardHeader title="Recent Incidents" />
          {recentIncidentsQuery.isLoading ? (
            <Loading label="Loading incidents..." />
          ) : (recentIncidentsQuery.data ?? []).length === 0 ? (
            <EmptyState title="No incidents yet" />
          ) : (
            <ul className="divide-y divide-border">
              {recentIncidentsQuery.data!.map((inc) => (
                <li key={inc.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">{inc.title}</p>
                    <p className="text-xs text-text-muted">
                      {inc.incident_number} &middot; {formatRelative(inc.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <SeverityBadge severity={inc.severity} />
                    <StatusBadge status={inc.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent Responses" />
        {(responsesQuery.data ?? []).length === 0 ? (
          <EmptyState title="No response actions yet" />
        ) : (
          <ul className="divide-y divide-border">
            {responsesQuery
              .data!.slice()
              .sort((a, b) => new Date(b.executed_at).getTime() - new Date(a.executed_at).getTime())
              .slice(0, 5)
              .map((res) => (
                <li key={res.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">{res.action}</p>
                    <p className="text-xs text-text-muted">{formatRelative(res.executed_at)}</p>
                  </div>
                  <StatusBadge status={res.status} />
                </li>
              ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
