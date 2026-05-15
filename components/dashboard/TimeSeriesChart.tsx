"use client";

import type { TimeSeriesPoint } from "@/lib/types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  activeDate: string | null;
  onPointClick: (date: string) => void;
}

export default function TimeSeriesChart({
  data,
  activeDate,
  onPointClick,
}: TimeSeriesChartProps) {
  return (
    <motion className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          onClick={(state) => {
            const payload = state?.activePayload?.[0]?.payload as
              | TimeSeriesPoint
              | undefined;
            if (payload?.date) onPointClick(payload.date);
          }}
        >
          <defs>
            <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#6b7280", fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: "#374151" }}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
            }
          />
          <Tooltip
            contentStyle={{
              background: "#141922",
              border: "1px solid #374151",
              fontSize: 12,
            }}
            formatter={(value: number) => [
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(value),
              "Value",
            ]}
            labelStyle={{ color: "#9ca3af" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#valueGradient)"
            activeDot={{
              r: 6,
              fill: "#22d3ee",
              stroke: activeDate ? "#fff" : "#22d3ee",
              strokeWidth: 2,
              cursor: "pointer",
            }}
            dot={(props) => {
              const { cx, cy, payload } = props;
              const point = payload as TimeSeriesPoint;
              const active = activeDate === point.date;
              return (
                <circle
                  key={point.date}
                  cx={cx}
                  cy={cy}
                  r={active ? 5 : 3}
                  fill={active ? "#fff" : "#22d3ee"}
                  stroke="#22d3ee"
                  strokeWidth={active ? 2 : 1}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPointClick(point.date);
                  }}
                />
              );
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion>
  );
}

function motion({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <motion className={className}>{children}</motion>;
}
