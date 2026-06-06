import json
from groq import Groq
from app.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)


def evaluate_answer(question: str, answer: str):
    """
    Evaluates interview answer and returns clean structured JSON
    """

    prompt = f"""
You are a strict FAANG interview evaluator.

Return ONLY valid JSON (no markdown, no code block, no explanation).

Schema:
{{
  "technical_score": number (0-10),
  "communication_score": number (0-10),
  "confidence_score": number (0-10),
  "feedback": string,
}}

Rules:
- Be strict and realistic
- Do NOT wrap response in ``` or text
- Output ONLY JSON

Question:
{question}

Answer:
{answer}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",   # ✅ valid model
            messages=[
                {"role": "system", "content": "You are a strict interview evaluator."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )

        content = response.choices[0].message.content.strip()

        # -------------------------
        # SAFE JSON CLEANING
        # -------------------------
        if "```" in content:
            content = content.replace("```json", "").replace("```", "").strip()

        return json.loads(content)

    except Exception as e:
        return {
            "technical_score": 0,
            "communication_score": 0,
            "confidence_score": 0,
            "feedback": f"Evaluation failed: {str(e)}"
        }