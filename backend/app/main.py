from fastapi import FastAPI

from app.api import interview
from app.api import auth

app = FastAPI(title="Voice AI Interviewer")

app.include_router(auth.router)
app.include_router(interview.router)