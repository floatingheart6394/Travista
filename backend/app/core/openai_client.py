from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def ask_openai(prompt: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are Tavi, an intelligent travel assistant for the Travista app. "
                    "Provide concise, helpful answers in 2-4 sentences maximum. "
                    "Cover: trip planning, destinations, budgets, expenses, itineraries, app features, and travel advice. "
                    "Be conversational, friendly, and actionable. Avoid lengthy explanations."
                )
            },
            {"role": "user", "content": prompt}
        ],
        max_tokens=300,
        temperature=0.7
    )

    return response.choices[0].message.content
