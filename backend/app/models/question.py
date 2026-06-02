from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(Integer, ForeignKey("interview_sessions.id"))

    question_text = Column(String, nullable=False)

    order_no = Column(Integer)
    difficulty = Column(String, nullable=True)

    question_hash = Column(String, unique=True, index=True)