"use client";

import { uploadSpreadsheet } from "@/lib/api";
import { STORAGE_KEY } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

const ACCEPT = ".xlsx,.xls,.csv";

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFile = useCallback((next: File | null) => {
    if (!next) {
      setFile(null);
      return;
    }
    const ext = next.name.split(".").pop()?.toLowerCase();
    if (!ext || !["xlsx", "xls", "csv"].includes(ext)) {
      setError("Only .xlsx, .xls, and .csv files are supported.");
      return;
    }
    setError(null);
    setFile(next);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) pickFile(dropped);
    },
    [pickFile],
  );

  const analyze = async () => {
    if (!file) {
      setError("Select a spreadsheet file first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = await uploadSpreadsheet(file);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl">
      <h2 className="mb-1 text-lg font-semibold text-white">File Ingestion Portal</h2>
      <p className="mb-6 text-xs text-gray-500">
        Drop a workbook or browse to begin analysis.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`border border-dashed p-10 transition ${
          dragOver
            ? "border-cyan-400/70 bg-cyan-500/5"
            : "border-gray-600 bg-card"
        }`}
      >
        <p className="text-center text-sm text-gray-400">
          Drag & drop your spreadsheet here
        </p>
        <p className="mt-1 text-center text-[10px] uppercase tracking-wider text-gray-600">
          .xlsx · .xls · .csv
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="border border-gray-600 bg-surface px-5 py-2 text-xs font-medium uppercase tracking-wide text-gray-300 transition hover:border-gray-500 hover:text-white"
          >
            Browse Files
          </button>
          {file && (
            <span className="truncate text-xs text-cyan-400/90">{file.name}</span>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={loading || !file}
        onClick={analyze}
        className="mt-6 w-full border border-cyan-500/50 bg-cyan-500/90 py-3 text-sm font-semibold uppercase tracking-wide text-surface transition enabled:hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Analyzing…" : "Analyze & Generate Dashboard"}
      </button>

      {loading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          Processing sheet matrix…
        </div>
      )}
    </section>
  );
}
