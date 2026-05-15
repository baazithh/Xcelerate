export interface UploadMetadata {
  summary: string;
  inferred_date_col: string;
  inferred_val_col: string;
}

export interface UploadKpis {
  total_transactions: number;
  total_value: number;
  avg_value: number;
}

export interface PieStatusItem {
  status: string;
  value: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface UploadCharts {
  pie_status: PieStatusItem[];
  time_series: TimeSeriesPoint[];
}

export type RawRow = Record<string, string | number | boolean | null>;

export interface UploadResponse {
  metadata: UploadMetadata;
  kpis: UploadKpis;
  charts: UploadCharts;
  raw_json_data: RawRow[];
}

export const STORAGE_KEY = "xcelerate_dashboard_payload";
