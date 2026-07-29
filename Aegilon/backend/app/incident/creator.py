from datetime import datetime, timezone, timedelta
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.incident import Incident
import uuid

class IncidentCreator:
    @staticmethod
    async def generate_incident_number(db: AsyncSession) -> str:
        wib = timezone(timedelta(hours=7))
        now_wib = datetime.now(wib)
        date_str = now_wib.strftime("%Y%m%d")
        
        # Start and end of day in WIB to count daily incidents
        start_of_day = datetime(now_wib.year, now_wib.month, now_wib.day, 0, 0, 0, tzinfo=wib)
        end_of_day = datetime(now_wib.year, now_wib.month, now_wib.day, 23, 59, 59, tzinfo=wib)
        
        query = select(func.count(Incident.id)).where(
            and_(
                Incident.created_at >= start_of_day,
                Incident.created_at <= end_of_day
            )
        )
        
        result = await db.execute(query)
        today_count = result.scalar() or 0
        sequence = today_count + 1
        
        return f"INC-{date_str}-{sequence:04d}"

    @staticmethod
    async def create_new_incident(
        db: AsyncSession,
        title: str,
        description: str,
        rule_id: uuid.UUID,
        host_id: uuid.UUID,
        severity: str,
        priority: str,
        category: str,
        confidence: int,
        first_seen: datetime
    ) -> Incident:
        from app.repositories.incident import incident_repo
        
        incident_number = await IncidentCreator.generate_incident_number(db)
        
        incident = await incident_repo.create(db, obj_in={
            "incident_number": incident_number,
            "title": title,
            "description": description,
            "rule_id": rule_id,
            "host_id": host_id,
            "severity": severity,
            "priority": priority,
            "status": "Open",
            "category": category,
            "confidence": confidence,
            "occurrence": 1,
            "first_seen": first_seen,
            "last_seen": first_seen,
            "created_at": first_seen,
            "updated_at": first_seen
        })
        return incident

incident_creator = IncidentCreator()
