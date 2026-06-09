import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import settings


class EmailService:

    @staticmethod
    def send_feedback_email(
        recipient_email: str,
        candidate_name: str,
        feedback_summary: dict
    ):

        subject = "Your AI Interview Feedback Report"

        body = f"""
Hello {candidate_name},

Your interview has been completed.

Overall Score: {feedback_summary.get('overall_score')}/10

Average Scores
--------------
Technical: {feedback_summary['average_scores']['technical']}
Communication: {feedback_summary['average_scores']['communication']}
Confidence: {feedback_summary['average_scores']['confidence']}

Overall Summary
---------------
{feedback_summary.get('overall_summary')}

Strengths
---------
{chr(10).join(f"- {s}" for s in feedback_summary.get('strengths', []))}

Areas of Improvement
--------------------
{chr(10).join(f"- {w}" for w in feedback_summary.get('weaknesses', []))}

Learning Recommendations
-------------------------
{chr(10).join(f"- {i}" for i in feedback_summary.get('improvement_plan', []))}

Hiring Recommendation
---------------------
{feedback_summary.get('hiring_recommendation')}

Thank you for using AI Voice Interviewer.
"""

        message = MIMEMultipart()
        message["From"] = settings.EMAIL_SENDER
        message["To"] = recipient_email
        message["Subject"] = subject

        message.attach(MIMEText(body, "plain"))

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(
                settings.EMAIL_SENDER,
                settings.EMAIL_PASSWORD
            )

            server.send_message(message)
    
    