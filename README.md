# 🌍 Travista

Travista is an AI-powered travel management platform designed to help users plan, manage, and personalize their travel experiences seamlessly. It combines trip planning, expense tracking, personal profiles, and AI-driven insights into a single platform.

---

## 🚀 Features

### 👤 User Authentication
- Secure signup & login system
- Password hashing (PBKDF2)
- JWT-based authentication

### 🧑‍💼 Profile Management
- Edit profile (name, bio, travel preferences)
- Personal details (contact, emergency info, address)
- Persistent profile storage in database
- Profile photo support (stored separately)

### 🧳 Travel Planning
- Create and manage trips
- Organize itineraries
- Store travel preferences

### 💰 Expense Tracking
- Add and manage trip expenses
- Categorized budgeting
- Expense history per trip

### 🤖 AI Assistant
- AI-based travel suggestions
- Smart recommendations based on user profile
- Context-aware assistance

### ⚙️ Settings & Preferences
- Notification toggles
- AI feature controls
- Local storage for user preferences

---

## 🏗️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Fetch API

### Backend
- FastAPI
- SQLAlchemy (Async)
- PostgreSQL
- Pydantic

### Authentication
- JWT Tokens
- Secure password hashing

---

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/travista.git
cd travista
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
source venv/bin/activate # Mac/Linux
pip install -r requirements.txt
```

### 3. Environment Configuration
Create `.env` in backend:
```
DATABASE_URL=postgresql+asyncpg://username:password@localhost/travista_db
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### 4. Database Setup
```sql
CREATE DATABASE travista_db;
CREATE SCHEMA auth;
CREATE SCHEMA profile;
```

### 5. Run Backend
```bash
uvicorn app.main:app --reload
```

### 6. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

---

## 🔐 Authentication
- Store token in localStorage
- Send in headers:
```
Authorization: Bearer <token>
```

---

## 🧪 Quick Test
1. Signup
2. Login
3. Test profile endpoints

---

## 📄 License

This project was developed as part of our department project expo and is intended for academic and demonstration purposes.
