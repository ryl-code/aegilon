from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.incident import Incident
from app.models.alert import Alert
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

class DuplicateChecker:
    @staticmethod
    async def is_duplicate(db: AsyncSession, host_id: any, rule_name: str) -> bool:
        wib = ZoneInfo("Asia/Jakarta")
        five_minutes_ago = datetime.now(wib) - timedelta(minutes=5)
        
        query = (
            select(Incident)
            .join(Alert, Incident.alert_id == Alert.id)
            .where(
                and_(
                    Alert.host_id == host_id,
                    Incident.action == rule_name,
                    Incident.processed_at >= five_minutes_ago
                )
            )
            .limit(1)
        )
        
        result = await db.execute(query)
        return result.scalar_one_or_none() is not None

duplicate_checker = DuplicateChecker()
