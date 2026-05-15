from typing import Any

from pydantic import BaseModel, Field


class MetadataOut(BaseModel):
    summary: str
    inferred_date_col: str
    inferred_val_col: str


class KpisOut(BaseModel):
    total_transactions: int
    total_value: float
    avg_value: float


class PieStatusOut(BaseModel):
    status: str
    value: int


class TimeSeriesOut(BaseModel):
    date: str
    value: float


class ChartsOut(BaseModel):
    pie_status: list[PieStatusOut]
    time_series: list[TimeSeriesOut]


class UploadResponseOut(BaseModel):
    metadata: MetadataOut
    kpis: KpisOut
    charts: ChartsOut
    raw_json_data: list[dict[str, Any]] = Field(default_factory=list)
