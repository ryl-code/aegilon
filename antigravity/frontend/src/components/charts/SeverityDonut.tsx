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

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={2}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] ?? "#3F3F46"} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#18181B",
              border: "1px solid #27272A",
              borderRadius: 8,
              fontSize: 12,
            }}
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
