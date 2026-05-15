from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.processor import process_upload
from app.schemas import UploadResponseOut

app = FastAPI(title="Xcelerate API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/upload", response_model=UploadResponseOut)
async def upload_spreadsheet(file: UploadFile = File(...)) -> UploadResponseOut:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required.")

    lower = file.filename.lower()
    if not lower.endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(
            status_code=400,
            detail="Unsupported format. Use .xlsx, .xls, or .csv.",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")

    try:
        payload = process_upload(content, file.filename)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to process spreadsheet.") from exc

    return UploadResponseOut.model_validate(payload)
