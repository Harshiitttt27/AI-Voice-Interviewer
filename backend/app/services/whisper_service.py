from groq import Groq
from app.core.config import settings

# Initialize Groq client
client = Groq(api_key=settings.GROQ_API_KEY)


def transcribe_audio(file_path: str) -> str:
    """
    Convert speech audio → text using Groq Whisper model
    """

    try:
        audio_file = open(file_path, "rb")

        response = client.audio.transcriptions.create(
            file=audio_file,
            model="whisper-large-v3-turbo",
            language="en"
        )

        return response.text

    except Exception as e:
        print(f"Whisper error: {str(e)}")
        return ""

    finally:
        if 'audio_file' in locals():
            audio_file.close()