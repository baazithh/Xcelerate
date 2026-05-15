"use client";

import type { PieStatusItem } from "@/lib/types";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = ["#22d3ee", "#34d399", "#f87171", "#a78bfa", "#fbbf24"];

interface StatusPieChartProps {
  data: PieStatusItem[];
  activeStatus: string | null;
  onSliceClick: (status: string) => void;
}

export default function StatusPieChart({
  data,
  activeStatus,
  onSliceClick,
}: StatusPieChartProps) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={72}
            paddingAngle={2}
            onClick={(_, index) => {
              const item = data[index];
              if (item) onSliceClick(item.status);
            }}
            style={{ cursor: "pointer" }}
          >
            {data.map((entry, i) => (
              <Cell
                key={entry.status}
                fill={COLORS[i % COLORS.length]}
                opacity={
                  activeStatus && activeStatus !== entry.status ? 0.35 : 1
                }
                stroke={activeStatus === entry.status ? "#fff" : "transparent"}
                strokeWidth={activeStatus === entry.status ? 2 : 0}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#141922",
              border: "1px solid #374151",
              fontSize: 12,
            }}
            formatter={(value: number, name: string) => [value, name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
