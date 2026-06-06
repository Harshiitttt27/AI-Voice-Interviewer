from app.models.question import Question
from app.services.llm_service import generate_question


def generate_next_question(
    db,
    session,
    previous_question: str,
    previous_answer: str
):
    """
    Generates next adaptive interview question based on:
    - session history
    - previous Q/A
    """

    # -------------------------
    # 1. Get previous questions for memory
    # -------------------------
    previous_questions = db.query(
        Question.question_text
    ).filter(
        Question.session_id == session.id
    ).all()

    previous_questions = [q[0] for q in previous_questions]

    # -------------------------
    # 2. Inject context into LLM prompt
    # -------------------------
    context_enhanced_questions = previous_questions[-10:]

    # -------------------------
    # 3. Generate next question (adaptive)
    # -------------------------
    return generate_question(
        role=session.role,
        level=session.level,
        previous_questions=context_enhanced_questions + [
            f"Previous Q: {previous_question}",
            f"Previous A: {previous_answer}"
        ]
    )