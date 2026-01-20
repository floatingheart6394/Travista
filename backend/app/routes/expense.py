from fastapi import APIRouter, Depends, UploadFile, File, Security
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseResponse
from sqlalchemy.future import select
from datetime import date
from app.dependencies.auth import get_current_user_id

router = APIRouter(prefix="/budget", tags=["Budget"])

# ➕ Add expense (manual or OCR-confirmed)
@router.post("/expense", response_model=ExpenseResponse)
async def add_expense(
    payload: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: int = Security(get_current_user_id),
):
    # Extract only the fields that Expense model accepts
    payload_dict = payload.dict(exclude={"ocr_confidence"})
    exp = Expense(**payload_dict, user_id=current_user)
    db.add(exp)
    await db.commit()
    await db.refresh(exp)
    return exp

# 📄 Get all expenses
@router.get("/expenses", response_model=list[ExpenseResponse])
async def get_expenses(
    trip_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Security(get_current_user_id),
):
    res = await db.execute(
        select(Expense)
        .where(
            Expense.user_id == user_id,
            Expense.trip_id == trip_id
        )
        .order_by(Expense.date.desc())
    )
    return res.scalars().all()


# 🗑️ Delete expense
@router.delete("/expenses/{expense_id}")
async def delete_expense(
    expense_id: int,
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(Expense).where(Expense.id == expense_id))
    exp = res.scalar_one_or_none()
    if not exp:
        return {"detail": "Expense not found"}
    await db.delete(exp)
    await db.commit()
    return {"status": "deleted"}


# 📷 Upload receipt for OCR (AI teammate plugs logic here)
@router.post("/ocr")
async def upload_receipt(file: UploadFile = File(...)):
    """
    AI teammate will:
    - Read image
    - Run OCR
    - Extract fields
    """
    return {
        "place": "Scanned Shop",
        "amount": 480,
        "category": "food",
        "date": str(date.today()),
        "source": "ocr"
    }
