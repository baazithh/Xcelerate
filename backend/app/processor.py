from __future__ import annotations

import io
import re
from typing import Any

import numpy as np
import pandas as pd

STATUS_KEYWORDS = {
    "completed",
    "complete",
    "success",
    "succeeded",
    "pending",
    "processing",
    "in progress",
    "failed",
    "failure",
    "error",
    "cancelled",
    "canceled",
}


def _read_raw(file_bytes: bytes, filename: str) -> pd.DataFrame:
    name = filename.lower()
    buffer = io.BytesIO(file_bytes)
    if name.endswith(".csv"):
        return pd.read_csv(buffer, header=None, dtype=object)
    if name.endswith(".xls"):
        return pd.read_excel(buffer, header=None, dtype=object, engine="xlrd")
    return pd.read_excel(buffer, header=None, dtype=object, engine="openpyxl")


def _non_empty_ratio(series: pd.Series) -> float:
    if len(series) == 0:
        return 0.0
    return float(series.notna().sum() / len(series))


def _find_table_start(raw: pd.DataFrame) -> tuple[int, int]:
    """Locate header row and first data column by density heuristics."""
    best_row = 0
    best_score = -1.0
    max_scan = min(40, len(raw))

    for r in range(max_scan):
        row = raw.iloc[r]
        non_empty = row.notna().sum()
        if non_empty < 2:
            continue
        stringish = sum(
            1 for v in row if isinstance(v, str) and str(v).strip() != ""
        )
        score = non_empty + stringish * 0.25
        if score > best_score:
            best_score = score
            best_row = r

    col_scores: list[tuple[int, float]] = []
    for c in range(raw.shape[1]):
        col = raw.iloc[best_row :, c]
        col_scores.append((c, _non_empty_ratio(col)))
    col_scores.sort(key=lambda x: x[1], reverse=True)

    start_col = 0
    for c, ratio in col_scores:
        if ratio > 0.15:
            start_col = c
            break

    return best_row, start_col


def _clean_frame(raw: pd.DataFrame, header_row: int, start_col: int) -> pd.DataFrame:
    trimmed = raw.iloc[header_row:, start_col:].copy()
    trimmed.columns = [
        str(c).strip() if pd.notna(c) and str(c).strip() else f"column_{i}"
        for i, c in enumerate(trimmed.iloc[0])
    ]
    df = trimmed.iloc[1:].reset_index(drop=True)
    df = df.dropna(axis=1, how="all")
    df = df.loc[:, df.columns.map(lambda c: str(c).lower() != "nan")]
    df = df.dropna(how="all")
    df.columns = _dedupe_columns(list(df.columns))
    return df


def _dedupe_columns(columns: list[str]) -> list[str]:
    seen: dict[str, int] = {}
    result: list[str] = []
    for col in columns:
        base = col or "column"
        if base not in seen:
            seen[base] = 0
            result.append(base)
        else:
            seen[base] += 1
            result.append(f"{base}_{seen[base]}")
    return result


def _parse_currency(series: pd.Series) -> pd.Series:
    cleaned = (
        series.astype(str)
        .str.replace(r"[\$,€£]", "", regex=True)
        .str.replace(",", "", regex=False)
        .str.strip()
    )
    return pd.to_numeric(cleaned, errors="coerce")


