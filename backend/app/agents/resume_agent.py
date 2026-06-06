import pdfplumber
import json
from groq import Groq
from app.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)


# -----------------------------
# Extract text from PDF
# -----------------------------
def extract_text_from_pdf(file_path: str):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


# -----------------------------
# Resume AI Agent
# -----------------------------
def analyze_resume(file_path: str):
    resume_text = extract_text_from_pdf(file_path)

    prompt = f"""
You are an expert resume analysis AI.

Extract structured information ONLY in JSON format:

{{
  "skills": [],
  "experience_level": "fresher | junior | mid | senior",
  "suggested_role": "",
  "domains": []
}}

Rules:
- Return ONLY valid JSON
- No explanation
- No markdown

Resume:
{resume_text}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You extract structured resume data."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )

    content = response.choices[0].message.content.strip()

    try:
        return json.loads(content)
    except:
        return {
            "skills": [],
            "experience_level": "fresher",
            "suggested_role": "unknown",
            "domains": []
        }