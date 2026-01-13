from pydantic import BaseModel
from typing import Optional


class EmergencyContactCreate(BaseModel):
    name: str
    phone: str
    relation: Optional[str] = None


class EmergencyContactOut(BaseModel):
    id: int
    name: str
    phone: str
    relation: Optional[str]

    class Config:
        from_attributes = True
