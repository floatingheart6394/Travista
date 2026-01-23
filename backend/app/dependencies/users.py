from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.dependencies.auth import get_current_user_id

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/me")
async def get_my_profile(
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalars().first()

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email
    }
