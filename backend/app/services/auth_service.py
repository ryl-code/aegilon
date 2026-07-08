"""
This file implements the AuthService.
It orchestrates the business logic for user registration and authentication (login).
It utilizes UserRepository for database access and security functions for hashing/JWT.
"""

from fastapi import HTTPException, status
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
)

class AuthService:
    """
    Service layer class containing auth-related business logic.
    """
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    async def register(self, request: RegisterRequest) -> User:
        """
        Business logic for registering a new user.
        Checks if the username or email is already taken, hashes the password,
        and persists the user record.
        """
        # Check if username is already registered
        existing_username = await self.user_repository.get_by_username(request.username)
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )

        # Check if email is already registered
        existing_email = await self.user_repository.get_by_email(request.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create new user model and hash the password
        hashed_password = get_password_hash(request.password)
        new_user = User(
            username=request.username,
            email=request.email,
            password_hash=hashed_password,
            role=request.role,
            is_active=True,
        )

        # Save to database using repository
        return await self.user_repository.create(new_user)

    async def login(self, request: LoginRequest) -> TokenResponse:
        """
        Business logic for authenticating an existing user.
        Validates username, checks password hash, and generates JWT tokens.
        """
        credentials_exception = HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid username or password"
        )

        # Fetch the user by username
        user = await self.user_repository.get_by_username(request.username)
        if not user:
            raise credentials_exception

        # Verify the password against the stored bcrypt hash
        if not verify_password(request.password, user.password_hash):
            raise credentials_exception

        # Check if the user's account is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user account"
            )

        # Generate JWT Access and Refresh tokens using the user's ID as the subject
        access_token = create_access_token(subject=user.user_id)
        refresh_token = create_refresh_token(subject=user.user_id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            role=user.role
        )
