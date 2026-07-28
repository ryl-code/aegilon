"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Search, RefreshCw, Download, Info, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { SCAPolicy, SCACheck } from "@/types";

const MOCK_POLICY: SCAPolicy = {
  name: "CIS Microsoft Windows 11 Enterprise Benchmark v1.0.0",
  passed: 127,
  failed: 260,
  not_applicable: 8,
  score: 32,
  end_scan: "Jul 25, 2026 @ 12:04:07.000",
  total_checks: 395,
  checks: [
    {
      id: 26000,
      title: "Ensure 'Enforce password history' is set to '24 or more password(s)'",
      target: "Command: net exe accounts",
      result: "failed",
      rationale:
        "The longer a user uses the same password, the greater the chance that an attacker can determine the password through brute force attacks. Also, any accounts that may have been compromised will remain exploitable for as long as the password is left unchanged.",
      remediation:
        "To establish the recommended configuration via GP, set the following UI path to 24 or more password(s):\nComputer Configuration\\Policies\\Windows Settings\\Security Settings\\Account Policies\\Password Policy\\Enforce password history",
      description:
        "This policy setting determines the number of renewed, unique passwords that have to be associated with a user account before you can reuse an old password. The value for this policy setting must be between 0 and 24 passwords. The default value for Windows Vista is 0 passwords.",
    },
    {
      id: 26001,
      title: "Ensure 'Maximum password age' is set to '365 or fewer days, but not 0'",
      target: "Command: net accounts /maxpwage",
      result: "failed",
      rationale:
        "Passwords that never expire present a severe security risk as compromised credentials can be used indefinitely without detection.",
      remediation:
        "Set the following GPO path to 365 or fewer days:\nComputer Configuration\\Policies\\Windows Settings\\Security Settings\\Account Policies\\Password Policy\\Maximum password age",
      description:
        "This security setting determines how long a user can keep a password before it expires. You can set passwords to expire after a specified number of days between 1 and 999.",
    },
    {
      id: 26002,
      title: "Ensure 'Minimum password length' is set to '14 or more character(s)'",
      target: "Command: net accounts /minpwlen",
      result: "failed",
      rationale:
        "Short passwords can be cracked quickly using modern offline dictionary attacks and specialized GPU cracking rigs.",
      remediation:
        "Set the GPO path to 14 or more characters:\nComputer Configuration\\Policies\\Windows Settings\\Security Settings\\Account Policies\\Password Policy\\Minimum password length",
      description:
        "This security setting determines the minimum number of characters that a user password can contain.",
    },
    {
      id: 26005,
      title: "Ensure 'Account lockout duration' is set to '15 or more minute(s)'",
      target: "Registry: HKLM\\SYSTEM\\CurrentControlSet\\Services\\RemoteAccess",
      result: "passed",
      rationale:
        "Locking out accounts after a specified number of failed logon attempts mitigates automated brute-force attacks.",
      remediation:
        "Configure Account Lockout Duration to 15 minutes or greater in Group Policy.",
      description:
        "This security setting determines the number of minutes that a locked-out account remains locked out before automatically unlocking.",
    },
    {
      id: 26010,
      title: "Ensure 'Turn off Autoplay' is set to 'Enabled: All drives'",
      target: "Registry: HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer\\NoDriveTypeAutoRun",
      result: "failed",
      rationale:
        "Autoplay feature can automatically execute malicious code stored on removable media drives (USB thumb drives) upon insertion.",
      remediation:
        "Set GPO: Computer Configuration\\Administrative Templates\\Windows Components\\AutoPlay Policies\\Turn off AutoPlay to Enabled (All drives).",
      description:
        "Autoplay begins reading from a drive as soon as media is inserted, which can lead to automatic malware infection.",
    },
    {
      id: 26015,
      title: "Ensure 'Disallow Digest Authentication' is set to 'Enabled'",
      target: "Registry: HKLM\\SYSTEM\\CurrentControlSet\\Control\\SecurityProviders\\WDigest\\UseLogonCredential",
      result: "passed",
      rationale:
        "WDigest credentials stored in cleartext memory make LSASS memory dumping attacks like Mimikatz trivial.",
      remediation:
        "Set UseLogonCredential registry DWORD value to 0 under WDigest key.",
      description:
        "Disables cleartext password caching in LSASS memory space on Windows endpoints.",
    },
    {
      id: 26020,
      title: "Ensure 'Windows Defender Credential Guard' is set to 'Enabled with UEFI lock'",
      target: "Registry: HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa\\LsaCfgFlags",
      result: "not_applicable",
      rationale:
        "Credential Guard uses virtualization-based security to isolate secrets so that only privileged system software can access them.",
      remediation:
        "Enable VBS and Credential Guard in Group Policy or Microsoft Intune policy.",
      description:
        "Requires hardware-assisted virtualization and Hyper-V platform support.",
    },
  ],
};

