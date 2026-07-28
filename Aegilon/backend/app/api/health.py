from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database.database import get_db

router = APIRouter()

@router.get("/health", tags=["Health"])
async def health_check(db: AsyncSession = Depends(get_db)):
    db_status = "connected"
    try:
        # Check database connection asynchronously
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"disconnected: {str(e)}"
    
    return {
        "status": "healthy",
        "database": db_status
    }
