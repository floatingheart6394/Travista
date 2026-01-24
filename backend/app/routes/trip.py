from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models.trip import Trip
from app.schemas.trip import TripCreate, TripResponse
from app.dependencies.auth import get_current_user_id

router = APIRouter(prefix="/trip", tags=["Trip"])

@router.post("/", response_model=TripResponse)
async def create_or_update_trip(
    trip_data: TripCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    result = await db.execute(
        select(Trip)
        .where(Trip.user_id == user_id)
        .order_by(Trip.created_at.desc())
        .limit(1)
    )
    trip = result.scalars().first()

    if trip:
        # update existing trip
        for key, value in trip_data.dict().items():
            setattr(trip, key, value)
    else:
        # create new trip
        trip = Trip(
            user_id=user_id,
            **trip_data.dict()
        )
        db.add(trip)

    await db.commit()
    await db.refresh(trip)
    return trip

@router.get("/", response_model=list[TripResponse])
async def get_trips(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    result = await db.execute(
        select(Trip).where(Trip.user_id == user_id)
    )
    return result.scalars().all()

@router.get("/active", response_model=TripResponse)
async def get_active_trip(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    result = await db.execute(
        select(Trip)
        .where(Trip.user_id == user_id)
        .order_by(Trip.created_at.desc())
        .limit(1)
    )
    trip = result.scalars().first()

    if not trip:
        raise HTTPException(status_code=404, detail="No active trip")

    return trip

@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(trip_id, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Trip).where(Trip.id == trip_id)
    )
    trip = result.scalars().first()

    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    return trip

@router.get("/past/all", response_model=list[TripResponse])
async def get_past_trips(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    """Get all trips (past and current) for the user with their itineraries."""
    result = await db.execute(
        select(Trip)
        .where(Trip.user_id == user_id)
        .order_by(Trip.created_at.desc())
    )
    return result.scalars().all()
