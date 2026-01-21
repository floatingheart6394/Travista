from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class TripCreate(BaseModel):
    destination: str
    duration: int
    travelers: int
    budget: float
    trip_styles: List[str] = []
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class TripResponse(TripCreate):
    id: int

    class Config:
        from_attributes = True
