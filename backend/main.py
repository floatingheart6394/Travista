from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#database
users_db = []

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/signup")
def signup(user: SignupRequest):
    for u in users_db:
        if u["email"] == user.email:
            raise HTTPException(status_code=400, detail="User already exists")

    users_db.append({
        "name": user.name,
        "email": user.email,
        "password": user.password
    })

    return {"message": "User created successfully"}

@app.post("/login")
def login(user: LoginRequest):
    for u in users_db:
        if u["email"] == user.email and u["password"] == user.password:
            return {"message": "Login successful"}

    raise HTTPException(status_code=401, detail="Invalid email or password")


@app.get("/")
def root():
    return {"status": "Backend running"}
