from app.repositories.base import BaseRepository
from app.models.alert import Alert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional, Any

class AlertRepository(BaseRepository[Alert]):
    def __init__(self):
        super().__init__(Alert)

    async def get(self, db: AsyncSession, id: Any) -> Optional[Alert]:
        from sqlalchemy.orm import selectinload
        query = select(self.model).where(self.model.id == id).options(
            selectinload(self.model.host),
            selectinload(self.model.rule)
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def get_multi(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100,
        severity: Optional[str] = None,
        minutes: Optional[int] = None
    ) -> List[Alert]:
        from sqlalchemy.orm import selectinload
        from datetime import datetime, timedelta, timezone
        query = select(self.model).options(
            selectinload(self.model.host),
            selectinload(self.model.rule)
        )
        if severity and severity.lower() != "all":
            query = query.where(self.model.severity.ilike(severity))
        if minutes and minutes > 0:
            cutoff = datetime.now(timezone.utc) - timedelta(minutes=minutes)
            query = query.where(self.model.created_at >= cutoff)
            
        query = query.order_by(self.model.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_unprocessed(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Alert]:
        from sqlalchemy.orm import selectinload
        query = select(self.model).where(
            self.model.status.in_(["open", "new"])
        ).options(
            selectinload(self.model.host),
            selectinload(self.model.rule)
        ).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_by_event_id(self, db: AsyncSession, event_id: str) -> Optional[Alert]:
        query = select(self.model).where(self.model.event_id == event_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

alert_repo = AlertRepository()
