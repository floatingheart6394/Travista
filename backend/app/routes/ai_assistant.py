from fastapi import APIRouter
from app.schemas.ai_assistant import AIChatRequest, AIChatResponse

router = APIRouter(
    prefix="/ai",
    tags=["AI Assistant"]
)

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_ai(payload: AIChatRequest):
    # TEMP response (AI teammate will replace logic)
    reply = (
        "🤖 Tavi AI backend is ready!\n\n"
        f"You asked: '{payload.message}'\n\n"
        "RAG-based intelligent responses coming soon."
    )
    return {"reply": reply}
