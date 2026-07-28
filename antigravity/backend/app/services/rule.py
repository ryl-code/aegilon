from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories import rule_repo
from app.models.rule import Rule
from typing import List, Optional
from uuid import UUID

class RuleService:
    async def get_rules(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Rule]:
        return await rule_repo.get_multi(db, skip=skip, limit=limit)

    async def get_rule(self, db: AsyncSession, rule_id: UUID) -> Optional[Rule]:
        return await rule_repo.get(db, rule_id)

    async def get_by_rule_id(self, db: AsyncSession, rule_id: int) -> Optional[Rule]:
        return await rule_repo.get_by_rule_id(db, rule_id)

rule_service = RuleService()
