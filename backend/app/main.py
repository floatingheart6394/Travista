import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .rag.pipeline import initialize_rag
from .database import engine, Base
from .routes import auth, users, todo, emergency_contact, ai_assistant, planner, expense, trip


app = FastAPI(title="Travista Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # Create schemas first
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS auth"))
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS trip"))
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS expense"))
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS todo"))
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS emergency"))
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS planner"))
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS users"))
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS budget"))

        # Create tables
        await conn.run_sync(Base.metadata.create_all)

        # Schema updates
        await conn.execute(text(
            "ALTER TABLE IF EXISTS trip.trips ADD COLUMN IF NOT EXISTS start_date DATE"
        ))
        await conn.execute(text(
            "ALTER TABLE IF EXISTS trip.trips ADD COLUMN IF NOT EXISTS end_date DATE"
        ))
        await conn.execute(text(
            "ALTER TABLE IF EXISTS trip.trips ADD COLUMN IF NOT EXISTS itinerary TEXT"
        ))
        await conn.execute(text(
            "ALTER TABLE IF EXISTS auth.profile_pictures ALTER COLUMN image_url TYPE TEXT"
        ))

    if os.getenv("ENABLE_RAG", "true").lower() == "true":
        try:
            initialize_rag("rag/data")
        except Exception as e:
            print(f"⚠ RAG initialization skipped: {e}")
    else:
        print("ℹ RAG initialization disabled via ENABLE_RAG=false")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(todo.router)
app.include_router(emergency_contact.router)
app.include_router(ai_assistant.router)
app.include_router(planner.router)
app.include_router(expense.router)
app.include_router(trip.router)


@app.get("/")
async def root():
    return {"status": "Backend running"}
