"""
JWT access token and refresh token creation/verification.
Access token  → short-lived (15 min), carries user identity + role
Refresh token → long-lived (7 days), stored in DB for invalidation
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt

from app.config import settings


# ──────────────────────────────────────────────────────────────────────────────
# Token creation
# ──────────────────────────────────────────────────────────────────────────────

def create_access_token(user_id: str, role: str, owner_id: Optional[str] = None) -> str:
    """
    Create a short-lived JWT access token.

    Payload:
        sub  — user's MongoDB _id (string)
        role — "owner" | "driver"
        owner_id — populated only for drivers (which owner they belong to)
        exp  — expiry timestamp
        type — "access" (to distinguish from refresh tokens)
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "role": role,
        "type": "access",
        "exp": expire,
    }
    if owner_id:
        payload["owner_id"] = owner_id

    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    """
    Create a long-lived JWT refresh token.
    Minimal payload — only user ID and expiry.
    The token is also stored in DB so it can be revoked on logout.
    """
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": user_id,
        "type": "refresh",
        "exp": expire,
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


# ──────────────────────────────────────────────────────────────────────────────
# Token decoding
# ──────────────────────────────────────────────────────────────────────────────

def decode_access_token(token: str) -> dict:
    """
    Decode and validate an access token.
    Raises JWTError if invalid or expired.
    Returns the full payload dict.
    """
    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    if payload.get("type") != "access":
        raise JWTError("Not an access token")
    return payload


def decode_refresh_token(token: str) -> dict:
    """
    Decode and validate a refresh token.
    Raises JWTError if invalid or expired.
    """
    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    if payload.get("type") != "refresh":
        raise JWTError("Not a refresh token")
    return payload


def get_refresh_token_expiry() -> datetime:
    """Return the expiry datetime for a fresh refresh token (for DB storage)."""
    return datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
