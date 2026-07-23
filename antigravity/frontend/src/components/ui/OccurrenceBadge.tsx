"use client";

import React from "react";

interface OccurrenceBadgeProps {
  count: number;
  firstSeen?: string | Date;
  lastSeen?: string | Date;
}

export function OccurrenceBadge({ count, firstSeen, lastSeen }: OccurrenceBadgeProps) {
  if (!count || count <= 1) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-text-muted px-2 py-0.5 rounded bg-surface border border-border">
        1x occurrence
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-bold" title={firstSeen && lastSeen ? `First: ${firstSeen} | Last: ${lastSeen}` : `Event repeated ${count} times`}>
      <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      {count}x repeated
    </div>
  );
}
