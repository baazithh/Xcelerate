export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDelta(delta: number): { text: string; positive: boolean } {
  const positive = delta >= 0;
  const arrow = positive ? "🔼" : "🔽";
  const sign = positive ? "+" : "";
  return {
    text: `${sign}${delta.toFixed(1)}% ${arrow}`,
    positive,
  };
}
