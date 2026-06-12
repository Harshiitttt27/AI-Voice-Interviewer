
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import interview
from app.api import auth
from app.api import resume
from app.api.mailtestingapi import router as mail_router


from app.core.database import Base, engine

from app.models.user import User
from app.models.interview import InterviewSession
from app.models.question import Question
from app.models.answer import Answer
from app.models.evaluation import Evaluation

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-voice-interviewer-two.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    print("Tables created on Neon DB")

# routers
app.include_router(auth.router)
app.include_router(interview.router)
app.include_router(resume.router)
app.include_router(mail_router)