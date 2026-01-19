from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.user import User
from app.schemas.user import SignupRequest, LoginRequest
from app.core.security import hash_password, verify_password
from app.core.jwt import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# ===================== SIGNUP =====================
@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(
    user: SignupRequest,
    db: AsyncSession = Depends(get_db)
):
    # Check if user exists
    result = await db.execute(
        select(User).where(User.email == user.email)
    )
    existing_user = result.scalars().first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password)
    )

    db.add(new_user)

    try:
        await db.commit()
        await db.refresh(new_user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Signup failed"
        )

    return {
        "message": "User created successfully",
        "id": new_user.id,
        "email": new_user.email
    }

# ===================== LOGIN =====================
@router.post("/login")
async def login(
    user: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).where(User.email == user.email)
    )
    existing_user = result.scalars().first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        existing_user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={"sub": str(existing_user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
