from sqlalchemy import Column, Integer, String, Boolean, DateTime, text
from app.database import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "auth"}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, server_default=text("true"))
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
