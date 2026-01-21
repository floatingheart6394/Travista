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
                    "Always provide concise, on-task answers about: trip planning, budget/expenses, itinerary guidance, "
                    "popular spots, emergency contacts/spots, and how to use app features. "
                    "If asked about a user's generated itinerary, answer helpfully and suggest adjustments. "
                    "If data is missing, say what you need clearly. Keep answers brief and actionable."
                )
            },
            {"role": "user", "content": prompt}
        ],
        max_tokens=2000,
        temperature=0.7
    )

    return response.choices[0].message.content
