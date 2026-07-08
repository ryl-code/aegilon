import pytest_asyncio
from app.db.database import engine

@pytest_asyncio.fixture(autouse=True)
async def dispose_engine_connections():
    """
    Fixture to dispose of the global SQLAlchemy engine's connection pool 
    after each test. This prevents connection leakage and 'Event loop is closed'
    errors under Windows when tests run in separate event loops.
    """
    yield
    # Safely close all connections in the pool before the test's event loop closes
    await engine.dispose()
