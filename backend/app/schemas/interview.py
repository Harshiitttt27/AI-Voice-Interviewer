from pydantic import BaseModel


class InterviewStartRequest(BaseModel):
    role: str
    level: str


class InterviewStartResponse(BaseModel):
    session_id: int
    question_id: int
    question: str