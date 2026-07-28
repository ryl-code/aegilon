from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.incident import incident_repo
from app.models.incident import Incident
from uuid import UUID
from typing import Optional

class DuplicateChecker:
    @staticmethod
    async def get_active_incident(db: AsyncSession, host_id: UUID, rule_id: UUID) -> Optional[Incident]:
        return await incident_repo.get_active_by_host_rule(db, host_id=host_id, rule_id=rule_id)

duplicate_checker = DuplicateChecker()
