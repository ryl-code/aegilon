"""
This file defines the authentication router and endpoints for API v1.
It exposes:
- POST /auth/register: Create a new user account (returns wrapped user details).
- POST /auth/login: Authenticate credentials and get JWT access/refresh tokens.
- GET /auth/me: Retrieve current logged-in user profile details.

All endpoints adhere to clean architecture by delegating business logic to the AuthService
and enforcing strict schema validation and response formatting.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, CurrentUserResponse
from app.models.user import User

# APIRouter instance for authentication endpoints
router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    """
    Dependency injection helper to initialize and retrieve the AuthService.
    """
    user_repo = UserRepository(db)
    return AuthService(user_repo)

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Register a new user account.
    Returns a standard wrapped envelope containing the registered user's details.
    """
    user = await auth_service.register(request)
    user_data = CurrentUserResponse.model_validate(user)
    
    return {
        "success": True,
        "data": user_data,
        "message": "User registered successfully",
        "timestamp": datetime.now(timezone.utc)
    }

@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login(
    request: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Authenticate user credentials and return access and refresh JWT tokens.
    Returns the token payload directly at the root for OAuth2 standard compatibility.
    """
    return await auth_service.login(request)

@router.get("/me", status_code=status.HTTP_200_OK)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    """
    Get profile details of the currently authenticated user.
    Returns a standard wrapped envelope containing the user profile.
    """
    user_data = CurrentUserResponse.model_validate(current_user)
    
    return {
        "success": True,
        "data": user_data,
        "message": "User profile retrieved successfully",
        "timestamp": datetime.now(timezone.utc)
    }
