from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text, text
from app.database import Base

class ProfilePicture(Base):
    __tablename__ = "profile_pictures"
    __table_args__ = {"schema": "auth"}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("auth.users.id", ondelete="CASCADE"), nullable=False, index=True)
    # Store full data URLs; base64 strings exceed 500 chars
    image_url = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
