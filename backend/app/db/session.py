"""
This file exists to provide dependency injection for database sessions in FastAPI routes.
By yielding the session, we ensure that the session is properly closed after a request finishes,
handling database connections efficiently and preventing resource leaks.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import AsyncSessionLocal

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency to yield an async database session for FastAPI endpoints.
    The 'yield' statement ensures that the connection remains open for the duration 
    of the request and is safely closed once the request is completed.
    """
    async with AsyncSessionLocal() as session:
        yield session
