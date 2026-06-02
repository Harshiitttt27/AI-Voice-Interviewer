from app.core.database import Base, engine

from app.models.user import User
from app.models.interview import InterviewSession
from app.models.question import Question
from app.models.answer import Answer
from app.models.evaluation import Evaluation

Base.metadata.create_all(bind=engine)

print("All tables created successfully")