export function SCAAssessment({ policy = MOCK_POLICY }: { policy?: SCAPolicy }) {
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(26000); // Default expand first check

  const filteredChecks = policy.checks.filter((c) => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.target.toLowerCase().includes(search.toLowerCase()) ||
      String(c.id).includes(search);
    const matchResult = resultFilter === "all" || c.result === resultFilter;
    return matchSearch && matchResult;
  });

  const passedPct = Math.round((policy.passed / policy.total_checks) * 100);
  const failedPct = Math.round((policy.failed / policy.total_checks) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner Card: Donut & Policy Summary */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          {/* Donut Chart Visual */}
          <div className="flex flex-col items-center justify-center p-4 border-r border-border/40">
            <div className="relative flex items-center justify-center h-32 w-32">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
                <path
                  className="text-border"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Passed Slice (Green) */}
                <path
                  className="text-emerald-500"
                  strokeDasharray={`${passedPct}, 100`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Failed Slice (Red) */}
                <path
                  className="text-red-500"
                  strokeDasharray={`${failedPct}, 100`}
                  strokeDashoffset={`-${passedPct}`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-bold text-text">{policy.score}%</span>
                <span className="block text-[10px] text-text-muted font-medium">Compliance</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Passed ({policy.passed})
              </span>
              <span className="flex items-center gap-1 text-red-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Failed ({policy.failed})
              </span>
              <span className="flex items-center gap-1 text-text-muted font-medium">
                <span className="h-2 w-2 rounded-full bg-gray-500" /> N/A ({policy.not_applicable})
              </span>
            </div>
          </div>

          {/* Right Metrics Grid */}
          <div className="lg:col-span-3 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
                <Info size={14} /> Security Configuration Assessment Policy
              </div>
              <h2 className="text-lg font-bold text-text mt-1">{policy.name}</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
                <span className="text-xs text-emerald-400 font-medium">Passed</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{policy.passed}</p>
              </div>

              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center">
                <span className="text-xs text-red-400 font-medium">Failed</span>
                <p className="text-2xl font-bold text-red-400 mt-1">{policy.failed}</p>
              </div>

              <div className="rounded-xl border border-border bg-surface-hover/30 p-3 text-center">
                <span className="text-xs text-text-muted font-medium">Not applicable</span>
                <p className="text-2xl font-bold text-text mt-1">{policy.not_applicable}</p>
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-center">
                <span className="text-xs text-primary font-medium">Compliance Score</span>
                <p className="text-2xl font-bold text-primary mt-1">{policy.score}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-text-muted pt-1">
              <span>Total Assessed Rules: <strong className="text-text font-mono">{policy.total_checks}</strong></span>
              <span>End Scan: <strong className="text-text font-mono">{policy.end_scan}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Checks Table Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg space-y-4">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-text">Checks ({policy.total_checks})</h3>
            <p className="text-xs text-text-muted">Detailed CIS benchmark rule evaluation and remediation guidance</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search check ID, title, command..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-1.5 text-xs text-text focus:outline-none focus:border-primary"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 rounded-lg bg-background p-1 border border-border text-xs">
              <button
                onClick={() => setResultFilter("all")}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  resultFilter === "all" ? "bg-surface text-text shadow" : "text-text-muted hover:text-text"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setResultFilter("failed")}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  resultFilter === "failed" ? "bg-red-500/20 text-red-400 font-semibold" : "text-text-muted hover:text-text"
                }`}
              >
                Failed
              </button>
              <button
                onClick={() => setResultFilter("passed")}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  resultFilter === "passed" ? "bg-emerald-500/20 text-emerald-400 font-semibold" : "text-text-muted hover:text-text"
                }`}
              >
                Passed
              </button>
            </div>

            {/* Actions */}
            <button className="flex items-center gap-1 rounded-lg border border-border bg-surface-hover px-2.5 py-1.5 text-xs font-medium text-text hover:bg-border transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <button className="flex items-center gap-1 rounded-lg border border-border bg-surface-hover px-2.5 py-1.5 text-xs font-medium text-text hover:bg-border transition-colors">
              <Download className="h-3.5 w-3.5" /> Export formatted
            </button>
          </div>
        </div>

        {/* Checks Table */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-hover/50 text-text-muted font-semibold">
                <th className="p-3 w-16">ID ↑</th>
                <th className="p-3">Title</th>
                <th className="p-3">Target</th>
                <th className="p-3 w-28">Result</th>
                <th className="p-3 w-12 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredChecks.map((check) => {
                const isExpanded = expandedId === check.id;
                return (
                  <React.Fragment key={check.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : check.id)}
                      className={`cursor-pointer transition-colors ${
                        isExpanded ? "bg-surface-hover/70" : "hover:bg-surface-hover/30"
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-text-muted">{check.id}</td>
                      <td className="p-3 font-medium text-text">{check.title}</td>
                      <td className="p-3 font-mono text-text-muted break-all">{check.target}</td>
                      <td className="p-3">
                        {check.result === "failed" ? (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-red-400">
                            <span className="h-2 w-2 rounded-full bg-red-500" /> Failed
                          </span>
                        ) : check.result === "passed" ? (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-text-muted">
                            <span className="h-2 w-2 rounded-full bg-gray-500" /> N/A
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center text-text-muted">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </td>
                    </tr>

                    {/* Expanded Detail Panel (Matching Screenshot Layout) */}
                    {isExpanded && (
                      <tr className="bg-background/90">
                        <td colSpan={5} className="p-4 border-b border-border/80 space-y-4">
                          {/* Rationale */}
                          <div className="space-y-1">
                            <h4 className="font-bold text-text text-xs uppercase tracking-wider text-primary">Rationale</h4>
                            <p className="text-xs text-text-muted leading-relaxed">{check.rationale}</p>
                          </div>

                          {/* Remediation */}
                          <div className="space-y-1">
                            <h4 className="font-bold text-text text-xs uppercase tracking-wider text-emerald-400">Remediation</h4>
                            <pre className="p-3 rounded-lg border border-border bg-surface font-mono text-[11px] text-text overflow-x-auto whitespace-pre-wrap">
                              {check.remediation}
                            </pre>
                          </div>

                          {/* Description */}
                          <div className="space-y-1">
                            <h4 className="font-bold text-text text-xs uppercase tracking-wider text-text-muted">Description</h4>
                            <p className="text-xs text-text-muted leading-relaxed">{check.description}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
