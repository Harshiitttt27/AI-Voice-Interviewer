from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
import os
import uuid
import shutil

from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.agents.resume_agent import analyze_resume
from app.services.interview_service import (
    start_resume_interview
)
from app.models.interview import InterviewSession

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):

    # -------------------------
    # Save file
    # -------------------------
    upload_dir = "resumes"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, f"{uuid.uuid4()}.pdf")

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # -------------------------
    # AI Resume Analysis
    # -------------------------
    resume_data = analyze_resume(file_path)

    return start_resume_interview(
    db=db,
    user_id=user_id,
    resume_context=resume_data
)

## =========================
# GET RESUME CONTEXT
@router.get("/session/{session_id}")
def get_resume_context(session_id: int, db: Session = Depends(get_db)):

    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id
    ).first()

    if not session:
        return {"error": "Session not found"}

    return {
        "resume_context": session.resume_context,
        "is_resume_interview": session.resume_context is not None
    }