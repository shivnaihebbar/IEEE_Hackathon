"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";
import { ATTACK_COLORS, AttackLabel } from "../lib/api";

interface AttackDistChartProps {
  summary: Record<string, number>;
}

export default function AttackDistChart({ summary }: AttackDistChartProps) {
  const data = Object.entries(summary)
    .map(([name, count]) => ({ name: name.replace("_", " "), raw: name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
        Attack Distribution
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#f9fafb",
              fontSize: "12px",
            }}
            formatter={(value: number) => [value.toLocaleString(), "Flows"]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.raw}
                fill={ATTACK_COLORS[entry.raw as AttackLabel] ?? "#6b7280"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}