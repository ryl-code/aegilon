from app.repositories.base import BaseRepository
from app.models.incident import Incident
from app.models.host import Host
from app.models.rule import Rule
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, desc
from datetime import datetime
from uuid import UUID
from typing import List, Optional, Dict, Any

class IncidentRepository(BaseRepository[Incident]):
    def __init__(self):
        super().__init__(Incident)

    async def get(self, db: AsyncSession, id: UUID) -> Optional[Incident]:
        from sqlalchemy.orm import selectinload
        query = select(self.model).where(self.model.id == id).options(
            selectinload(self.model.host),
            selectinload(self.model.rule)
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def get_active_by_host_rule(self, db: AsyncSession, host_id: UUID, rule_id: UUID) -> Optional[Incident]:
        query = select(self.model).where(
            and_(
                self.model.host_id == host_id,
                self.model.rule_id == rule_id,
                self.model.status != "Closed"
            )
        ).order_by(desc(self.model.created_at)).limit(1)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def get_filtered(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        severity: Optional[str] = None,
        priority: Optional[str] = None,
        status: Optional[str] = None,
        category: Optional[str] = None,
        host_name: Optional[str] = None,
        rule_name: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        incident_number: Optional[str] = None,
        respondable: Optional[bool] = None
    ) -> List[Incident]:
        from sqlalchemy.orm import selectinload
        query = select(self.model).join(self.model.host).join(self.model.rule).options(
            selectinload(self.model.host),
            selectinload(self.model.rule)
        )
        
        filters = []
        if severity:
            filters.append(self.model.severity == severity)
        if priority:
            filters.append(self.model.priority == priority)
        if status:
            filters.append(self.model.status == status)
        if category:
            filters.append(self.model.category == category)
        if host_name:
            filters.append(Host.hostname.ilike(f"%{host_name}%"))
        if rule_name:
            filters.append(Rule.name.ilike(f"%{rule_name}%"))
        if date_from:
            filters.append(self.model.created_at >= date_from)
        if date_to:
            filters.append(self.model.created_at <= date_to)
        if incident_number:
            filters.append(self.model.incident_number.ilike(f"%{incident_number}%"))
        if respondable is not None:
            if respondable:
                filters.append(self.model.risk_score.isnot(None))
                filters.append(self.model.status == "Open")
            
        if filters:
            query = query.where(and_(*filters))
            
        query = query.order_by(desc(self.model.created_at)).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_stats(self, db: AsyncSession) -> Dict[str, Any]:
        total_stmt = select(func.count(self.model.id))
        open_stmt = select(func.count(self.model.id)).where(self.model.status == "Open")
        crit_stmt = select(func.count(self.model.id)).where(self.model.severity == "Critical")
        res_stmt = select(func.count(self.model.id)).where(self.model.status == "Resolved")
        
        total = (await db.execute(total_stmt)).scalar() or 0
        open_inc = (await db.execute(open_stmt)).scalar() or 0
        crit_inc = (await db.execute(crit_stmt)).scalar() or 0
        res_inc = (await db.execute(res_stmt)).scalar() or 0
        
        sev_stmt = select(self.model.severity, func.count(self.model.id)).group_by(self.model.severity)
        sev_counts = {row[0]: row[1] for row in (await db.execute(sev_stmt)).all()}
        
        status_stmt = select(self.model.status, func.count(self.model.id)).group_by(self.model.status)
        status_counts = {row[0]: row[1] for row in (await db.execute(status_stmt)).all()}
        
        cat_stmt = select(self.model.category, func.count(self.model.id)).group_by(self.model.category)
        cat_counts = {row[0]: row[1] for row in (await db.execute(cat_stmt)).all()}
        
        host_stmt = select(Host.hostname, func.count(self.model.id))\
            .join(self.model.host)\
            .group_by(Host.hostname)\
            .order_by(desc(func.count(self.model.id)))\
            .limit(5)
        top_hosts = [{"host_name": row[0], "count": row[1]} for row in (await db.execute(host_stmt)).all()]
        
        rules_stmt = select(Rule.name, func.count(self.model.id))\
            .join(self.model.rule)\
            .group_by(Rule.name)\
            .order_by(desc(func.count(self.model.id)))\
            .limit(5)
        top_rules = [{"rule_name": row[0], "count": row[1]} for row in (await db.execute(rules_stmt)).all()]
        
        from app.models.alert import Alert
        hosts_count_stmt = select(func.count(Host.id))
        alerts_count_stmt = select(func.count(Alert.id)).where(Alert.status == "new")

        total_hosts = (await db.execute(hosts_count_stmt)).scalar() or 0
        active_alerts = (await db.execute(alerts_count_stmt)).scalar() or 0

        return {
            "total_incidents": total,
            "open_incidents": open_inc,
            "critical_incidents": crit_inc,
            "resolved_incidents": res_inc,
            "severity_counts": sev_counts,
            "status_counts": status_counts,
            "category_counts": cat_counts,
            "top_affected_hosts": top_hosts,
            "most_triggered_rules": top_rules,
            "total_hosts": total_hosts,
            "active_alerts": active_alerts
        }

incident_repo = IncidentRepository()
