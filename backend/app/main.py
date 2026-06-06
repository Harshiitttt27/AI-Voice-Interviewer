from fastapi import FastAPI

from app.api import interview
from app.api import auth
from app.api import resume

app = FastAPI(title="Voice AI Interviewer")

app.include_router(auth.router)
app.include_router(interview.router)
app.include_router(resume.router)