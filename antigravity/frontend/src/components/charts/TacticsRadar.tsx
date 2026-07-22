"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

const data = [
  { subject: "Credential Access", A: 90, fullMark: 100 },
  { subject: "Execution", A: 75, fullMark: 100 },
  { subject: "Persistence", A: 60, fullMark: 100 },
  { subject: "Discovery", A: 50, fullMark: 100 },
  { subject: "Exfiltration", A: 45, fullMark: 100 },
  { subject: "Lateral Movement", A: 30, fullMark: 100 },
];

export function TacticsRadar() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
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
