from ..core.openai_client import ask_openai

def generate_answer(question: str, context: str) -> str:
    """
    Generates answer using LLM with retrieved context.
    Handles both travel questions and app-feature questions intelligently.
    """
    
    # Determine if this is an app-related question
    app_keywords = ["travista", "add expense", "add trip", "add todo", "budget", "how to use", 
                    "feature", "dashboard", "profile", "emergency", "scan receipt", "planner"]
    is_app_question = any(keyword in question.lower() for keyword in app_keywords)

    if is_app_question:
        # Handle app-specific questions with built-in knowledge
        prompt = f"""
You are Tavi, the AI assistant for Travista - a travel planning and expense tracking app.

Answer this question about the Travista app features in 2-3 sentences:

Question: {question}

App Features Guide:
- Budget/Expenses: Navigate to Budget page, click "Add Expense" button, or scan receipts using the camera icon
- Trip Planner: Go to Planner page to create trips, set destinations, dates, and budgets
- Todo List: Use Todo page to create and track tasks for your trips
- Emergency: Access Emergency page for nearby hospitals, police stations, and emergency contacts
- AI Assistant: Ask me travel questions, get destination advice, and upload travel documents
- Profile: Manage your account settings and preferences

Answer:
"""
    else:
        # Handle travel questions using RAG context
        if context.strip():
            prompt = f"""
You are Tavi, a friendly travel assistant for the Travista app.

Using the context below, answer the question in 2-4 sentences. Be helpful and conversational.
If the exact answer isn't in the context but you have general travel knowledge, provide a helpful response.

Context:
{context}

Question: {question}

Answer:
"""
        else:
            # Fallback when no context is retrieved
            prompt = f"""
You are Tavi, a knowledgeable travel assistant for the Travista app.

Answer this travel question in 2-4 sentences using your general knowledge.
Be helpful, specific, and provide actionable information.

Question: {question}

Answer:
"""

    return ask_openai(prompt)
