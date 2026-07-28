from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.incident_alert import incident_alert_repo
from app.models.incident_alert import IncidentAlert
from uuid import UUID
from datetime import datetime
from zoneinfo import ZoneInfo

class EvidenceManager:
    @staticmethod
    async def add_evidence(db: AsyncSession, incident_id: UUID, alert_id: UUID) -> IncidentAlert:
        wib = ZoneInfo("Asia/Jakarta")
        evidence = await incident_alert_repo.create(db, obj_in={
            "incident_id": incident_id,
            "alert_id": alert_id,
            "created_at": datetime.now(wib)
        })
        return evidence

evidence_manager = EvidenceManager()
