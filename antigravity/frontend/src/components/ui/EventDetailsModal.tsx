"use client";

import React, { useState } from "react";
import { SeverityBadge, Badge } from "@/components/ui/Badge";
import type { Alert } from "@/types";

interface EventDetailsModalProps {
  alert: Alert | null;
  onClose: () => void;
}

export function EventDetailsModal({ alert, onClose }: EventDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "raw">("overview");
  const [copied, setCopied] = useState(false);

  if (!alert) return null;

  const raw = alert.raw_log || {};
  const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, any>;
  
  // Extract common forensic log properties safely
  const processName = data.process_name || data.data?.win?.eventdata?.image || data.data?.process?.name || "-";
  const cmdline = data.cmdline || data.data?.win?.eventdata?.commandLine || data.data?.process?.cmdline || "-";
  const user = data.user || data.data?.win?.eventdata?.targetUserName || data.data?.user?.name || "-";
  const pid = data.pid || data.data?.win?.eventdata?.processId || "-";
  const parentProcess = data.parent_process || data.data?.win?.eventdata?.parentImage || "-";
  const md5 = data.md5 || data.hashes?.md5 || "-";
  const srcIp = data.src_ip || data.data?.srcip || "-";
  const dstIp = data.dst_ip || data.data?.dstip || "-";

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(raw, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-text">{alert.title}</h3>
              <SeverityBadge severity={alert.severity} />
            </div>
            <p className="text-xs text-text-muted mt-1">Event ID: <span className="font-mono">{alert.event_id}</span> • Host: <span className="font-medium text-text">{alert.host?.hostname ?? alert.host_id}</span></p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted hover:bg-surface-hover hover:text-text transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === "overview" ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            Forensic Overview
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === "raw" ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            Raw JSON Log
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {activeTab === "overview" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-surface-hover/30 p-3 space-y-1">
                  <span className="text-text-muted font-medium">Process Name</span>
                  <p className="font-mono text-text font-semibold break-all">{processName}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface-hover/30 p-3 space-y-1">
                  <span className="text-text-muted font-medium">Target User</span>
                  <p className="font-mono text-text font-semibold">{user}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface-hover/30 p-3 space-y-1">
                <span className="text-text-muted font-medium">Command Line Execution</span>
                <p className="font-mono text-text bg-background p-2 rounded border border-border break-all whitespace-pre-wrap">
                  {cmdline}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-surface-hover/30 p-3 space-y-1">
                  <span className="text-text-muted font-medium">Parent Process</span>
                  <p className="font-mono text-text break-all">{parentProcess}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface-hover/30 p-3 space-y-1">
                  <span className="text-text-muted font-medium">Process ID (PID)</span>
                  <p className="font-mono text-text">{pid}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-surface-hover/30 p-3 space-y-1">
                  <span className="text-text-muted font-medium">Source IP</span>
                  <p className="font-mono text-text">{srcIp}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface-hover/30 p-3 space-y-1">
                  <span className="text-text-muted font-medium">Destination IP</span>
                  <p className="font-mono text-text">{dstIp}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface-hover/30 p-3 space-y-1">
                  <span className="text-text-muted font-medium">Wazuh Rule Level</span>
                  <p className="font-mono text-text font-semibold text-primary">Level {alert.wazuh_level}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute right-2 top-2">
                <button
                  onClick={handleCopyJson}
                  className="rounded bg-surface-hover border border-border px-2 py-1 text-[11px] font-medium text-text-muted hover:text-text transition-colors"
                >
                  {copied ? "✓ Copied!" : "Copy JSON"}
                </button>
              </div>
              <pre className="p-4 rounded-xl border border-border bg-background font-mono text-[11px] text-text-muted overflow-x-auto max-h-[50vh]">
                {JSON.stringify(raw, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-[11px] text-text-muted">Detected at: {new Date(alert.created_at).toLocaleString()}</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-surface-hover px-4 py-1.5 text-xs font-medium text-text hover:bg-border transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
