from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.database import get_db
from app.models.user import User
from app.models.profile_picture import ProfilePicture
from app.dependencies.auth import get_current_user_id
from app.schemas.user import ProfileResponse, UpdateProfileRequest

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    pic_result = await db.execute(
        select(ProfilePicture.image_url).where(ProfilePicture.user_id == user_id).order_by(ProfilePicture.id.desc())
    )
    image_url = pic_result.scalar()

    return ProfileResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        is_active=user.is_active,
        profile_image_url=image_url
    )


@router.put("/me", response_model=ProfileResponse)
async def update_my_profile(
    payload: UpdateProfileRequest,
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    print(f"[UPDATE PROFILE] User {user_id}")
    print(f"[UPDATE PROFILE] Payload name: {payload.name}")
    print(f"[UPDATE PROFILE] Payload email: {payload.email}")
    print(f"[UPDATE PROFILE] Payload profile_image_url: {payload.profile_image_url}")
    print(f"[UPDATE PROFILE] profile_image_url length: {len(payload.profile_image_url) if payload.profile_image_url else 0}")
    
    # Fetch current user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # If email is changing, ensure it's not taken by someone else
    if payload.email.lower() != user.email.lower():
        email_check = await db.execute(select(User).where(User.email == payload.email.lower()))
        if email_check.scalars().first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")

    user.name = payload.name
    user.email = payload.email.lower()

    # Upsert profile picture URL in separate table
    if payload.profile_image_url:
        print(f"[UPDATE PROFILE] Saving profile image URL to database")
        # Remove existing rows to keep latest single record
        await db.execute(delete(ProfilePicture).where(ProfilePicture.user_id == user_id))
        db.add(ProfilePicture(user_id=user_id, image_url=payload.profile_image_url))
    else:
        print(f"[UPDATE PROFILE] No profile_image_url, clearing existing")
        # Optional: clear profile picture if empty string provided
        await db.execute(delete(ProfilePicture).where(ProfilePicture.user_id == user_id))

    await db.commit()
    await db.refresh(user)

    # Get latest image url
    pic_result = await db.execute(
        select(ProfilePicture.image_url).where(ProfilePicture.user_id == user_id).order_by(ProfilePicture.id.desc())
    )
    image_url = pic_result.scalar()
    print(f"[UPDATE PROFILE] Retrieved image_url from DB: {image_url}")

    return ProfileResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        is_active=user.is_active,
        profile_image_url=image_url
    )
