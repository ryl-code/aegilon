from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.database import get_db
from app.services.audit_log import audit_log_service
from app.schemas.audit_log import AuditLogResponse
from app.core.security import get_current_user
from app.models.user import User
from typing import List

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])

@router.get("", response_model=List[AuditLogResponse])
async def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await audit_log_service.get_audit_logs(db, skip=skip, limit=limit)
