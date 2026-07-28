"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, Zap } from "lucide-react";

export function RealtimeAlertBanner() {
  const [isConnected, setIsConnected] = useState(true);

  return (
    <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs text-primary">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="font-semibold">REAL-TIME TELEMETRY & EVENT STREAM ACTIVE</span>
      </div>
      <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
        <Zap size={14} className="text-emerald-400" />
        <span>Wazuh Agent 5s Polling Engine Enabled</span>
      </div>
    </div>
  );
}
