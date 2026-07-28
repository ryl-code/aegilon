"use client";

import React from "react";
import { SeverityBadge } from "@/components/ui/Badge";
import { formatDateTime } from "@/utils/format";

export interface TimelineEvent {
  id: string;
  title: string;
  timestamp: string | Date;
  severity: string;
  mitre?: string;
  category?: string;
  occurrence?: number;
  description?: string;
  performedBy?: string;
}

interface AttackTimelineProps {
  events: TimelineEvent[];
  firstSeen?: string | Date;
  lastSeen?: string | Date;
}

function safeFormat(val?: string | Date | null) {
  if (!val) return "-";
  if (typeof val === "string") return formatDateTime(val);
  return formatDateTime(val.toISOString());
}

export function AttackTimeline({ events, firstSeen, lastSeen }: AttackTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-text-muted rounded-xl border border-border bg-surface">
        No attack timeline events recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h4 className="text-sm font-semibold text-text">Attack Chronology Timeline</h4>
          <p className="text-xs text-text-muted">Sequenced event progression across execution phases</p>
        </div>
        {firstSeen && lastSeen && (
          <div className="text-right text-[11px] text-text-muted">
            <span>Interval: <strong className="text-text">{safeFormat(firstSeen)}</strong> ➔ <strong className="text-text">{safeFormat(lastSeen)}</strong></span>
          </div>
        )}
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {events.map((evt, idx) => (
          <div key={evt.id || idx} className="relative group">
            {/* Timeline Node Icon */}
            <div className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-background ring-4 ring-background ${
              evt.severity?.toLowerCase() === "critical"
                ? "bg-red-500"
                : evt.severity?.toLowerCase() === "high"
                ? "bg-amber-500"
                : "bg-blue-500"
            }`} />

            <div className="rounded-xl border border-border bg-background p-3.5 space-y-2 hover:border-primary/50 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-text">{evt.title}</span>
                  <SeverityBadge severity={evt.severity} />
                  {evt.occurrence && evt.occurrence > 1 && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {evt.occurrence}x repeated
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-text-muted">{safeFormat(evt.timestamp)}</span>
              </div>

              {evt.description && (
                <p className="text-xs text-text-muted leading-relaxed">{evt.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                {evt.mitre && (
                  <span className="font-mono bg-surface px-2 py-0.5 rounded border border-border text-primary font-medium">
                    MITRE: {evt.mitre}
                  </span>
                )}
                {evt.category && (
                  <span className="text-text-muted">Category: <strong className="text-text">{evt.category}</strong></span>
                )}
                {evt.performedBy && (
                  <span className="text-text-muted">By: <span className="font-medium text-text">{evt.performedBy}</span></span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
