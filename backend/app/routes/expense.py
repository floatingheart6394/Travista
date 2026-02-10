from fastapi import APIRouter, Depends, UploadFile, File, Security
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import date
import time
import json
from pathlib import Path

from ..database import get_db
from ..models.expense import Expense
from ..schemas.expense import ExpenseCreate, ExpenseResponse
from ..dependencies.auth import get_current_user_id

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

    # #region agent log
    try:
        log_path = Path("c:/Users/reshm/travista_cursor/Travista/.cursor/debug.log")
        log_entry = {
            "sessionId": "debug-session",
            "runId": "amount-issue",
            "hypothesisId": "B1",
            "location": "expense.py:add_expense",
            "message": "Received expense payload",
            "data": {
                "place": payload_dict.get("place"),
                "amount": payload_dict.get("amount"),
                "category": payload_dict.get("category"),
                "date": str(payload_dict.get("date")),
                "trip_id": payload_dict.get("trip_id"),
                "source": payload_dict.get("source"),
            },
            "timestamp": int(time.time() * 1000),
        }
        log_path.parent.mkdir(parents=True, exist_ok=True)
        with log_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception:
        pass
    # #endregion

    exp = Expense(**payload_dict, user_id=current_user)
    db.add(exp)
    await db.commit()
    await db.refresh(exp)

    # #region agent log
    try:
        log_path = Path("c:/Users/reshm/travista_cursor/Travista/.cursor/debug.log")
        log_entry = {
            "sessionId": "debug-session",
            "runId": "amount-issue",
            "hypothesisId": "B2",
            "location": "expense.py:add_expense",
            "message": "Stored expense",
            "data": {
                "id": exp.id,
                "amount": exp.amount,
                "date": str(exp.date),
                "source": exp.source,
            },
            "timestamp": int(time.time() * 1000),
        }
        with log_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception:
        pass
    # #endregion

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

# 📄 Get all expenses for user (past records)
@router.get("/all-expenses", response_model=list[ExpenseResponse])
async def get_all_expenses(
    db: AsyncSession = Depends(get_db),
    user_id: int = Security(get_current_user_id),
):
    """Get all expenses for the user across all trips."""
    res = await db.execute(
        select(Expense)
        .where(Expense.user_id == user_id)
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
