

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
from app.models.interview import InterviewSession
from app.services.next_question_service import generate_next_question
from app.utils.hash import get_hash

from app.agents.feedback_agent import FeedbackAgent
from app.services.email_service import EmailService
from app.models.user import User
from fastapi import BackgroundTasks
from app.core.database import SessionLocal
feedback_agent = FeedbackAgent()




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

import traceback

def process_interview_completion(session_id: int, user_id: int):
    db = SessionLocal()

    try:
        print("🚀 Background task started")

        session = db.query(InterviewSession).filter(
            InterviewSession.id == session_id
        ).first()

        if not session:
            print("❌ Session not found")
            return

        session.status = "completed"
        db.commit()

        evaluations = (
            db.query(Evaluation)
            .join(Answer)
            .join(Question)
            .filter(Question.session_id == session.id)
            .all()
        )

        report_data = {
            "session_id": session.id,
            "report": [
                {
                    "technical_score": e.technical_score,
                    "communication_score": e.communication_score,
                    "confidence_score": e.confidence_score,
                    "feedback": e.feedback
                }
                for e in evaluations
            ]
        }

        print("📊 Report generated")

        feedback_summary = feedback_agent.generate_feedback_summary(report_data)

        print("🧠 AI summary generated")

        user = db.query(User).filter(User.id == user_id).first()

        if user:
            print("📧 Sending email to:", user.email)

            EmailService.send_feedback_email(
                recipient_email=user.email,
                candidate_name=user.name,
                feedback_summary=feedback_summary
            )

            print("✅ Email sent successfully")

        else:
            print("❌ User not found")

    except Exception as e:
        print("❌ Completion error:")
        traceback.print_exc()

    finally:
        db.close()
# =========================
# 2. SUBMIT ANSWER
# =========================
@router.post("/answer")
async def submit_answer(
    background_tasks: BackgroundTasks,
    session_id: int = Form(...),
    question_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
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
    # 5. Evaluate Answer
    # -------------------------
    evaluation_data = evaluate_answer(
        question=question.question_text,
        answer=transcript
    )

    # safety check
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
    # 7. Get Session
    # -------------------------
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id
    ).first()

    if not session:
        return {"error": "Session not found"}

  
    # 8. Check Interview Completion
    # -------------------------
    if session.current_question_no >= session.max_questions:

        session.status = "completed"
        db.commit()

        # Build report data from all evaluations
        evaluations = (
            db.query(Evaluation)
            .join(Answer)
            .join(Question)
            .filter(
                Question.session_id == session.id
            )
            .all()
        )

        report_data = {
            "session_id": session.id,
            "report": [
                {
                    "technical_score": e.technical_score,
                    "communication_score": e.communication_score,
                    "confidence_score": e.confidence_score,
                    "feedback": e.feedback
                }
                for e in evaluations
            ]
        }

        background_tasks.add_task(
            process_interview_completion,
            session.id,
            user_id,
        )

        return {
            "interview_completed": True,
            "email_sent": False,
            "session_id": session.id,
            "evaluation": {
                "technical_score": evaluation.technical_score,
                "communication_score": evaluation.communication_score,
                "confidence_score": evaluation.confidence_score,
                "feedback": evaluation.feedback
            },
            "message": "Report is being generated and will be emailed shortly"
        }

    # -------------------------
    # 9. Increment Question Counter
    # -------------------------
    session.current_question_no += 1
    db.commit()

    
    
    # -------------------------
    # 10. Generate Next Question
    # -------------------------
    next_question_data = generate_next_question(
        db=db,
        session=session,
        previous_answer=transcript,
        previous_question=question.question_text
    )

    # -------------------------
    # 11. Save Next Question
    # -------------------------
    next_question = Question(
        session_id=session.id,
        question_text=next_question_data["question"],
        difficulty=next_question_data.get("difficulty", "medium"),
        order_no=session.current_question_no + 1,
        question_hash=get_hash(next_question_data["question"])
    )

    db.add(next_question)
    db.commit()
    db.refresh(next_question)

    # -------------------------
    # 12. FINAL RESPONSE (VOICE FLOW READY)
    # -------------------------
    return {
        "interview_completed": False,
        "session_id": session.id,

        "evaluation": {
            "technical_score": evaluation.technical_score,
            "communication_score": evaluation.communication_score,
            "confidence_score": evaluation.confidence_score,
            "feedback": evaluation.feedback
        },

        "next_question": {
            "question_id": next_question.id,
            "question": next_question.question_text,
            "difficulty": next_question.difficulty
        }
    }
 # =========================
#  GET ALL SESSIONS FOR USER
# =========================
@router.get("/sessions")
def get_all_sessions(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == user_id
    ).order_by(InterviewSession.id.desc()).all()

    return {
        "total": len(sessions),
        "sessions": [
            {
                "id": s.id,
                "role": s.role,
                "level": s.level,
                "status": s.status,
                "current_question_no": s.current_question_no,
                "max_questions": s.max_questions
            }
            for s in sessions
        ]
    }
## =========================
#  GET SESSION DETAILS
## =========================
@router.get("/session/{session_id}")
def get_session(session_id: int, db: Session = Depends(get_db)):

    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id
    ).first()

    if not session:
        return {"error": "Session not found"}

    latest_question = db.query(Question).filter(
        Question.session_id == session_id
    ).order_by(Question.id.desc()).first()

    return {
        "session_id": session.id,
        "role": session.role,
        "level": session.level,
        "status": session.status,
        "current_question_no": session.current_question_no,
        "max_questions": session.max_questions,
        "resume_mode": session.resume_context is not None,
        "resume_context": session.resume_context,
        "latest_question": {
            "id": latest_question.id if latest_question else None,
            "question": latest_question.question_text if latest_question else None,
            "difficulty": latest_question.difficulty if latest_question else None
        }
    }
## =========================
#  GET ALL QUESTIONS FOR A SESSION
## =========================
@router.get("/session/{session_id}/questions")
def get_session_questions(session_id: int, db: Session = Depends(get_db)):

    questions = db.query(Question).filter(
        Question.session_id == session_id
    ).order_by(Question.id.asc()).all()

    return {
        "session_id": session_id,
        "questions": [
            {
                "id": q.id,
                "question": q.question_text,
                "difficulty": q.difficulty
            }
            for q in questions
        ]
    }

## =========================
#  GET INTERVIEW REPORT
## =========================
@router.get("/session/{session_id}/report")
def get_interview_report(session_id: int, db: Session = Depends(get_db)):

    evaluations = db.query(Evaluation).join(Answer).join(Question).filter(
        Question.session_id == session_id
    ).all()

    if not evaluations:
        return {"message": "No evaluations found"}

    return {
        "session_id": session_id,
        "report": [
            {
                "technical_score": e.technical_score,
                "communication_score": e.communication_score,
                "confidence_score": e.confidence_score,
                "feedback": e.feedback
            }
            for e in evaluations
        ]
    }
# =========================
# DASHBOARD SUMMARY

@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):

    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == user_id
    ).all()

    evaluations = db.query(Evaluation).join(Answer).join(Question).join(InterviewSession).filter(
        InterviewSession.user_id == user_id
    ).all()

    total_interviews = len(sessions)

    if evaluations:
        avg_score = sum(
            (e.technical_score + e.communication_score + e.confidence_score) / 3
            for e in evaluations
        ) / len(evaluations)
    else:
        avg_score = 0

    return {
        "total_interviews": total_interviews,
        "avg_score": round(avg_score, 2),
        "completed": len([s for s in sessions if s.status == "completed"]),
        "active": len([s for s in sessions if s.status != "completed"])
    }


