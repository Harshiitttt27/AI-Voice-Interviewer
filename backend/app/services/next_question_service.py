from app.models.question import Question
from app.services.llm_service import generate_question


def generate_next_question(db, session, previous_question: str, previous_answer: str):

    # 1. Get ONLY previous questions (clean memory)
    previous_questions = db.query(Question.question_text).filter(
        Question.session_id == session.id
    ).all()

    previous_questions = [q[0] for q in previous_questions]

    context_questions = previous_questions[-10:]

    # 2. Add AI reasoning signal separately (NOT mixed with memory)
    answer_context = f"""
Previous Q: {previous_question}
Previous A: {previous_answer}
""".strip()

    return generate_question(
        role=session.role,
        level=session.level,
        previous_questions=context_questions,
        context={
            **(session.resume_context or {}),
            "qa_context": answer_context
        }
    )