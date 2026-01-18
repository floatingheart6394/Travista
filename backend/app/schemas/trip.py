from pydantic import BaseModel
from typing import List

class TripCreate(BaseModel):
    destination: str
    duration: int
    travelers: int
    budget: float
    trip_styles: List[str] = []

class TripResponse(TripCreate):
    id: int

    class Config:
        from_attributes = True
