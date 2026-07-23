"use client";

import React from "react";

interface AnomalyBadgeProps {
  score?: number;
}

export function AnomalyBadge({ score = 15.0 }: AnomalyBadgeProps) {
  const s = Math.min(Math.max(score, 0), 100);

  const toneClass =
    s >= 70
      ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
      : s >= 40
      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
      : "bg-surface-hover text-text-muted border-border";

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-medium ${toneClass}`} title="Behavioral Anomaly Score (Baseline Deviation)">
      <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <span>Anomaly: <strong>{s.toFixed(1)}%</strong></span>
    </div>
  );
}
