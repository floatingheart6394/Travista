from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base


class EmergencyContact(Base):
    __tablename__ = "emergency_contact"
    __table_args__ = {"schema": "emergency"}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("auth.users.id"), nullable=False)

    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    relation = Column(String(50), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
