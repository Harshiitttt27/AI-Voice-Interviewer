from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.core.database import Base


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))  

    role = Column(String, nullable=False)
    level = Column(String, nullable=False)

    status = Column(String, default="active")

    created_at = Column(DateTime, default=datetime.utcnow)