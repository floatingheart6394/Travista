from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routes import auth, users, todo, emergency_contact, ai_assistant

app = FastAPI(title="Travista Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(todo.router)
app.include_router(emergency_contact.router)
app.include_router(ai_assistant.router)

@app.get("/")
async def root():
    return {"status": "Backend running"}
