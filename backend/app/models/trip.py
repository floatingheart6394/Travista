from sqlalchemy import Column, String, Integer, Numeric, ForeignKey, Date, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func
from sqlalchemy.types import DateTime

from app.database import Base

class Trip(Base):
    __tablename__ = "trips"
    __table_args__ = {"schema": "trip"}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("auth.users.id"),
        nullable=False
    )

    destination = Column(String, nullable=False)
    duration = Column(Integer, nullable=False)
    travelers = Column(Integer, nullable=False)

    budget = Column(Numeric(10, 2))
    trip_styles = Column(ARRAY(String), default=[])
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    itinerary = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
