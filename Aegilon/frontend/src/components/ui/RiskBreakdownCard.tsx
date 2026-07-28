"use client";

import React from "react";

interface RiskBreakdownCardProps {
  riskScore: number;
  ruleSeverityLevel?: number;
  occurrenceCount?: number;
  assetCriticality?: number;
}

export function RiskBreakdownCard({
  riskScore,
  ruleSeverityLevel = 10,
  occurrenceCount = 1,
  assetCriticality = 1.0,
}: RiskBreakdownCardProps) {
  // Calculated weights matching RiskEngine algorithm
  const baseScore = Math.min((ruleSeverityLevel / 15.0) * 50.0, 50.0);
  const occurrenceScore = Math.min((occurrenceCount - 1) * 3.0, 30.0);
  const assetScore = Math.min(assetCriticality * 20.0, 20.0);

  return (
    <div className="rounded-xl border border-border bg-surface p-4 text-xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-text-muted font-medium">Risk Score Calculation</span>
          <p className="text-lg font-bold text-text mt-0.5">{riskScore.toFixed(1)} <span className="text-xs font-normal text-text-muted">/ 100</span></p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
            Weighted Sum Model
          </span>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-text-muted">Base Rule Severity (Max 50 pts)</span>
          <span className="font-semibold text-text">+{baseScore.toFixed(1)} pts</span>
        </div>
        <div className="w-full bg-surface-hover rounded-full h-1.5 overflow-hidden">
          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(baseScore / 50) * 100}%` }} />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-text-muted">Event Occurrence Bonus (Max 30 pts)</span>
          <span className="font-semibold text-text">+{occurrenceScore.toFixed(1)} pts</span>
        </div>
        <div className="w-full bg-surface-hover rounded-full h-1.5 overflow-hidden">
          <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${(occurrenceScore / 30) * 100}%` }} />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-text-muted">Asset & History Value (Max 20 pts)</span>
          <span className="font-semibold text-text">+{assetScore.toFixed(1)} pts</span>
        </div>
        <div className="w-full bg-surface-hover rounded-full h-1.5 overflow-hidden">
          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(assetScore / 20) * 100}%` }} />
        </div>
      </div>

      <p className="text-[11px] text-text-muted italic pt-1 border-t border-border/50">
        Formula: <code className="font-mono text-[10px] bg-surface-hover px-1 rounded">Risk = Min(Base + Occurrence + Asset, 100)</code>
      </p>
    </div>
  );
}
