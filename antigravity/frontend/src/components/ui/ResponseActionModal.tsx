"use client";

import React, { useState } from "react";

export interface ResponseActionModalProps {
  actionName: string;
  targetHost?: string;
  incidentId?: string;
  onClose: () => void;
  onConfirm: (notes: string) => Promise<void>;
}

const ACTION_DETAILS: Record<string, { title: string; description: string; impact: string; tone: "danger" | "warning" | "info" }> = {
  "Isolate Host": {
    title: "Host Network Isolation",
    description: "Sever all incoming and outgoing network traffic on the target host.",
    impact: "WARNING: Active RDP, SSH, SMB, and domain connections will be immediately terminated. Only AEGILON agent communication will remain open.",
    tone: "danger",
  },
  "Kill Process": {
    title: "Terminate Malicious Process",
    description: "Send SIGKILL / TerminateProcess command to target process ID on endpoint.",
    impact: "CAUTION: Terminating system or parent processes may cause system instability or unexpected application crash.",
    tone: "warning",
  },
  "Block IP": {
    title: "Block Malicious IP Address",
    description: "Add firewall rule to block traffic to/from the suspicious external IP address.",
    impact: "NOTE: May affect outgoing connections if the IP belongs to a shared cloud endpoint or CDN.",
    tone: "info",
  },
  "Quarantine File": {
    title: "Quarantine File Artifact",
    description: "Move target file to encrypted isolate folder and revoke read/execute permissions.",
    impact: "NOTE: Prevents execution of suspicious binary while preserving forensic evidence for analysis.",
    tone: "warning",
  },
};

export function ResponseActionModal({
  actionName,
  targetHost = "Target Endpoint",
  onClose,
  onConfirm,
}: ResponseActionModalProps) {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const detail = ACTION_DETAILS[actionName] || {
    title: actionName,
    description: `Execute ${actionName} on target host.`,
    impact: "CAUTION: Ensure you have verified the threat before executing automated response actions.",
    tone: "warning",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(notes);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-text">{detail.title}</h3>
            <p className="text-xs text-text-muted">Target Host: <span className="font-mono text-primary font-semibold">{targetHost}</span></p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text text-sm font-bold">
            ✕
          </button>
        </div>

        {/* Action Description */}
        <p className="text-xs text-text-muted">{detail.description}</p>

        {/* Impact Statement Box */}
        <div className={`p-3 rounded-xl text-xs space-y-1 ${
          detail.tone === "danger"
            ? "bg-red-500/10 border border-red-500/30 text-red-400"
            : detail.tone === "warning"
            ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
            : "bg-blue-500/10 border border-blue-500/30 text-blue-400"
        }`}>
          <div className="flex items-center gap-1.5 font-semibold">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Impact Statement
          </div>
          <p className="text-[11px] leading-relaxed opacity-90">{detail.impact}</p>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-text">Analyst Justification / Audit Notes</label>
            <textarea
              required
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="State reason for response action execution (required for SOC audit trail)..."
              className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>

          {/* Workflow Status Tracker */}
          <div className="p-3 rounded-xl border border-border bg-background space-y-2 text-[11px]">
            <span className="text-text-muted font-medium">Response Status Workflow:</span>
            <div className="flex items-center justify-between text-center pt-1">
              <div className="flex-1">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1" />
                <span className="font-semibold text-amber-500">1. Pending</span>
              </div>
              <span className="text-text-muted">➔</span>
              <div className="flex-1">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1" />
                <span className="text-text-muted">2. Executing</span>
              </div>
              <span className="text-text-muted">➔</span>
              <div className="flex-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />
                <span className="text-text-muted">3. Completed</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-surface-hover px-4 py-2 text-xs font-medium text-text hover:bg-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !notes.trim()}
              className={`rounded-xl px-4 py-2 text-xs font-semibold text-white transition-colors ${
                detail.tone === "danger"
                  ? "bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  : "bg-primary hover:bg-primary/80 disabled:opacity-50"
              }`}
            >
              {isSubmitting ? "Executing..." : "Confirm & Execute Action"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
