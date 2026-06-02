from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)

    question_id = Column(Integer, ForeignKey("questions.id"))

    transcript = Column(String)

    audio_path = Column(String)