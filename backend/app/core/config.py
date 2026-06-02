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


settings = Settings()