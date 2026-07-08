import pytest
from sqlalchemy import text
from app.db.database import AsyncSessionLocal

@pytest.mark.asyncio
async def test_database_connection():
    """
    Test that the application can successfully connect to the PostgreSQL database
    and that the asynchronous session is functioning correctly.
    
    This acts as our verification step for Sprint 2, ensuring that our 
    SQLAlchemy async engine setup is valid before we move on to building APIs.
    """
    try:
        async with AsyncSessionLocal() as session:
            # Execute a simple query to verify connectivity
            result = await session.execute(text("SELECT 1"))
            value = result.scalar()
            
            assert value == 1, "Database returned unexpected value"
    except Exception as e:
        pytest.fail(f"Database connection failed: {str(e)}")
