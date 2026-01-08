from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.schemas.user import SignupRequest, LoginRequest
from app.core.security import hash_password, verify_password

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/signup")
async def signup(user: SignupRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(User.email == user.email)
    )
    existing_user = result.scalars().first()

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password)  # 🔐 HASHED
    )

    db.add(new_user)
    await db.commit()

    return {"message": "User created successfully"}

@router.post("/login")
async def login(user: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(User.email == user.email)
    )
    existing_user = result.scalars().first()

    if not existing_user or not verify_password(
        user.password,
        existing_user.password_hash
    ):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {"message": "Login successful"}

