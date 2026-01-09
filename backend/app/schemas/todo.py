from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    group: Optional[str] = None
    priority: Optional[str] = None
    due_at: Optional[datetime] = None
    remind_at: Optional[datetime] = None


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    group: Optional[str] = None
    priority: Optional[str] = None
    is_done: Optional[bool] = None
    is_important: Optional[bool] = None
    due_at: Optional[datetime] = None
    remind_at: Optional[datetime] = None


class TodoOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    category: Optional[str]
    group: Optional[str]
    priority: Optional[str]
    is_done: bool
    is_important: bool
    due_at: Optional[datetime]
    remind_at: Optional[datetime]

    class Config:
        from_attributes = True
