from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
import shutil
import os
import uuid

from app.core.database import get_db

from app.schemas.interview import InterviewStartRequest
from app.services.whisper_service import transcribe_audio
from app.services.evaluation_service import evaluate_answer
from app.services.interview_service import start_interview  

from app.models.answer import Answer
from app.models.evaluation import Evaluation
from app.models.question import Question
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/interview", tags=["Interview"])


# =========================
# 1. START INTERVIEW
# =========================
@router.post("/start")
def start_interview_api(
    payload: InterviewStartRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):

    return start_interview(
        db=db,
        user_id=user_id,
        role=payload.role,
        level=payload.level
    )


# =========================
# 2. SUBMIT ANSWER
# =========================
@router.post("/answer")
async def submit_answer(
    session_id: int = Form(...),
    question_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):

    # -------------------------
    # 1. Save audio safely
    # -------------------------
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, f"{uuid.uuid4()}.wav")

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # -------------------------
    # 2. Speech → Text (Whisper)
    # -------------------------
    transcript = transcribe_audio(file_path)

    if not transcript:
        return {"error": "Could not transcribe audio"}

    # -------------------------
    # 3. Save Answer
    # -------------------------
    answer = Answer(
        question_id=question_id,
        transcript=transcript,
        audio_path=file_path
    )

    db.add(answer)
    db.commit()
    db.refresh(answer)

    # -------------------------
    # 4. Fetch Question
    # -------------------------
    question = db.query(Question).filter(
        Question.id == question_id
    ).first()

    if not question:
        return {"error": "Question not found"}

    # -------------------------
    # 5. Evaluate Answer (LLM)
    # -------------------------
    evaluation_data = evaluate_answer(
        question=question.question_text,
        answer=transcript
    )

    # safety check (VERY IMPORTANT)
    if not isinstance(evaluation_data, dict):
        evaluation_data = {
            "technical_score": 0,
            "communication_score": 0,
            "confidence_score": 0,
            "feedback": str(evaluation_data),
            "followup_question": ""
        }

    # -------------------------
    # 6. Save Evaluation
    # -------------------------
    evaluation = Evaluation(
        answer_id=answer.id,
        technical_score=evaluation_data.get("technical_score", 0),
        communication_score=evaluation_data.get("communication_score", 0),
        confidence_score=evaluation_data.get("confidence_score", 0),
        feedback=evaluation_data.get("feedback", ""),
        followup_question=evaluation_data.get("followup_question", "")
    )

    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)
    
    
    # -------------------------
    # 7. RESPONSE
    # -------------------------
    return {
        "session_id": session_id,
        "question_id": question_id,
        "transcript": transcript,
        "evaluation": evaluation_data
    }