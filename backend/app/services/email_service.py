import resend
from app.core.config import settings

resend.api_key = settings.RESEND_API_KEY


class EmailService:

    @staticmethod
    def send_feedback_email(
        recipient_email: str,
        candidate_name: str,
        feedback_summary: dict
    ):

        html = f"""
        <h2>Hello {candidate_name}</h2>
        <p>Your interview has been completed.</p>

        <h3>Score: {feedback_summary.get('overall_score')}/10</h3>

        <ul>
            <li>Technical: {feedback_summary['average_scores']['technical']}</li>
            <li>Communication: {feedback_summary['average_scores']['communication']}</li>
            <li>Confidence: {feedback_summary['average_scores']['confidence']}</li>
        </ul>

        <p>{feedback_summary.get('overall_summary')}</p>
        """

        resend.Emails.send({
            "from": settings.EMAIL_FROM,
            "to": recipient_email,
            "subject": "Your AI Interview Report",
            "html": html
        })