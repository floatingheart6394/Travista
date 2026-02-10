from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.sql import func
from ..database import Base

class Expense(Base):
    __tablename__ = "expenses"
    __table_args__ = {"schema": "budget"}

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("auth.users.id", ondelete="CASCADE"),
        nullable=False
    )

    trip_id = Column(
        Integer,
        ForeignKey("trip.trips.id", ondelete="CASCADE"),
        nullable=False
    )

    place = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    date = Column(Date, server_default=func.current_date())
    source = Column(String, default="manual")
