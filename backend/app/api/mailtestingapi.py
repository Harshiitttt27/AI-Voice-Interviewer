from fastapi import APIRouter

from app.services.email_service import EmailService

router = APIRouter(
    prefix="/mail",
    tags=["Mail Testing"]
)


@router.get("/test")
def test_email():

    feedback_summary = {
        "overall_score": 7.5,
        "average_scores": {
            "technical": 7.0,
            "communication": 8.0,
            "confidence": 7.5
        },
        "overall_summary": (
            "The candidate demonstrated good communication "
            "skills and confidence throughout the interview."
        ),
        "strengths": [
            "Clear communication",
            "Good confidence",
            "Ability to explain concepts"
        ],
        "weaknesses": [
            "Technical depth",
            "System design knowledge"
        ],
        "improvement_plan": [
            "Practice DSA problems",
            "Study System Design",
            "Work on technical explanations"
        ],
        "hiring_recommendation": "Proceed to next round"
    }

    try:
        EmailService.send_feedback_email(
            recipient_email="YOUR_EMAIL@gmail.com",
            candidate_name="Vansh",
            feedback_summary=feedback_summary
        )

        return {
            "success": True,
            "message": "Email sent successfully"
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }