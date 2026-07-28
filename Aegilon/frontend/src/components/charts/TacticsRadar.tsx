"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

interface TacticsRadarProps {
  categoryCounts?: Record<string, number>;
}

const DEFAULT_CATEGORIES = [
  "Credential Access",
  "Execution",
  "Persistence",
  "Discovery",
  "Exfiltration",
  "Lateral Movement",
];

export function TacticsRadar({ categoryCounts = {} }: TacticsRadarProps) {
  const chartData = DEFAULT_CATEGORIES.map((cat) => {
    const rawVal = categoryCounts[cat] || 0;
    // Map count to scaled value
    const scaledVal = rawVal > 0 ? Math.min(rawVal * 20 + 30, 100) : 15;
    return {
      subject: cat,
      A: scaledVal,
      count: rawVal,
      fullMark: 100,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis 
          dataKey="subject" 
          stroke="var(--text-muted)" 
          fontSize={10}
        />
        <Radar
          name="Threat Structure"
          dataKey="A"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
