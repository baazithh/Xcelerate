import type { RawRow, UploadResponse } from "./types";
import { STORAGE_KEY } from "./types";

export function findStatusColumn(
  rows: RawRow[],
  pieStatuses: string[],
): string | null {
  if (rows.length === 0 || pieStatuses.length === 0) return null;
  const targets = new Set(pieStatuses.map((s) => s.toLowerCase()));

  for (const col of Object.keys(rows[0])) {
    const values = new Set(
      rows.map((r) => String(r[col] ?? "").toLowerCase()).filter(Boolean),
    );
    const overlap = [...targets].filter((t) => values.has(t)).length;
    if (overlap >= Math.min(2, targets.size)) return col;
  }

  for (const col of Object.keys(rows[0])) {
    const unique = new Set(rows.map((r) => String(r[col] ?? "")));
    if (unique.size >= 2 && unique.size <= 8) return col;
  }

  return null;
}

export function resolveStatusFilter(
  clicked: string,
  current: string | null,
): string | null {
  return current?.toLowerCase() === clicked.toLowerCase() ? null : clicked;
}

export function resolveDateFilter(
  clicked: string,
  current: string | null,
): string | null {
  return current === clicked ? null : clicked;
}

export function loadDashboardPayload(): UploadResponse | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UploadResponse;
  } catch {
    return null;
  }
}
