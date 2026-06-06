import json
from groq import Groq
from app.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

ROLE_TOPICS = {
    "software_engineer": ["Programming basics", "OOP", "DBMS", "OS", "Networking", "API"],
    "hr": ["Communication", "Behavioral", "Teamwork", "Leadership", "Conflict handling"],
    "sales": ["Customer handling", "Negotiation", "Communication", "Problem solving"],
    "support": ["Customer support", "Problem solving", "Communication clarity"],
    "default": ["General reasoning", "Communication", "Problem solving"]
}


def generate_question(role: str, level: str, previous_questions: list, context: dict = None):

    context = context or {}

    base_topics = ROLE_TOPICS.get(role.lower(), ROLE_TOPICS["default"])

    resume_skills = context.get("skills", [])
    resume_domains = context.get("domains", [])
    experience = context.get("experience_level", "N/A")

    used_text = "\n".join(f"- {q}" for q in previous_questions[-20:])

    prompt = f"""
You are an expert VOICE interview AI.

STRICT RULES:
- No coding
- No system design
- No repetition
- Only theory/behavioral questions
- Must be short and spoken-friendly

Candidate:
Role: {role}
Level: {level}
Experience: {experience}

Base Topics:
{base_topics}

Resume Skills:
{resume_skills}

Domains:
{resume_domains}

Previously asked questions:
{used_text}

Generate ONE new question.

Return ONLY JSON:
{{
  "question": "...",
  "difficulty": "easy | medium | hard"
}}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    content = response.choices[0].message.content

    try:
        return json.loads(content)
    except:
        return {"question": content, "difficulty": "easy"}