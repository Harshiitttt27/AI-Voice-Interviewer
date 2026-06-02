from sqlalchemy import Column, Integer, Float, String, ForeignKey
from app.core.database import Base


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)

    answer_id = Column(Integer, ForeignKey("answers.id"))

    technical_score = Column(Float)
    communication_score = Column(Float)
    confidence_score = Column(Float)

    feedback = Column(String)
    followup_question = Column(String)