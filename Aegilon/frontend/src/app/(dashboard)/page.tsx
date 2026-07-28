"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Server, ShieldAlert, Flame, AlertOctagon, Zap, Play, Download, CheckCircle2, ArrowRight } from "lucide-react";
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
import { getUnprocessedAlerts, runDetectionEngine } from "@/services/alerts";
import { RealtimeAlertBanner } from "@/components/ui/RealtimeAlertBanner";
import { MitreHeatmap } from "@/components/charts/MitreHeatmap";
import { toast } from "sonner";
import Link from "next/link";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [timeWindow, setTimeWindow] = useState<"24h" | "7d" | "all">("all");

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

  const triggerDetectionMutation = useMutation({
    mutationFn: runDetectionEngine,
    onSuccess: (data) => {
      toast.success(data.message || "Detection engine executed successfully");
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to run detection engine");
    },
  });

  const isInitialLoading =
    (statsQuery.isLoading && !statsQuery.data) ||
    (responsesQuery.isLoading && !responsesQuery.data) ||
    (hostsQuery.isLoading && !hostsQuery.data) ||
    (unprocessedQuery.isLoading && !unprocessedQuery.data);

  const stats = statsQuery.data;
  const responsesToday = (responsesQuery.data ?? []).filter((r) => isToday(r.executed_at)).length;

  const totalHosts = hostsQuery.data?.length ?? 0;
  const activeAlertsCount = unprocessedQuery.data?.length ?? 0;
  const openIncidentsCount = stats?.open_incidents ?? 0;
  const criticalIncidentsCount = stats?.critical_incidents ?? 0;

  const dynamicHealth = Math.max(100 - (criticalIncidentsCount * 6.0) - (openIncidentsCount * 2.0), 65.0).toFixed(1);
  const agentLoad = Math.min(Math.round((activeAlertsCount / Math.max(totalHosts, 1)) * 20 + 25), 100);
  const slaCompliance = Math.min(Math.round(100 - (openIncidentsCount * 2.5)), 100);

  const hourlyData = stats?.trend_data?.hourlyData || [];
  const dailyData = stats?.trend_data?.dailyData || [];
  const monthlyData = stats?.trend_data?.monthlyData || [];

  if (isInitialLoading) return <Loading label="Loading dashboard from database..." />;

  if (statsQuery.isError) {
    return <ErrorState description="Failed to load incident statistics from the backend database." />;
  }

  const handleExportSummary = () => {
    const summaryData = {
      system_health: `${dynamicHealth}%`,
      total_hosts: totalHosts,
      active_alerts: activeAlertsCount,
      open_incidents: openIncidentsCount,
      critical_incidents: criticalIncidentsCount,
      responses_today: responsesToday,
      top_rules: stats?.most_triggered_rules ?? [],
      generated_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(summaryData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aegilon_executive_summary_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    toast.success("Executive summary JSON report exported successfully");
  };

  return (
    <div className="space-y-6">
      {/* Header Bar matching Screenshot 'My Drive' */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2.5">
            Security Operations Drive
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <ShieldAlert className="h-4 w-4" />
            </span>
          </h1>
          <p className="text-xs text-text-muted mt-1">Real-time database-connected telemetry and threat response dashboard.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => triggerDetectionMutation.mutate()}
            disabled={triggerDetectionMutation.isPending}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {triggerDetectionMutation.isPending ? "Running Detection..." : "Run Detection Engine"}
          </button>

          <button
            onClick={handleExportSummary}
            className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-text hover:bg-surface-hover transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export Executive Report
          </button>

          <div className="flex items-center gap-1.5 rounded-full bg-surface p-1 border border-border text-xs shadow-xs">
            <Link href="/" className="rounded-full bg-primary/10 px-3.5 py-1.5 font-bold text-primary border border-primary/20">Overview</Link>
            <Link href="/playbooks" className="rounded-full px-3.5 py-1.5 font-semibold text-emerald-600 hover:text-emerald-700">SOAR Playbooks</Link>
            <Link href="/hosts" className="rounded-full px-3.5 py-1.5 font-semibold text-text-muted hover:text-text">Hosts</Link>
            <Link href="/iso-standards" className="rounded-full px-3.5 py-1.5 font-semibold text-primary/80 hover:text-primary">ISO Standards</Link>
          </div>
        </div>
      </div>

      <RealtimeAlertBanner />

      {/* QUICK ACCESS Section matching Screenshot */}
      <div>
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-text-muted mb-3.5">
          QUICK ACCESS
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Active Alerts Stream"
            value={activeAlertsCount}
            icon={ShieldAlert}
            isActive={true}
            subtext="Requires Immediate Triage"
          />
          <StatCard
            label="Open Incidents Vault"
            value={openIncidentsCount}
            icon={Flame}
            isActive={false}
            subtext={`${criticalIncidentsCount} Critical Severity`}
          />
          <StatCard
            label="Monitored Hosts"
            value={totalHosts}
            icon={Server}
            isActive={false}
            subtext="Active Defense Agents"
          />
          <StatCard
            label="Mitigation Responses"
            value={responsesToday}
            icon={Zap}
            isActive={false}
            subtext="Actions Executed Today"
          />
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card className="relative overflow-hidden bg-gradient-to-br from-surface to-surface-secondary">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-primary/10 blur-xl" />
            <p className="text-xs font-extrabold text-text-muted uppercase tracking-wider">System Posture Health</p>
            <p className="mt-2 text-3xl font-bold text-text">{dynamicHealth}%</p>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold">
              <span className="text-text-muted">Agent Defense Load</span>
              <span className="text-primary">{agentLoad}%</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-border overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${agentLoad}%` }} />
            </div>
            
            <div className="mt-6 pt-4 border-t border-border/50">
              <div className="flex justify-between text-xs text-text-muted mb-2 font-semibold">
                <span>Mitigation SLA Compliance</span>
                <span className="text-text">{slaCompliance}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                <div className="h-full bg-success rounded-full" style={{ width: `${slaCompliance}%` }} />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Tactical Attack Structure" />
            <TacticsRadar categoryCounts={stats?.category_counts} />
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Threat Activity Comparison" />
            <div className="mt-2">
              <ThreatAreaChart
                hourlyData={hourlyData}
                dailyData={dailyData}
                monthlyData={monthlyData}
              />
            </div>
          </Card>
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

      <Card>
        <MitreHeatmap categoryCounts={stats?.category_counts} />
      </Card>

      {/* ALL SECURITY EVENTS Table View matching Screenshot 'ALL FILES' */}
      <Card>
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-text">
              ALL SECURITY EVENTS &amp; INCIDENTS
            </h2>
            <p className="text-xs text-text-muted">Live audit records of recent security threats and incidents</p>
          </div>
          <Link href="/incidents" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
            View All Vault <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentIncidentsQuery.isLoading ? (
          <Loading label="Loading incidents..." />
        ) : (recentIncidentsQuery.data ?? []).length === 0 ? (
          <EmptyState title="No incidents recorded yet" />
        ) : (
          <div className="table-scroll">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-bold text-text-muted">
                  <th className="py-2.5 px-3">INCIDENT / THREAT NAME</th>
                  <th className="py-2.5 px-3">AFFECTED HOST</th>
                  <th className="py-2.5 px-3">LAST MODIFIED</th>
                  <th className="py-2.5 px-3">SEVERITY / STATUS</th>
                  <th className="py-2.5 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {(recentIncidentsQuery.data ?? []).map((inc) => (
                  <tr key={inc.id} className="hover:bg-surface-hover transition-colors">
                    <td className="py-3 px-3">
                      <Link href={`/incidents/${inc.id}`} className="font-semibold text-text hover:text-primary transition-colors flex items-center gap-2">
                        <Flame className="h-3.5 w-3.5 text-danger shrink-0" />
                        {inc.title}
                      </Link>
                      <span className="text-[10px] text-text-muted font-mono">{inc.incident_number}</span>
                    </td>
                    <td className="py-3 px-3 font-medium text-text">
                      {inc.host?.hostname ?? "Endpoint Agent"}
                    </td>
                    <td className="py-3 px-3 text-text-muted font-medium">
                      {formatRelative(inc.created_at)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <SeverityBadge severity={inc.severity} />
                        <StatusBadge status={inc.status} />
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link href={`/incidents/${inc.id}`} className="inline-flex items-center justify-center rounded-lg bg-surface-secondary px-2.5 py-1 text-[11px] font-semibold text-primary border border-border hover:bg-primary hover:text-white transition-all">
                        Details &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
