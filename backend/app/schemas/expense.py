from pydantic import BaseModel
from datetime import date
from typing import Optional

class ExpenseCreate(BaseModel):
    trip_id: int
    place: str
    amount: float
    category: str
    date: date               # ✅ date-only; avoids timezone shifts in day calculations
    source: Optional[str] = "manual"
    ocr_confidence: Optional[float] = None  # Confidence score from OCR (0-100)

class ExpenseResponse(ExpenseCreate):
    id: int

    class Config:
        from_attributes = True
