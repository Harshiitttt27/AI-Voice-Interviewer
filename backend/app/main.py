from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import interview
from app.api import auth
from app.api import resume
from app.api.mailtestingapi import router as mail_router

app = FastAPI(title="Voice AI Interviewer")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],   
    allow_headers=["*"],
)

# routers
app.include_router(auth.router)
app.include_router(interview.router)
app.include_router(resume.router)
app.include_router(mail_router)