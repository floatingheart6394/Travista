from dotenv import load_dotenv
load_dotenv()


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.rag.pipeline import initialize_rag


from app.database import engine, Base
from app.routes import auth, users, todo, emergency_contact, ai_assistant, planner, expense, trip

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
        await conn.run_sync(Base.metadata.create_all)
    initialize_rag("app/rag/data")

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
