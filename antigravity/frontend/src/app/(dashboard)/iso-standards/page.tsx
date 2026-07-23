"use client";

import React from "react";
import { BookOpen, ShieldCheck, FileText, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { SeverityBadge } from "@/components/ui/Badge";

export default function ISOStandardsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
          <ShieldCheck size={16} /> Compliance & Governance Reference
        </div>
        <h1 className="text-xl font-bold text-text mt-1">ISO Standards & Wazuh Rule Level Classification</h1>
        <p className="text-sm text-text-muted">
          Formal mapping of AEGILON XDR operational detection levels and real Wazuh Indexer stats to International Standards (**ISO/IEC 27035**, **ISO 31000**, and **NIST SP 800-61**).
        </p>
      </div>

      {/* Live Wazuh Connection Metric Panel (Matching Wazuh Dashboard Screenshot) */}
      <Card className="border-l-4 border-l-primary bg-surface/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
              <h3 className="text-sm font-bold text-text">Wazuh Manager Live Ingestion Status</h3>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Synchronized Agent State: <strong className="text-red-400">1 Disconnected Agent</strong> (0 Active) • Total 24h Alerts: <strong className="text-text font-mono">202,050</strong>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">
              Critical: 2,561 (L15+)
            </span>
            <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
              High: 5,010 (L12-14)
            </span>
            <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
              Medium: 787 (L7-11)
            </span>
            <span className="px-2.5 py-1 rounded bg-surface-hover text-text-muted border border-border">
              Low: 193,692 (L0-6)
            </span>
          </div>
        </div>
      </Card>

      {/* ISO Standards Reference Overview Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="text-blue-400" size={20} />
            <h3 className="font-semibold text-sm text-text">ISO/IEC 27035</h3>
          </div>
          <p className="text-xs font-medium text-blue-400 mb-1">Information Security Incident Management</p>
          <p className="text-xs text-text-muted leading-relaxed">
            International standard providing a structured 5-phase framework (Plan/Prepare, Detection/Reporting, Assessment/Decision, Responses, Lessons Learned). Mandates 4-tier incident severity categorization based on Business Impact & Urgency.
          </p>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="text-emerald-400" size={20} />
            <h3 className="font-semibold text-sm text-text">ISO 31000</h3>
          </div>
          <p className="text-xs font-medium text-emerald-400 mb-1">Risk Management Guidelines</p>
          <p className="text-xs text-text-muted leading-relaxed">
            Global risk management framework utilizing Likelihood vs. Consequence Evaluation Matrix. Defines mathematical scoring rules ($Risk = Likelihood \times Impact$) to categorize threat scores (0-100) into risk appetite thresholds.
          </p>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-amber-400" size={20} />
            <h3 className="font-semibold text-sm text-text">NIST SP 800-61</h3>
          </div>
          <p className="text-xs font-medium text-amber-400 mb-1">Computer Security Incident Handling Guide</p>
          <p className="text-xs text-text-muted leading-relaxed">
            Special Publication detailing operational SIEM/XDR event triage, containment priority levels, and SLA timeframes for SOC analyst incident escalation and automated agent response.
          </p>
        </Card>
      </div>

      {/* Main Mapping Table: Wazuh Level 0-16 -> ISO 27035 */}
      <Card>
        <CardHeader title="Official Wazuh Rule Level Mapping to ISO/IEC 27035 Severity Classes" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-hover/50 text-text-muted font-semibold">
                <th className="p-3">Wazuh Rule Level</th>
                <th className="p-3">AEGILON Severity</th>
                <th className="p-3">ISO/IEC 27035 Class</th>
                <th className="p-3">24h Wazuh Volume</th>
                <th className="p-3">Operational Description & Examples</th>
                <th className="p-3">Required Response SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-surface-hover/30">
                <td className="p-3 font-mono font-bold text-text-muted">Rule Level 0 – 6</td>
                <td className="p-3"><SeverityBadge severity="Low" /></td>
                <td className="p-3 font-medium text-text">Informational / Noise (Level 1)</td>
                <td className="p-3 font-mono text-text font-semibold">193,692 alerts</td>
                <td className="p-3 text-text-muted">Successful user logins, routine service status checks, configuration audit logs, low-relevance web scanner probes.</td>
                <td className="p-3 text-text-muted">No immediate action (Logged for audit)</td>
              </tr>

              <tr className="hover:bg-surface-hover/30">
                <td className="p-3 font-mono font-bold text-blue-400">Rule Level 7 – 11</td>
                <td className="p-3"><SeverityBadge severity="Medium" /></td>
                <td className="p-3 font-medium text-blue-400">Level 2 - Medium Impact</td>
                <td className="p-3 font-mono text-blue-400 font-semibold">787 alerts</td>
                <td className="p-3 text-text-muted">Multiple failed login attempts, unusual privilege changes, execution of wscript/cscript binaries.</td>
                <td className="p-3 text-text-muted">&lt; 4 Hours (Analyst monitoring)</td>
              </tr>

              <tr className="hover:bg-surface-hover/30">
                <td className="p-3 font-mono font-bold text-amber-400">Rule Level 12 – 14</td>
                <td className="p-3"><SeverityBadge severity="High" /></td>
                <td className="p-3 font-medium text-amber-400">Level 3 - High Impact</td>
                <td className="p-3 font-mono text-amber-400 font-semibold">5,010 alerts</td>
                <td className="p-3 text-text-muted">Confirmed brute force attacks, Mimikatz credential dumping, LSASS memory access, suspicious PowerShell execution.</td>
                <td className="p-3 text-text-muted">&lt; 30 Minutes (Immediate investigation)</td>
              </tr>

              <tr className="hover:bg-surface-hover/30 bg-red-500/5">
                <td className="p-3 font-mono font-bold text-red-500">Rule Level 15 or higher</td>
                <td className="p-3"><SeverityBadge severity="Critical" /></td>
                <td className="p-3 font-medium text-red-500">Level 4 - Critical Compromise</td>
                <td className="p-3 font-mono text-red-500 font-bold">2,561 alerts</td>
                <td className="p-3 text-text-muted">Active malware/ransomware execution, privilege escalation, confirmed host compromise, automated isolation triggered.</td>
                <td className="p-3 text-red-400 font-semibold">&lt; 5 Minutes / Automated Agent Containment</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* AEGILON 4-Tier Severity Policy Box */}
      <Card className="space-y-4">
        <CardHeader title="AEGILON XDR Risk Evaluation Policy Matrix" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-border bg-background space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-emerald-400" size={18} />
              <h4 className="font-semibold text-text">Risk Score Formula (ISO 31000 Compliant)</h4>
            </div>
            <p className="text-text-muted leading-relaxed">
              Calculated using the Weighted Sum Model combining Base Rule Severity, Occurrence Frequency, and Host Criticality:
            </p>
            <div className="p-2.5 rounded bg-surface border border-border font-mono text-[11px] text-primary">
              Risk = Min( (Rule_Level / 15 * 50) + (Occurrence * 3) + (Asset_Value * 20), 100 )
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-background space-y-2">
            <div className="flex items-center gap-2">
              <Info className="text-blue-400" size={18} />
              <h4 className="font-semibold text-text">ISO/IEC 27035 Phase Alignment</h4>
            </div>
            <ul className="space-y-1.5 text-text-muted">
              <li>• <strong>Phase 1 (Preparation):</strong> Agent deployment & detection rule seeding.</li>
              <li>• <strong>Phase 2 (Detection & Reporting):</strong> Real-time Wazuh event ingestion & Telegram alerts.</li>
              <li>• <strong>Phase 3 (Assessment):</strong> Python Risk Engine score calculation & Anomaly score.</li>
              <li>• <strong>Phase 4 (Responses):</strong> Host Isolation & Process Termination.</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
