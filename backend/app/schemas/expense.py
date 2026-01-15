from pydantic import BaseModel
from datetime import date
from typing import Optional

class ExpenseCreate(BaseModel):
    place: str
    amount: float
    category: str
    date: date
    source: str = "manual"

class ExpenseResponse(ExpenseCreate):
    id: int

    class Config:
        from_attributes = True
