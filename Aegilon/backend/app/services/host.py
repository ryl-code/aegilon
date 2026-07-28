from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories import host_repo
from app.models.host import Host
from typing import List, Optional
from uuid import UUID

class HostService:
    async def get_hosts(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Host]:
        return await host_repo.get_multi(db, skip=skip, limit=limit)

    async def get_host(self, db: AsyncSession, host_id: UUID) -> Optional[Host]:
        return await host_repo.get(db, host_id)

host_service = HostService()
