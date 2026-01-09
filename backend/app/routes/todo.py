from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate, TodoOut
from app.dependencies.auth import get_current_user_id

router = APIRouter(
    prefix="/todos",
    tags=["Todos"]
)


@router.post("/", response_model=TodoOut)
async def create_todo(
    payload: TodoCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    todo = Todo(
        user_id=user_id,
        **payload.dict()
    )
    db.add(todo)
    await db.commit()
    await db.refresh(todo)
    return todo


@router.get("/", response_model=list[TodoOut])
async def get_todos(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    result = await db.execute(
        select(Todo).where(Todo.user_id == user_id)
    )
    return result.scalars().all()


@router.patch("/{todo_id}", response_model=TodoOut)
async def update_todo(
    todo_id: int,
    payload: TodoUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    result = await db.execute(
        select(Todo).where(
            Todo.id == todo_id,
            Todo.user_id == user_id
        )
    )
    todo = result.scalar_one_or_none()

    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    for key, value in payload.dict(exclude_unset=True).items():
        setattr(todo, key, value)

    await db.commit()
    await db.refresh(todo)
    return todo


@router.delete("/{todo_id}")
async def delete_todo(
    todo_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    result = await db.execute(
        select(Todo).where(
            Todo.id == todo_id,
            Todo.user_id == user_id
        )
    )
    todo = result.scalar_one_or_none()

    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    await db.delete(todo)
    await db.commit()
    return {"message": "Todo deleted"}
