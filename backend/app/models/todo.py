from sqlalchemy import (
    Column, Integer, String, Boolean, ForeignKey, DateTime
)
from sqlalchemy.sql import func
from ..database import Base


class Todo(Base):
    __tablename__ = "todos"
    __table_args__ = {"schema": "todo"}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("auth.users.id"), nullable=False)

    title = Column(String(255), nullable=False)
    description = Column(String, nullable=True)

    category = Column(String(50))
    group = Column(String(50))
    priority = Column(String(20))

    due_at = Column(DateTime(timezone=True), nullable=True)
    remind_at = Column(DateTime(timezone=True), nullable=True)

    is_done = Column(Boolean, default=False)
    is_important = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

