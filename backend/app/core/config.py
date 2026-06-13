from dotenv import load_dotenv
import os

load_dotenv()


class Settings:
    PROJECT_NAME = "Voice AI Interviewer"

    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:password@localhost:5432/voice_interviewer"
    )

    GROQ_API_KEY = os.getenv("GROQ_API_KEY")

    # old SMTP (you can keep or remove later)
    # EMAIL_SENDER = os.getenv("EMAIL_SENDER")
    # EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

    #  NEW (Resend)
    RESEND_API_KEY = os.getenv("RESEND_API_KEY")
    EMAIL_FROM = os.getenv("EMAIL_FROM")


settings = Settings()