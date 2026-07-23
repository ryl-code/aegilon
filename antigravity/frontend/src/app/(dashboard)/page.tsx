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
import { ThreatAreaChart } from "@/components/charts/ThreatAreaChart";
import { TacticsRadar } from "@/components/charts/TacticsRadar";
import { StatusBadge, SeverityBadge } from "@/components/ui/Badge";
import { formatRelative, isToday } from "@/utils/format";
import { getIncidents, getIncidentStats } from "@/services/incidents";
import { getResponses } from "@/services/responses";
import { getHosts } from "@/services/hosts";
import { getUnprocessedAlerts } from "@/services/alerts";
import Link from "next/link";

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
    responsesQuery.isLoading ||
    hostsQuery.isLoading ||
    unprocessedQuery.isLoading;

  if (isLoading) return <Loading label="Loading dashboard from database..." />;

  if (statsQuery.isError) {
    return <ErrorState description="Failed to load incident statistics from the backend database." />;
  }

  const stats = statsQuery.data;
  const responsesToday = (responsesQuery.data ?? []).filter((r) => isToday(r.executed_at)).length;

  // Calculated dynamic posture metrics based on database state
  const totalHosts = hostsQuery.data?.length ?? 0;
  const activeAlertsCount = unprocessedQuery.data?.length ?? 0;
  const openIncidentsCount = stats?.open_incidents ?? 0;
  const criticalIncidentsCount = stats?.critical_incidents ?? 0;

  const dynamicHealth = Math.max(100 - (criticalIncidentsCount * 6.0) - (openIncidentsCount * 2.0), 65.0).toFixed(1);
  const agentLoad = Math.min(Math.round((activeAlertsCount / Math.max(totalHosts, 1)) * 20 + 25), 100);
  const slaCompliance = Math.min(Math.round(100 - (openIncidentsCount * 2.5)), 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-text">Dashboard</h1>
          <p className="text-sm text-text-muted">Real-time database-connected metrics of AEGILON XDR.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-surface p-1 border border-border text-xs">
          <Link href="/" className="rounded-md bg-primary/10 px-3 py-1.5 font-medium text-primary border border-primary/20">Overview</Link>
          <Link href="/hosts" className="rounded-md px-3 py-1.5 font-medium text-text-muted hover:text-text">Hosts</Link>
          <Link href="/incidents" className="rounded-md px-3 py-1.5 font-medium text-text-muted hover:text-text">Incidents</Link>
          <Link href="/iso-standards" className="rounded-md px-3 py-1.5 font-medium text-primary/80 hover:text-primary font-semibold">ISO Standards Guide</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total Hosts" value={totalHosts} icon={Server} tone="primary" />
        <StatCard
          label="Active Alerts"
          value={activeAlertsCount}
          icon={ShieldAlert}
          tone="warning"
        />
        <StatCard
          label="Open Incidents"
          value={openIncidentsCount}
          icon={Flame}
          tone="danger"
        />
        <StatCard
          label="Critical Incidents"
          value={criticalIncidentsCount}
          icon={AlertOctagon}
          tone="critical"
        />
        <StatCard label="Responses Today" value={responsesToday} icon={Zap} tone="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - System Overview & Structure */}
        <div className="space-y-6 lg:col-span-1">
          {/* System Health Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-surface to-surface/50">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-primary/10 blur-xl" />
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">System Posture Health</p>
            <p className="mt-2 text-3xl font-bold text-text">{dynamicHealth}%</p>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-text-muted">Agent Defense Load</span>
              <span className="font-semibold text-primary">{agentLoad}%</span>
            </div>
            {/* ProgressBar */}
            <div className="mt-2 h-1.5 w-full rounded-full bg-border overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${agentLoad}%` }} />
            </div>
            
            <div className="mt-6 pt-4 border-t border-border/50">
              <div className="flex justify-between text-xs text-text-muted mb-2">
                <span>Mitigation SLA Compliance</span>
                <span className="font-medium text-text">{slaCompliance}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                <div className="h-full bg-success" style={{ width: `${slaCompliance}%` }} />
              </div>
            </div>
          </Card>

          {/* Threat Structure Radar Chart */}
          <Card>
            <CardHeader title="Tactical Attack Structure" />
            <TacticsRadar categoryCounts={stats?.category_counts} />
          </Card>
        </div>

        {/* Right Columns - Main Analytics */}
        <div className="space-y-6 lg:col-span-2">
          {/* Area Chart: Compare Threats */}
          <Card>
            <CardHeader title="Threat Activity Comparison" />
            <div className="mt-2">
              <ThreatAreaChart />
            </div>
          </Card>

          {/* Severity Donut & Top Rules */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader title="Severity Distribution" />
              <div className="flex justify-center py-2">
                <SeverityDonut data={stats?.severity_counts ?? {}} />
              </div>
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
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Affected Hosts */}
        <Card className="lg:col-span-1">
          <CardHeader title="Top Affected Hosts" />
          <TopBarList
            items={stats?.top_affected_hosts ?? []}
            labelKey="host_name"
            valueKey="count"
          />
        </Card>

        {/* Recent Incidents */}
        <Card className="lg:col-span-2">
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

      {/* Recent Responses */}
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
