from app.core.openai_client import ask_openai

def generate_answer(question: str, context: str) -> str:
    """
    Generates answer using LLM with retrieved context.
    """

    prompt = f"""
You are an intelligent travel assistant.

Answer the question strictly using the context below.
If the answer is not in the context, say "I don't have enough information".

Context:
{context}

Question:
{question}

Answer:
"""

    return ask_openai(prompt)
