from fastapi import APIRouter
from app.schemas.ai_assistant import AIChatRequest, AIChatResponse
from app.core.openai_client import ask_openai

router = APIRouter(
    prefix="/ai",
    tags=["AI Assistant"]
)

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_ai(payload: AIChatRequest):
    reply = ask_openai(payload.message)
    return {"reply": reply}

