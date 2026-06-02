# utils/hash.py

import hashlib

def get_hash(text: str):
    return hashlib.sha256(text.strip().lower().encode()).hexdigest()