from passlib.context import CryptContext
import hashlib

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str):
    # FIX: avoid bcrypt 72-byte crash
    safe_password = hashlib.sha256(password.encode()).hexdigest()
    return pwd_context.hash(safe_password)


def verify_password(plain_password, hashed_password):
    safe_password = hashlib.sha256(plain_password.encode()).hexdigest()
    return pwd_context.verify(safe_password, hashed_password)