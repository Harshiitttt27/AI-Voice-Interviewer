from pydantic import BaseModel


class AnswerResponse(BaseModel):
    question_id: int
    transcript: str
    technical_score: float
    communication_score: float
    confidence_score: float
    feedback: str
    followup_question: str