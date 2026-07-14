from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.audit_log import audit_log_repo
from app.models.audit_log import AuditLog
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from zoneinfo import ZoneInfo

class AuditLogService:
    async def get_audit_logs(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[AuditLog]:
        return await audit_log_repo.get_multi(db, skip=skip, limit=limit)

    async def log_action(
        self,
        db: AsyncSession,
        user_id: UUID,
        action: str,
        resource: str,
        ip_address: Optional[str] = None
    ) -> AuditLog:
        wib = ZoneInfo("Asia/Jakarta")
        audit = await audit_log_repo.create(db, obj_in={
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "ip_address": ip_address,
            "created_at": datetime.now(wib)
        })
        return audit

audit_log_service = AuditLogService()
