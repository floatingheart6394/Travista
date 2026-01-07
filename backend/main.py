from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 🔓 Allow frontend to talk to backend (VERY IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# In-memory "database"
# -------------------------
users_db = []

# -------------------------
# Data Models
# -------------------------
class SignupRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


# -------------------------
# Signup API
# -------------------------
@app.post("/signup")
def signup(user: SignupRequest):
    # Check if user already exists
    for u in users_db:
        if u["email"] == user.email:
            raise HTTPException(status_code=400, detail="User already exists")

    users_db.append({
        "name": user.name,
        "email": user.email,
        "password": user.password  # plaintext for now (expo only)
    })

    return {"message": "User created successfully"}


# -------------------------
# Login API
# -------------------------
@app.post("/login")
def login(user: LoginRequest):
    for u in users_db:
        if u["email"] == user.email and u["password"] == user.password:
            return {"message": "Login successful"}

    raise HTTPException(status_code=401, detail="Invalid email or password")


# -------------------------
# Health check (optional)
# -------------------------
@app.get("/")
def root():
    return {"status": "Backend running"}
