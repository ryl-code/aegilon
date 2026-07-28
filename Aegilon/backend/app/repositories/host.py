from app.repositories.base import BaseRepository
from app.models.host import Host
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

class HostRepository(BaseRepository[Host]):
    def __init__(self):
        super().__init__(Host)

    async def get_by_agent_id(self, db: AsyncSession, agent_id: str) -> Optional[Host]:
        query = select(self.model).where(self.model.agent_id == agent_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

host_repo = HostRepository()
