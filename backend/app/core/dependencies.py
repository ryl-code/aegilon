"""
This file defines FastAPI dependency injection utilities.
It handles extracting the current user from JWT tokens, verifying account status,
and performing RBAC checks for admins and analysts.
"""

import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.config import settings
from app.core.security import verify_token
from app.core.rbac import RoleChecker
from app.models.user import User

# OAuth2 Password Bearer flow to retrieve JWT token from Authorization header
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    description="Bearer JWT token required for authentication"
)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependency to fetch the authenticated user from the database.
    Checks JWT validity, extracts subject (user_id), and confirms account is active.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verify token signature and retrieve the user ID string from claims
    user_id_str = verify_token(token)
    if not user_id_str:
        raise credentials_exception
        
    try:
        user_id_uuid = uuid.UUID(user_id_str)
    except ValueError:
        raise credentials_exception

    # Query the user from the database directly using select
    # This keeps our dependencies decoupled from the repository layer during initialization
    result = await db.execute(select(User).where(User.user_id == user_id_uuid))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )
        
    return user

async def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to verify that the current user has the 'admin' role.
    """
    checker = RoleChecker(["admin"])
    return checker(current_user)

async def get_current_analyst(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency to verify that the current user has the 'analyst' or 'admin' role.
    We allow 'admin' here because admins possess full analyst capabilities (superusers).
    """
    checker = RoleChecker(["admin", "analyst"])
    return checker(current_user)
