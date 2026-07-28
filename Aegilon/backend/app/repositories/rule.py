from app.repositories.base import BaseRepository
from app.models.rule import Rule
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

class RuleRepository(BaseRepository[Rule]):
    def __init__(self):
        super().__init__(Rule)

    async def get_by_rule_id(self, db: AsyncSession, rule_id: int) -> Optional[Rule]:
        query = select(self.model).where(self.model.rule_id == rule_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

rule_repo = RuleRepository()
