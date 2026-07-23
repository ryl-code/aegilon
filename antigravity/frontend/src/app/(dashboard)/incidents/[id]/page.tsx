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
        <Card>
          <CardHeader title="Evidence" />
          {evidenceQuery.isLoading ? (
            <Loading label="Loading evidence..." />
          ) : (evidenceQuery.data ?? []).length === 0 ? (
            <EmptyState title="No evidence linked yet" />
          ) : (
            <ul className="divide-y divide-border">
              {evidenceQuery.data!.map((link) => (
                <li
                  key={link.id}
                  onClick={() => link.alert_id && router.push(`/alerts/${link.alert_id}`)}
                  className="flex cursor-pointer items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-background/80"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">
                      {link.alert?.title ?? link.alert_id}
                    </p>
                    <p className="text-xs text-text-muted">{formatDateTime(link.created_at)}</p>
                  </div>
                  {link.alert?.severity && <SeverityBadge severity={link.alert.severity} />}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === "History" && (
        <div className="space-y-4">
          <AttackTimeline
            events={(historyQuery.data ?? []).map((h) => ({
              id: h.id,
              title: h.action,
              timestamp: h.created_at,
              severity: incident.severity,
              description: h.old_value || h.new_value ? `${h.old_value ?? "-"} ➔ ${h.new_value ?? "-"}` : undefined,
              performedBy: h.performed_by,
            }))}
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

            {responsesQuery.isLoading ? (
              <Loading label="Loading responses..." />
            ) : incidentResponses.length === 0 ? (
              <EmptyState title="No response actions executed for this incident yet" />
            ) : (
              <ul className="divide-y divide-border p-4">
                {incidentResponses.map((res) => (
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
            )}
          </Card>
        </div>
      )}

      {tab === "Analysis" && (
        <Card>
          <CardHeader title="Risk Analysis" />
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Info label="Risk Score" value={incident.risk_score ?? "Not analyzed yet"} />
            <Info label="Severity" value={<SeverityBadge severity={incident.severity} />} />
            <Info label="Confidence" value={`${incident.confidence}%`} />
          </dl>
          <p className="mt-4 text-xs text-text-muted">
            Recommended action / narrative analysis text is generated by the risk-engine but the
            current backend schema only persists risk score, severity and confidence &mdash; the
            analysis change log below is the closest available audit trail.
          </p>
          <div className="mt-4">
            {historyQuery.isLoading ? (
              <Loading label="Loading analysis history..." />
            ) : (
              <ul className="divide-y divide-border">
                {(historyQuery.data ?? [])
                  .filter((h) => h.action.toLowerCase().includes("risk") || h.action.toLowerCase().includes("analy"))
                  .map((h) => (
                    <li key={h.id} className="py-3 first:pt-0 last:pb-0">
                      <p className="text-sm text-text">{h.action}</p>
                      <p className="text-xs text-text-muted">
                        {h.old_value ?? "-"} &rarr; {h.new_value ?? "-"} &middot; {formatDateTime(h.created_at)}
                      </p>
                    </li>
                  ))}
              </ul>
            )}
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
