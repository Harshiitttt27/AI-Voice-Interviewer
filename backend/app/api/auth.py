from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User

from app.auth.auth_handler import hash_password, verify_password
from app.auth.jwt_handler import create_access_token

from app.schemas.auth import RegisterRequest, LoginRequest

router = APIRouter(prefix="/auth", tags=["Auth"])


# =========================
# REGISTER (FIXED)
# =========================
@router.post("/register")
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db)
):

    user_exists = db.query(User).filter(User.email == payload.email).first()

    if user_exists:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_pw = hash_password(payload.password)

    user = User(
        name=payload.name,
        email=payload.email,
        password=hashed_pw
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "User created successfully"}


# =========================
# LOGIN (FIXED)
# =========================
@router.post("/login")
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(User.email == payload.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid password")

    token = create_access_token({"user_id": user.id})

    return {
        "access_token": token,
        "token_type": "bearer"
    }