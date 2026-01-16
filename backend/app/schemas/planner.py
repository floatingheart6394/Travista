from pydantic import BaseModel, Field
from typing import List

class TripPlannerRequest(BaseModel):
    destination: str = Field(..., min_length=1)
    duration: int = Field(..., ge=1)
    budget: float = Field(..., ge=0)
    travelers: int = Field(..., ge=1)
    trip_styles: List[str]


class TripPlannerResponse(BaseModel):
    itinerary: str
