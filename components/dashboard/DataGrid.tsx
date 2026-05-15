"use client";

import type { RawRow } from "@/lib/types";
import { useMemo, useState } from "react";

const PAGE_SIZE = 10;

interface DataGridProps {
  rows: RawRow[];
  statusColumn: string | null;
  dateColumn: string | null;
  filterStatus: string | null;
  filterDate: string | null;
  onClearFilters: () => void;
}

export default function DataGrid({
  rows,
  statusColumn,
  dateColumn,
  filterStatus,
  filterDate,
  onClearFilters,
}: DataGridProps) {
  const [search, setSearch] = useState("");
  const [columnFilter, setColumnFilter] = useState("");
  const [page, setPage] = useState(1);

  const columns = useMemo(() => {
    if (rows.length === 0) return [] as string[];
    return Object.keys(rows[0]);
  }, [rows]);

  const filtered = useMemo(() => {
    let result = rows;

    if (filterStatus && statusColumn) {
      result = result.filter(
        (r) => String(r[statusColumn] ?? "").toLowerCase() === filterStatus.toLowerCase(),
      );
    }

    if (filterDate && dateColumn) {
      result = result.filter((r) => {
        const raw = String(r[dateColumn] ?? "");
        const normalized = raw.slice(0, 10);
        return normalized === filterDate || raw.includes(filterDate);
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(q)),
      );
    }

    if (columnFilter.trim()) {
      const [col, val] = columnFilter.split(":").map((s) => s.trim());
      if (col && val) {
        result = result.filter((r) =>
          String(r[col] ?? "")
            .toLowerCase()
            .includes(val.toLowerCase()),
        );
      }
    }

    return result;
  }, [rows, filterStatus, filterDate, statusColumn, dateColumn, search, columnFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <div className="border border-gray-800 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 px-4 py-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          Active Data Grid
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {(filterStatus || filterDate) && (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-[10px] uppercase tracking-wide text-cyan-400 hover:text-cyan-300"
            >
              Clear chart filters
            </button>
          )}
          <input
            type="search"
            placeholder="Search rows…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border border-gray-700 bg-surface px-2 py-1 text-xs text-gray-200 placeholder:text-gray-600 focus:border-cyan-500/50 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Filter column:value"
            value={columnFilter}
            onChange={(e) => {
              setColumnFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-700 bg-surface px-2 py-1 text-xs text-gray-200 placeholder:text-gray-600 focus:border-cyan-500/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-xs">
          <thead>
            <tr className="border-b border-gray-800 text-[10px] uppercase tracking-wider text-gray-500">
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={Math.max(columns.length, 1)}
                  className="px-3 py-8 text-center text-gray-500"
                >
                  No rows match the current filters.
                </td>
              </tr>
            ) : (
              pageRows.map((row, i) => (
                <tr
                  key={`${safePage}-${i}`}
                  className="border-b border-gray-800/60 hover:bg-surface/50"
                >
                  {columns.map((col) => (
                    <td key={col} className="px-3 py-2 text-gray-300">
                      {formatCell(row[col])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-gray-800 px-4 py-2 text-[10px] text-gray-500">
        <span>
          {filtered.length} row{filtered.length === 1 ? "" : "s"}
          {(filterStatus || filterDate) && " (chart-filtered)"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="border border-gray-700 px-2 py-0.5 disabled:opacity-30"
          >
            Prev
          </button>
          <span>
            Page {safePage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="border border-gray-700 px-2 py-0.5 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") return value.toLocaleString();
  return String(value);
}
