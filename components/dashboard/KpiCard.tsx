import { formatCurrency, formatDelta } from "@/lib/format";

interface KpiCardProps {
  label: string;
  value: string;
  delta: number;
}

export default function KpiCard({ label, value, delta }: KpiCardProps) {
  const { text, positive } = formatDelta(delta);

  return (
    <div className="border border-gray-800 bg-card p-4">
      <p className="text-[10px] font-medium uppercase tracking-widest text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-white">{value}</p>
      <p
        className={`mt-1 text-xs font-medium tabular-nums ${
          positive ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

export function buildKpiCards(
  totalTransactions: number,
  totalValue: number,
  avgValue: number,
) {
  const deltas = [12.7, 8.3, -2.1];
  return [
    {
      label: "Total Transactions",
      value: totalTransactions.toLocaleString(),
      delta: deltas[0],
    },
    {
      label: "Total Value",
      value: formatCurrency(totalValue),
      delta: deltas[1],
    },
    {
      label: "Average Value",
      value: formatCurrency(avgValue),
      delta: deltas[2],
    },
  ];
}
