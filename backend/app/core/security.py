"""
This file handles security utilities, including password hashing, password verification,
and JWT access/refresh token generation and verification.
It uses passlib with bcrypt for password safety, and python-jose for token management.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

# Setup password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Signature configuration
ALGORITHM = "HS256"

def get_password_hash(password: str) -> str:
    """
    Hash a plaintext password using bcrypt.
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify if a plaintext password matches the hashed password.
    """
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Generate a JWT Access Token.
    By default, access tokens expire in ACCESS_TOKEN_EXPIRE_MINUTES minutes.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Generate a JWT Refresh Token.
    Usually refresh tokens have longer expiration periods than access tokens.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Defaults to 30 days for refresh token
        expire = datetime.now(timezone.utc) + timedelta(days=30)
    
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    """
    Decode and verify a JWT token.
    Returns the subject (sub) claim if the token is valid, otherwise returns None.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        token_type = payload.get("type")
        # Ensure we only verify access tokens for route authorization
        if token_type != "access":
            return None
        subject: str = payload.get("sub")
        if subject is None:
            return None
        return subject
    except JWTError:
        return None
