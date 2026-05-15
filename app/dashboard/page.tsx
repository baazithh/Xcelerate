"use client";

import DataGrid from "@/components/dashboard/DataGrid";
import KpiCard, { buildKpiCards } from "@/components/dashboard/KpiCard";
import StatusPieChart from "@/components/dashboard/StatusPieChart";
import TimeSeriesChart from "@/components/dashboard/TimeSeriesChart";
import {
  findStatusColumn,
  loadDashboardPayload,
  resolveDateFilter,
  resolveStatusFilter,
} from "@/lib/dashboard";
import type { UploadResponse } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<UploadResponse | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string | null>(null);

  useEffect(() => {
    const payload = loadDashboardPayload();
    if (!payload) {
      router.replace("/upload");
      return;
    }
    setData(payload);
  }, [router]);

  const statusColumn = useMemo(() => {
    if (!data) return null;
    const statuses = data.charts.pie_status.map((p) => p.status);
    return findStatusColumn(data.raw_json_data, statuses);
  }, [data]);

  const kpiCards = useMemo(() => {
    if (!data) return [];
    return buildKpiCards(
      data.kpis.total_transactions,
      data.kpis.total_value,
      data.kpis.avg_value,
    );
  }, [data]);

  if (!data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <aside className="space-y-4 lg:col-span-3">
        <div className="border border-gray-800 bg-card p-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            Sheet Summary
          </h3>
          <p className="mt-3 text-xs leading-relaxed text-gray-300">
            {data.metadata.summary}
          </p>
        </div>

        <div className="border border-gray-800 bg-card p-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            Transaction Status
          </h3>
          <StatusPieChart
            data={data.charts.pie_status}
            activeStatus={filterStatus}
            onSliceClick={(status) =>
              setFilterStatus((prev) => resolveStatusFilter(status, prev))
            }
          />
          <ul className="mt-2 space-y-1">
            {data.charts.pie_status.map((item) => (
              <li
                key={item.status}
                className="flex justify-between text-[10px] text-gray-500"
              >
                <span>{item.status}</span>
                <span className="tabular-nums text-gray-400">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="space-y-4 lg:col-span-9">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {kpiCards.map((kpi) => (
            <KpiCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              delta={kpi.delta}
            />
          ))}
        </div>

        <div className="border border-gray-800 bg-card p-4">
          <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            Key Performance Graph
          </h3>
          <TimeSeriesChart
            data={data.charts.time_series}
            activeDate={filterDate}
            onPointClick={(date) =>
              setFilterDate((prev) => resolveDateFilter(date, prev))
            }
          />
        </div>

        <DataGrid
          rows={data.raw_json_data}
          statusColumn={statusColumn}
          dateColumn={data.metadata.inferred_date_col || null}
          filterStatus={filterStatus}
          filterDate={filterDate}
          onClearFilters={() => {
            setFilterStatus(null);
            setFilterDate(null);
          }}
        />
      </section>
    </div>
  );
}
