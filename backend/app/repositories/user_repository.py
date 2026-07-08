"""
This file implements the UserRepository.
It manages direct database operations (SQL queries and persistence) for the User model
using SQLAlchemy 2.0 Async, completely decoupled from any business logic.
"""

import uuid
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User

class UserRepository:
    """
    Repository for encapsulating database operations on the User model.
    """
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        """
        Fetch a user record by their unique UUID.
        """
        result = await self.db.execute(select(User).where(User.user_id == user_id))
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Optional[User]:
        """
        Fetch a user record by their username.
        """
        result = await self.db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        """
        Fetch a user record by their email address.
        """
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create(self, user: User) -> User:
        """
        Persist a new User model instance into the database.
        """
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user
