"use client";

import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export interface ThreatDataPoint {
  name: string;
  Alerts: number;
  Incidents: number;
}

interface ThreatAreaChartProps {
  hourlyData?: ThreatDataPoint[];
  dailyData?: ThreatDataPoint[];
  monthlyData?: ThreatDataPoint[];
}

export function ThreatAreaChart({ hourlyData, dailyData, monthlyData }: ThreatAreaChartProps) {
  const [mode, setMode] = useState<"24h" | "daily" | "monthly">("24h");

  let chartData: ThreatDataPoint[] = [];
  if (mode === "24h") {
    chartData = hourlyData && hourlyData.length > 0 ? hourlyData : [
      { name: "00:00", Alerts: 8, Incidents: 0 },
      { name: "04:00", Alerts: 18, Incidents: 0 },
      { name: "08:00", Alerts: 42, Incidents: 0 },
      { name: "12:00", Alerts: 75, Incidents: 0 },
      { name: "16:00", Alerts: 90, Incidents: 0 },
      { name: "20:00", Alerts: 100, Incidents: 0 },
    ];
  } else if (mode === "daily") {
    chartData = dailyData && dailyData.length > 0 ? dailyData : [
      { name: "20 Jul", Alerts: 15, Incidents: 0 },
      { name: "21 Jul", Alerts: 32, Incidents: 0 },
      { name: "22 Jul", Alerts: 50, Incidents: 0 },
      { name: "23 Jul", Alerts: 68, Incidents: 0 },
      { name: "24 Jul", Alerts: 88, Incidents: 0 },
      { name: "25 Jul", Alerts: 100, Incidents: 0 },
    ];
  } else {
    chartData = monthlyData && monthlyData.length > 0 ? monthlyData : [
      { name: "Jun 2026", Alerts: 45, Incidents: 0 },
      { name: "Jul 2026", Alerts: 100, Incidents: 0 },
    ];
  }

  return (
    <div className="space-y-3">
      {/* Time Mode Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
        <div className="flex items-center gap-1 rounded-lg bg-surface-hover p-1 border border-border text-[11px] font-medium">
          <button
            onClick={() => setMode("24h")}
            className={`rounded px-2.5 py-1 transition-colors ${
              mode === "24h"
                ? "bg-primary text-white font-semibold shadow"
                : "text-text-muted hover:text-text"
            }`}
          >
            Last 24 Hours (24 Jam)
          </button>
          <button
            onClick={() => setMode("daily")}
            className={`rounded px-2.5 py-1 transition-colors ${
              mode === "daily"
                ? "bg-primary text-white font-semibold shadow"
                : "text-text-muted hover:text-text"
            }`}
          >
            Daily (Harian)
          </button>
          <button
            onClick={() => setMode("monthly")}
            className={`rounded px-2.5 py-1 transition-colors ${
              mode === "monthly"
                ? "bg-primary text-white font-semibold shadow"
                : "text-text-muted hover:text-text"
            }`}
          >
            Monthly (Bulanan - 3 Bulan Terakhir)
          </button>
        </div>
        
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-primary font-medium">
            <span className="h-2 w-2 rounded-full bg-primary" /> Alerts Ingested
          </span>
          <span className="flex items-center gap-1.5 text-red-500 font-medium">
            <span className="h-2 w-2 rounded-full bg-red-500" /> Incidents
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="var(--text-muted)" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="var(--text-muted)" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--text)"
            }}
            itemStyle={{ color: "var(--text)" }}
            cursor={{ fill: "var(--surface-hover)" }}
          />
          <Bar 
            dataKey="Alerts" 
            fill="var(--primary)" 
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Bar 
            dataKey="Incidents" 
            fill="#ef4444" 
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
