from pydantic import BaseModel, Field
from typing import List

class TripPlannerRequest(BaseModel):
    destination: str = Field(..., min_length=1)
    duration: int = Field(..., ge=1)
    budget: float = Field(..., ge=0)
    travelers: int = Field(..., ge=1)
    tripStyles: List[str]


class TripPlannerResponse(BaseModel):
    itinerary: str
from fastapi import APIRouter
from app.schemas.planner import TripPlannerRequest, TripPlannerResponse

router = APIRouter(
    prefix="/planner",
    tags=["Trip Planner"]
)

@router.post("/generate", response_model=TripPlannerResponse)
async def generate_itinerary(payload: TripPlannerRequest):
    print("🔥 Planner endpoint hit")
    # TEMP placeholder — AI teammate replaces this logic
    itinerary = f"""
    ✈️ AI Trip Plan for {payload.destination}

    Duration: {payload.duration} days
    Budget: ${payload.budget}
    Travelers: {payload.travelers}
    Style: {", ".join(payload.tripStyles) or "General"}

    Day 1: Arrival & city exploration
    Day 2: Local attractions & food tour
    Day 3+: Customized experiences
    """

    return {"itinerary": itinerary}
