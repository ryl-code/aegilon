"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { EmptyState } from "@/components/ui/EmptyState";

const COLORS: Record<string, string> = {
  Critical: "#DC2626",
  High: "#EF4444",
  Medium: "#F59E0B",
  Low: "#22C55E",
  Info: "#A1A1AA",
};

export function SeverityDonut({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).filter(([, value]) => value > 0);

  if (entries.length === 0) {
    return <EmptyState title="No severity data yet" />;
  }

  const chartData = entries.map(([name, value]) => ({ name, value }));
  const total = entries.reduce((acc, [, val]) => acc + val, 0);

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={48}
            outerRadius={72}
            paddingAngle={3}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] ?? "#3F3F46"} />
            ))}
          </Pie>
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
            <tspan x="50%" dy="-6" fontSize="10" fill="var(--text-muted)" fontWeight="600" letterSpacing="0.05em">TOTAL</tspan>
            <tspan x="50%" dy="20" fontSize="18" fill="var(--text)" fontWeight="700">{total}</tspan>
          </text>
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
        </PieChart>
      </ResponsiveContainer>
      <ul className="space-y-2 text-sm">
        {chartData.map((entry) => (
          <li key={entry.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: COLORS[entry.name] ?? "#3F3F46" }}
            />
            <span className="text-text-muted">{entry.name}</span>
            <span className="font-medium text-text">{entry.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
