import type { UploadResponse } from "./types";

export async function uploadSpreadsheet(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let detail = `Upload failed (${response.status})`;
    const text = await response.text();
    if (text) {
      try {
        const body = JSON.parse(text) as {
          detail?: string | { msg?: string }[];
        };
        if (typeof body.detail === "string") detail = body.detail;
        else if (Array.isArray(body.detail)) {
          detail = body.detail.map((d) => d.msg ?? String(d)).join("; ");
        }
      } catch {
        detail = text;
      }
    }
    throw new Error(detail);
  }

  return response.json() as Promise<UploadResponse>;
}
