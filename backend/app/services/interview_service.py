from app.models.question import Question
from app.models.interview import InterviewSession
from app.services.llm_service import generate_question
from app.utils.hash import get_hash


# -----------------------------
# NORMAL INTERVIEW
# -----------------------------
def start_interview(db, user_id: int, role: str, level: str):

    session = InterviewSession(
        user_id=user_id,
        role=role,
        level=level
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    prev_questions = db.query(Question.question_text).filter(
        Question.session_id == session.id
    ).all()

    prev_questions = [q[0] for q in prev_questions]

    question_data = generate_question(
        role, level, prev_questions
    )

    question = Question(
        session_id=session.id,
        question_text=question_data["question"],
        difficulty=question_data.get("difficulty", "medium"),
        question_hash = get_hash(
    question_data["question"] + str(session.id)
),
        order_no=1
    )

    db.add(question)
    db.commit()
    db.refresh(question)

    return {
        "session_id": session.id,
        "question_id": question.id,
        "question": question.question_text,
        "difficulty": question.difficulty
    }


# -----------------------------
# RESUME INTERVIEW
# -----------------------------
def start_resume_interview(db, user_id, resume_context):

    session = InterviewSession(
        user_id=user_id,
        role=resume_context.get("suggested_role", "general"),
        level=resume_context.get("experience_level", "fresher"),
        resume_context=resume_context
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    question_data = generate_question(
        role=session.role,
        level=session.level,
        previous_questions=[],
        context=resume_context
    )

    question = Question(
        session_id=session.id,
        question_text=question_data["question"],
        difficulty=question_data.get("difficulty", "easy"),
        question_hash = get_hash(
    question_data["question"] + str(session.id)
),
        order_no=1
    )

    db.add(question)
    db.commit()
    db.refresh(question)

    return {
        "session_id": session.id,
        "question_id": question.id,
        "question": question.question_text,
        "difficulty": question.difficulty,
        "resume_based": True
    }