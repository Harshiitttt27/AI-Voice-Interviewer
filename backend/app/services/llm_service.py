# services/llm_service.py

import json
from groq import Groq
from app.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)


# -----------------------------
# 1. ROLE → TOPICS MAP
# -----------------------------
ROLE_TOPICS = {
    "software_engineer": [
        "Programming basics",
        "OOP concepts",
        "DBMS basics",
        "OS basics",
        "Networking basics",
        "API concepts"
    ],

    "hr": [
        "Communication skills",
        "Behavioral questions",
        "Teamwork",
        "Leadership",
        "Conflict handling"
    ],

    "sales": [
        "Customer handling",
        "Negotiation",
        "Communication skills",
        "Problem solving"
    ],

    "support": [
        "Customer support",
        "Problem solving",
        "Communication clarity"
    ],

    "default": [
        "General reasoning",
        "Communication",
        "Problem solving"
    ]
}


# -----------------------------
# 2. MAIN FUNCTION
# -----------------------------
def generate_question(role: str, level: str, previous_questions: list):

    # pick topics based on role
    topics = ROLE_TOPICS.get(role.lower(), ROLE_TOPICS["default"])

    # last 20 questions for memory
    used_text = "\n".join(f"- {q}" for q in previous_questions[-20:])

    prompt = f"""
You are a VOICE interview question generator.

STRICT RULES:
- NO coding questions
- NO system design questions
- NO writing code
- NO repetition of previous questions
- ONLY theory or behavioral questions
- Must be easy to speak (voice interview)

Candidate Role: {role}
Level: {level}

Allowed Topics:
{topics}

Previously asked questions:
{used_text}

Generate ONE NEW UNIQUE QUESTION.

Return ONLY valid JSON:
{{
  "question": "string",
  "difficulty": "easy | medium | hard"
}}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,   # low = less repetition
        top_p=0.8
    )

    content = response.choices[0].message.content

    try:
        return json.loads(content)
    except:
        return {
            "question": content,
            "difficulty": "easy"
        }