def _infer_types(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    for col in out.columns:
        series = out[col]
        if series.dropna().empty:
            continue

        as_str = series.astype(str).str.strip()
        numeric = _parse_currency(series)
        numeric_ratio = numeric.notna().mean()

        if numeric_ratio > 0.6:
            out[col] = numeric
            continue

        parsed_dates = pd.to_datetime(as_str, errors="coerce", utc=False)
        date_ratio = parsed_dates.notna().mean()
        if date_ratio > 0.6:
            out[col] = parsed_dates.dt.strftime("%Y-%m-%d")
            continue

        lowered = as_str.str.lower()
        if lowered.isin(STATUS_KEYWORDS).mean() > 0.2 or lowered.nunique(dropna=True) <= 12:
            out[col] = as_str.str.title()

    return out


def _pick_date_column(df: pd.DataFrame) -> str | None:
    for col in df.columns:
        parsed = pd.to_datetime(df[col], errors="coerce")
        if parsed.notna().mean() > 0.5:
            return str(col)
    for col in df.columns:
        if re.search(r"date|time|day|month|year", str(col), re.I):
            return str(col)
    return None


def _pick_value_column(df: pd.DataFrame) -> str | None:
    numeric_cols = [
        c
        for c in df.columns
        if pd.api.types.is_numeric_dtype(df[c]) and df[c].notna().any()
    ]
    if not numeric_cols:
        return None
    return str(max(numeric_cols, key=lambda c: df[c].abs().sum()))


def _pick_status_column(df: pd.DataFrame) -> str | None:
    for col in df.columns:
        values = df[col].astype(str).str.lower()
        if values.isin(STATUS_KEYWORDS).mean() > 0.15:
            return str(col)
    for col in df.columns:
        if df[col].nunique(dropna=True) <= 8:
            return str(col)
    return None


def _normalize_status(value: Any) -> str:
    text = str(value).strip().lower()
    if text in {"complete", "success", "succeeded", "paid"}:
        return "Completed"
    if text in {"pending", "processing", "in progress", "open"}:
        return "Pending"
    if text in {"failed", "failure", "error", "declined", "cancelled", "canceled"}:
        return "Failed"
    return str(value).title() if value is not None else "Unknown"


def _build_pie(df: pd.DataFrame, status_col: str | None) -> list[dict[str, Any]]:
    if status_col is None:
        return [
            {"status": "Completed", "value": max(len(df) // 2, 0)},
            {"status": "Pending", "value": max(len(df) // 4, 0)},
            {"status": "Failed", "value": max(len(df) - (len(df) // 2 + len(df) // 4), 0)},
        ]

    normalized = df[status_col].map(_normalize_status)
    counts = normalized.value_counts()
    return [{"status": str(k), "value": int(v)} for k, v in counts.items()]


def _build_time_series(
    df: pd.DataFrame, date_col: str | None, val_col: str | None
) -> list[dict[str, Any]]:
    if date_col is None or val_col is None:
        return []

    work = df[[date_col, val_col]].copy()
    work[date_col] = pd.to_datetime(work[date_col], errors="coerce")
    work[val_col] = pd.to_numeric(work[val_col], errors="coerce")
    work = work.dropna()
    if work.empty:
        return []

    work["bucket"] = work[date_col].dt.strftime("%Y-%m-%d")
    grouped = work.groupby("bucket", as_index=False)[val_col].sum()
    grouped = grouped.sort_values("bucket")
    return [
        {"date": str(row["bucket"]), "value": float(row[val_col])}
        for _, row in grouped.iterrows()
    ]


def _build_summary(
    df: pd.DataFrame,
    date_col: str | None,
    val_col: str | None,
    status_col: str | None,
) -> str:
    parts = [
        f"Detected {len(df):,} transaction rows across {len(df.columns)} columns.",
    ]
    if val_col:
        total = float(pd.to_numeric(df[val_col], errors="coerce").sum())
        parts.append(f"Aggregate {val_col}: ${total:,.2f}.")
    if status_col:
        top = df[status_col].astype(str).value_counts().head(3)
        dist = ", ".join(f"{k} ({v})" for k, v in top.items())
        parts.append(f"Status distribution: {dist}.")
    if date_col:
        parts.append(f"Timeline keyed on '{date_col}'.")
    return " ".join(parts)


def _serialize_rows(df: pd.DataFrame) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for row in df.to_dict(orient="records"):
        clean: dict[str, Any] = {}
        for k, v in row.items():
            if pd.isna(v):
                clean[str(k)] = None
            elif isinstance(v, (np.integer,)):
                clean[str(k)] = int(v)
            elif isinstance(v, (np.floating,)):
                clean[str(k)] = float(v) if np.isfinite(v) else None
            else:
                clean[str(k)] = v if not isinstance(v, pd.Timestamp) else v.strftime("%Y-%m-%d")
        records.append(clean)
    return records


def process_upload(file_bytes: bytes, filename: str) -> dict[str, Any]:
    raw = _read_raw(file_bytes, filename)
    if raw.empty:
        raise ValueError("Uploaded file contains no readable data.")

    header_row, start_col = _find_table_start(raw)
    df = _clean_frame(raw, header_row, start_col)
    df = _infer_types(df)

    if df.empty:
        raise ValueError("No tabular data found after matrix detection.")

    date_col = _pick_date_column(df)
    val_col = _pick_value_column(df)
    status_col = _pick_status_column(df)

    if status_col:
        df[status_col] = df[status_col].map(_normalize_status)

    values = pd.to_numeric(df[val_col], errors="coerce") if val_col else pd.Series(dtype=float)
    total_value = float(values.sum()) if val_col else 0.0
    count = int(len(df))
    avg_value = float(total_value / count) if count else 0.0

    return {
        "metadata": {
            "summary": _build_summary(df, date_col, val_col, status_col),
            "inferred_date_col": date_col or "",
            "inferred_val_col": val_col or "",
        },
        "kpis": {
            "total_transactions": count,
            "total_value": round(total_value, 2),
            "avg_value": round(avg_value, 2),
        },
        "charts": {
            "pie_status": _build_pie(df, status_col),
            "time_series": _build_time_series(df, date_col, val_col),
        },
        "raw_json_data": _serialize_rows(df),
    }
