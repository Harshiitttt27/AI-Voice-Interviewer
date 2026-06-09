from groq import Groq
from app.core.config import settings
import json
import re


class FeedbackAgent:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)

    def _clean_json(self, content: str) -> str:
        """
        Clean LLM response to ensure valid JSON parsing
        """
        if not content:
            return ""

        # remove markdown fences like ```json ``` or ```
        content = re.sub(r"```json|```", "", content).strip()

        return content

    def generate_feedback_summary(self, report_data: dict):

        evaluations = report_data.get("report", [])

        if not evaluations:
            return {
                "overall_score": 0,
                "overall_summary": "No interview data available.",
                "strengths": [],
                "weaknesses": [],
                "improvement_plan": [],
                "hiring_recommendation": "Insufficient Data"
            }

        avg_technical = round(
            sum(item["technical_score"] for item in evaluations) / len(evaluations),
            2
        )

        avg_communication = round(
            sum(item["communication_score"] for item in evaluations) / len(evaluations),
            2
        )

        avg_confidence = round(
            sum(item["confidence_score"] for item in evaluations) / len(evaluations),
            2
        )

        overall_score = round(
            (avg_technical + avg_communication + avg_confidence) / 3,
            2
        )

        feedback_text = "\n".join(
            [
                f"Feedback {i+1}: {item['feedback']}"
                for i, item in enumerate(evaluations)
            ]
        )

        prompt = f"""
You are a strict FAANG-level interview evaluator.

You MUST return ONLY valid JSON.

DO NOT:
- include markdown
- include backticks
- include explanations
- include extra text
- include trailing commas

Return JSON exactly in this format:

{{
    "overall_summary": "string",
    "strengths": ["string", "string", "string"],
    "weaknesses": ["string", "string", "string"],
    "improvement_plan": ["string", "string", "string"],
    "hiring_recommendation": "string"
}}

Interview Scores:
- Technical: {avg_technical}
- Communication: {avg_communication}
- Confidence: {avg_confidence}
- Overall: {overall_score}

Interview Feedback:
{feedback_text}
"""

        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a strict JSON generator. "
                        "Return ONLY valid JSON. No markdown. No text."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,

            # 🔥 IMPORTANT: helps force JSON output (if supported)
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content

        try:
            # clean response
            cleaned = self._clean_json(content)

            ai_summary = json.loads(cleaned)

            return {
                "overall_score": overall_score,
                "average_scores": {
                    "technical": avg_technical,
                    "communication": avg_communication,
                    "confidence": avg_confidence
                },
                "overall_summary": ai_summary.get("overall_summary", ""),
                "strengths": ai_summary.get("strengths", []),
                "weaknesses": ai_summary.get("weaknesses", []),
                "improvement_plan": ai_summary.get("improvement_plan", []),
                "hiring_recommendation": ai_summary.get("hiring_recommendation", "Unable to determine")
            }

        except Exception as e:
            print("❌ JSON Parse Error:", e)
            print("RAW OUTPUT:", content)

            return {
                "overall_score": overall_score,
                "average_scores": {
                    "technical": avg_technical,
                    "communication": avg_communication,
                    "confidence": avg_confidence
                },
                "overall_summary": content,
                "strengths": [],
                "weaknesses": [],
                "improvement_plan": [],
                "hiring_recommendation": "Unable to determine"
            }