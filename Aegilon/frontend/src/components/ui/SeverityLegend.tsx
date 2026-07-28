"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/Badge";

export function SeverityLegend() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface-hover hover:text-text transition-colors"
        title="View Official Wazuh Severity Classification Guide"
      >
        <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Wazuh Severity Range Guide
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-border bg-surface p-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
            <h4 className="text-sm font-semibold text-text">Wazuh Rule Severity Guide</h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:text-text text-sm font-bold"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-hover/50">
              <Badge tone="muted">Low (Rule Level 0 - 6)</Badge>
              <div>
                <p className="font-medium text-text">Informational Event</p>
                <p className="text-text-muted text-[11px]">Routine system messages, successful logins, minor web scanner probes.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-hover/50">
              <Badge tone="warning">Medium (Rule Level 7 - 11)</Badge>
              <div>
                <p className="font-medium text-text">Suspicious Activity</p>
                <p className="text-text-muted text-[11px]">Multiple failed login attempts, unusual privilege changes, policy violation.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-hover/50">
              <Badge tone="danger">High (Rule Level 12 - 14)</Badge>
              <div>
                <p className="font-medium text-text">Probable Attack</p>
                <p className="text-text-muted text-[11px]">Confirmed brute force, Mimikatz dumping, suspicious PowerShell execution.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-surface-hover/50">
              <Badge tone="danger">Critical (Rule Level 15+)</Badge>
              <div>
                <p className="font-medium text-text">Active Compromise</p>
                <p className="text-text-muted text-[11px]">Confirmed ransomware, rootkit signature, automated isolation triggered.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
