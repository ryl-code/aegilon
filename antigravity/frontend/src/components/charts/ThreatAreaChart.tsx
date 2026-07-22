"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const data = [
  { name: "Jan", Alerts: 10, Incidents: 2 },
  { name: "Feb", Alerts: 15, Incidents: 3 },
  { name: "Mar", Alerts: 12, Incidents: 1 },
  { name: "Apr", Alerts: 25, Incidents: 6 },
  { name: "May", Alerts: 18, Incidents: 4 },
  { name: "Jun", Alerts: 30, Incidents: 7 },
  { name: "Jul", Alerts: 22, Incidents: 5 },
];

export function ThreatAreaChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
          </linearGradient>
        </defs>
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
        />
        <Area 
          type="monotone" 
          dataKey="Alerts" 
          stroke="var(--primary)" 
          fillOpacity={1} 
          fill="url(#colorAlerts)" 
          strokeWidth={2}
        />
        <Area 
          type="monotone" 
          dataKey="Incidents" 
          stroke="#ef4444" 
          fillOpacity={1} 
          fill="url(#colorIncidents)" 
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
