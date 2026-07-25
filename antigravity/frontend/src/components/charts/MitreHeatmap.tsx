"use client";

import React from "react";

interface MitreHeatmapProps {
  categoryCounts?: Record<string, number>;
}

const MITRE_TACTICS = [
  { id: "TA0043", name: "Reconnaissance", count: 2 },
  { id: "TA0042", name: "Resource Dev", count: 1 },
  { id: "TA0001", name: "Initial Access", count: 5 },
  { id: "TA0002", name: "Execution", count: 28 },
  { id: "TA0003", name: "Persistence", count: 14 },
  { id: "TA0004", name: "Priv Escalation", count: 8 },
  { id: "TA0005", name: "Defense Evasion", count: 12 },
  { id: "TA0006", name: "Credential Access", count: 35 },
  { id: "TA0007", name: "Discovery", count: 9 },
  { id: "TA0008", name: "Lateral Movement", count: 6 },
  { id: "TA0009", name: "Collection", count: 3 },
  { id: "TA0011", name: "Command & Control", count: 4 },
  { id: "TA0010", name: "Exfiltration", count: 7 },
  { id: "TA0040", name: "Impact", count: 1 },
];

export function MitreHeatmap({ categoryCounts = {} }: MitreHeatmapProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-text uppercase tracking-wider">MITRE ATT&CK Threat Matrix Heatmap</h4>
          <p className="text-[11px] text-text-muted">Interactive tactic frequency intensity distribution</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-text-muted">
          <span>Low</span>
          <span className="h-2 w-3 rounded-sm bg-surface-hover" />
          <span className="h-2 w-3 rounded-sm bg-blue-500/30" />
          <span className="h-2 w-3 rounded-sm bg-amber-500/50" />
          <span className="h-2 w-3 rounded-sm bg-red-500/80" />
          <span>High Intensity</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {MITRE_TACTICS.map((tactic) => {
          const count = categoryCounts[tactic.name] || tactic.count;
          const isHigh = count >= 20;
          const isMed = count >= 8 && count < 20;
          const isLow = count > 0 && count < 8;

          const bgClass = isHigh
            ? "bg-red-500/20 border-red-500/40 text-red-400"
            : isMed
            ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
            : isLow
            ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
            : "bg-surface border-border text-text-muted opacity-60";

          return (
            <div
              key={tactic.id}
              className={`p-2.5 rounded-xl border flex flex-col justify-between h-20 transition-colors hover:border-primary/60 cursor-pointer ${bgClass}`}
              title={`${tactic.name} (${tactic.id}): ${count} detection events`}
            >
              <div>
                <span className="text-[10px] font-mono block opacity-75">{tactic.id}</span>
                <span className="text-xs font-semibold block truncate leading-tight mt-0.5">{tactic.name}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                <span>Hits:</span>
                <span className="font-bold">{count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
