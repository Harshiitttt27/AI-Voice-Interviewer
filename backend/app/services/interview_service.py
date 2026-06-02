# services/interview_service.py

from app.models.question import Question
from app.models.interview import InterviewSession
from app.services.llm_service import generate_question
from app.utils.hash import get_hash


def start_interview(db, user_id: int, role: str, level: str):

    # 1. Create session
    session = InterviewSession(
        user_id=user_id,
        role=role,
        level=level
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    # 2. Get previous questions for memory
    prev_questions = db.query(Question.question_text).all()
    prev_questions = [q[0] for q in prev_questions]

    # 3. Try generating UNIQUE question (retry loop)
    max_attempts = 5

    for _ in range(max_attempts):

        question_data = generate_question(role, level, prev_questions)

        q_text = question_data["question"]
        q_hash = get_hash(q_text)

        # 4. Check duplicate
        exists = db.query(Question).filter(
            Question.question_hash == q_hash
        ).first()

        if not exists:
            question = Question(
                session_id=session.id,
                question_text=q_text,
                difficulty=question_data.get("difficulty", "medium"),
                question_hash=q_hash
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

    # fallback (rare case)
    raise Exception("Failed to generate unique question after retries")