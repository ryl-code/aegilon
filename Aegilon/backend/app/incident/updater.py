from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.incident import incident_repo
from app.models.incident import Incident
from datetime import datetime

class IncidentUpdater:
    @staticmethod
    async def increment_occurrence(db: AsyncSession, incident: Incident, last_seen: datetime) -> Incident:
        updated = await incident_repo.update(db, db_obj=incident, obj_in={
            "occurrence": incident.occurrence + 1,
            "last_seen": last_seen,
            "updated_at": last_seen
        })
        return updated

incident_updater = IncidentUpdater()
