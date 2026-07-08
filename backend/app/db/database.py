"""
This file exists to configure and initialize the SQLAlchemy database engine and session maker.
It uses SQLAlchemy 2.0 async components to ensure non-blocking database operations, which
is a best practice when working with FastAPI for high concurrency.
"""

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings

# Create async engine for SQLAlchemy 2.0
# echo=False in production to prevent logging all SQL queries
engine = create_async_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    echo=False,
    future=True
)

# Async session factory to be used for dependency injection
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)
