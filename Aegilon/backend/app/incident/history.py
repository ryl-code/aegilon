from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.incident_history import incident_history_repo
from app.models.incident_history import IncidentHistory
from uuid import UUID
from datetime import datetime
from zoneinfo import ZoneInfo
from typing import Optional

class HistoryManager:
    @staticmethod
    async def log_change(
        db: AsyncSession,
        incident_id: UUID,
        action: str,
        old_value: Optional[str],
        new_value: Optional[str],
        performed_by: str = "system"
    ) -> IncidentHistory:
        wib = ZoneInfo("Asia/Jakarta")
        history = await incident_history_repo.create(db, obj_in={
            "incident_id": incident_id,
            "action": action,
            "old_value": old_value,
            "new_value": new_value,
            "performed_by": performed_by,
            "created_at": datetime.now(wib)
        })
        return history

history_manager = HistoryManager()
