from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ExpenseCreate(BaseModel):
    trip_id: int
    place: str
    amount: float
    category: str
    date: datetime            # ✅ MATCH frontend
    source: Optional[str] = "manual"

class ExpenseResponse(ExpenseCreate):
    id: int

    class Config:
        from_attributes = True
