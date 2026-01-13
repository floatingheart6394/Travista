from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.emergency_contact import EmergencyContact
from app.schemas.emergency_contact import (
    EmergencyContactCreate,
    EmergencyContactOut,
)
from app.dependencies.auth import get_current_user_id


router = APIRouter(
    prefix="/emergency-contacts",
    tags=["Emergency Contacts"]
)


@router.post("/", response_model=EmergencyContactOut)
async def create_emergency_contact(
    payload: EmergencyContactCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    result = await db.execute(
        select(func.count())
        .select_from(EmergencyContact)
        .where(EmergencyContact.user_id == user_id)
    )
    count = result.scalar()

    if count >= 3:
        raise HTTPException(
            status_code=400,
            detail="Maximum of 3 emergency contacts allowed"
        )

    contact = EmergencyContact(
        user_id=user_id,
        **payload.dict()
    )

    db.add(contact)
    await db.commit()
    await db.refresh(contact)

    return contact


@router.get("/", response_model=list[EmergencyContactOut])
async def get_emergency_contact(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    result = await db.execute(
        select(EmergencyContact)
        .where(EmergencyContact.user_id == user_id)
    )
    return result.scalars().all()


@router.delete("/{contact_id}")
async def delete_emergency_contact(
    contact_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    result = await db.execute(
        select(EmergencyContact).where(
            EmergencyContact.id == contact_id,
            EmergencyContact.user_id == user_id
        )
    )
    contact = result.scalar_one_or_none()

    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    await db.delete(contact)
    await db.commit()

    return {"message": "Emergency contact deleted"}
