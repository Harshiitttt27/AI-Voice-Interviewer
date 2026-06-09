from groq import Groq
from app.core.config import settings
import json


class FeedbackAgent:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)

    def generate_feedback_summary(self, report_data: dict):
        """
        report_data format:
        {
            "session_id": 8,
            "report": [...]
        }
        """

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
            sum(item["technical_score"] for item in evaluations)
            / len(evaluations),
            2
        )

        avg_communication = round(
            sum(item["communication_score"] for item in evaluations)
            / len(evaluations),
            2
        )

        avg_confidence = round(
            sum(item["confidence_score"] for item in evaluations)
            / len(evaluations),
            2
        )

        overall_score = round(
            (
                avg_technical
                + avg_communication
                + avg_confidence
            ) / 3,
            2
        )

        feedback_text = "\n".join(
            [
                f"Feedback {idx + 1}: {item['feedback']}"
                for idx, item in enumerate(evaluations)
            ]
        )

        prompt = f"""
You are an expert technical interview coach.

Analyze the following interview performance.

Average Technical Score: {avg_technical}
Average Communication Score: {avg_communication}
Average Confidence Score: {avg_confidence}
Overall Score: {overall_score}

Interview Feedback:
{feedback_text}

Return ONLY valid JSON in the following format:

{{
    "overall_summary": "...",
    "strengths": [
        "...",
        "...",
        "..."
    ],
    "weaknesses": [
        "...",
        "...",
        "..."
    ],
    "improvement_plan": [
        "...",
        "...",
        "..."
    ],
    "hiring_recommendation": "..."
}}
"""

        response = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a senior FAANG interview coach. "
                        "Always return valid JSON only."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3
        )

        content = response.choices[0].message.content

        try:
            ai_summary = json.loads(content)

            return {
                "overall_score": overall_score,
                "average_scores": {
                    "technical": avg_technical,
                    "communication": avg_communication,
                    "confidence": avg_confidence
                },
                **ai_summary
            }

        except Exception:
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