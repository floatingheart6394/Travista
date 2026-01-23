from datetime import timedelta

# ===================== SECURITY =====================
SECRET_KEY = "SUPER_SECRET_CHANGE_THIS_LATER"
ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_DAYS = 30
ACCESS_TOKEN_EXPIRE_DELTA = timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)

# ===================== DATABASE =====================
DATABASE_URL = "postgresql+asyncpg://postgres:root123@localhost:5432/travista"

