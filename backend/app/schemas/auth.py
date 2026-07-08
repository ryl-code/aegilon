"""
This file defines Pydantic schemas for authentication and user management.
These schemas are used for request validation and response serialization,
ensuring strict compliance with the team's API Contract.
"""

from pydantic import BaseModel, ConfigDict, Field, field_validator
import uuid
from datetime import datetime

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Unique username for the dashboard")
    email: str = Field(..., pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$", description="User's email address")
    password: str = Field(..., min_length=6, description="Strong user password")
    role: str = Field(default="analyst", description="Role of the user: 'admin' or 'analyst'")

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str) -> str:
        if value not in ("admin", "analyst"):
            raise ValueError("Role must be either 'admin' or 'analyst'")
        return value

class LoginRequest(BaseModel):
    username: str = Field(..., description="Username for login")
    password: str = Field(..., description="Password for login")

class TokenResponse(BaseModel):
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field("bearer", description="Token type, defaults to bearer")
    role: str = Field(..., description="Role of the authenticated user")

class CurrentUserResponse(BaseModel):
    user_id: uuid.UUID = Field(..., description="Unique database identifier for the user")
    username: str = Field(..., description="Unique username")
    email: str = Field(..., description="Unique email address")
    role: str = Field(..., description="Assigned role: 'admin' or 'analyst'")
    is_active: bool = Field(..., description="Account status indicator")
    created_at: datetime = Field(..., description="User creation timestamp")

    # Pydantic v2 configuration to allow serializing SQLAlchemy models
    model_config = ConfigDict(from_attributes=True)
