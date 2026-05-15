# Xcelerate

Turn chaos into clarity — dynamic spreadsheet intelligence with a Next.js dashboard and FastAPI processing pipeline.

## Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Recharts
- **Backend:** FastAPI, pandas, openpyxl

## Quick start

### Backend (port 8000)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend (port 3000)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Upload routes proxy `/api/upload` to the FastAPI service via `next.config.ts`.

## Flow

1. **Landing** (`/`) — `currentStep` state; CTA navigates to upload.
2. **Upload** (`/upload`) — drag/drop or browse `.xlsx`, `.xls`, `.csv`; POST multipart to `/api/upload`.
3. **Dashboard** (`/dashboard`) — KPIs, pie chart, time series, filterable data grid with client-side chart reactivity.

## API contract

`POST /api/upload` returns:

```json
{
  "metadata": { "summary": "", "inferred_date_col": "", "inferred_val_col": "" },
  "kpis": { "total_transactions": 0, "total_value": 0, "avg_value": 0 },
  "charts": {
    "pie_status": [{ "status": "", "value": 0 }],
    "time_series": [{ "date": "", "value": 0 }]
  },
  "raw_json_data": [{}]
}
```
