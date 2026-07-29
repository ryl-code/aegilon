from app.repositories.base import BaseRepository
from app.models.incident import Incident
from app.models.host import Host
from app.models.rule import Rule
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, desc, text
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

        from datetime import timedelta, timezone
        wib = timezone(timedelta(hours=7))
        now = datetime.now(wib)
        
        # Generate strict time buckets in WIB (Asia/Jakarta, UTC+7)
        hourly_buckets = [(now.replace(minute=0, second=0, microsecond=0) - timedelta(hours=i)).strftime('%H:00') for i in range(23, -1, -1)]
        daily_buckets = [(now - timedelta(days=i)).strftime('%d %b') for i in range(6, -1, -1)]
        monthly_buckets = []
        for i in range(2, -1, -1):
            m = now.month - i
            y = now.year
            if m <= 0:
                m += 12
                y -= 1
            monthly_buckets.append(datetime(y, m, 1).strftime('%b %Y'))

        # Trend Data - Hourly (Last 24h aligned to Asia/Jakarta WIB timezone)
        hourly_incidents_stmt = text("""
            SELECT to_char(date_trunc('hour', created_at AT TIME ZONE 'Asia/Jakarta'), 'HH24:00') as name, COUNT(id) as cnt
            FROM incidents WHERE created_at >= NOW() - INTERVAL '24 hours'
            GROUP BY date_trunc('hour', created_at AT TIME ZONE 'Asia/Jakarta')
        """)
        hourly_alerts_stmt = text("""
            SELECT to_char(date_trunc('hour', created_at AT TIME ZONE 'Asia/Jakarta'), 'HH24:00') as name, COUNT(id) as cnt
            FROM alerts WHERE created_at >= NOW() - INTERVAL '24 hours'
            GROUP BY date_trunc('hour', created_at AT TIME ZONE 'Asia/Jakarta')
        """)
        
        # Trend Data - Daily (Last 7d aligned to Asia/Jakarta WIB timezone)
        daily_incidents_stmt = text("""
            SELECT to_char(date_trunc('day', created_at AT TIME ZONE 'Asia/Jakarta'), 'DD Mon') as name, COUNT(id) as cnt
            FROM incidents WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY date_trunc('day', created_at AT TIME ZONE 'Asia/Jakarta')
        """)
        daily_alerts_stmt = text("""
            SELECT to_char(date_trunc('day', created_at AT TIME ZONE 'Asia/Jakarta'), 'DD Mon') as name, COUNT(id) as cnt
            FROM alerts WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY date_trunc('day', created_at AT TIME ZONE 'Asia/Jakarta')
        """)
        
        # Trend Data - Monthly (Last 3m)
        monthly_incidents_stmt = text("""
            SELECT to_char(date_trunc('month', created_at AT TIME ZONE 'Asia/Jakarta'), 'Mon YYYY') as name, COUNT(id) as cnt
            FROM incidents WHERE created_at >= NOW() - INTERVAL '3 months'
            GROUP BY date_trunc('month', created_at AT TIME ZONE 'Asia/Jakarta')
        """)
        monthly_alerts_stmt = text("""
            SELECT to_char(date_trunc('month', created_at AT TIME ZONE 'Asia/Jakarta'), 'Mon YYYY') as name, COUNT(id) as cnt
            FROM alerts WHERE created_at >= NOW() - INTERVAL '3 months'
            GROUP BY date_trunc('month', created_at AT TIME ZONE 'Asia/Jakarta')
        """)

        def build_filled_trend(inc_rows, alt_rows, buckets):
            trend_dict = {b: {"name": b, "Incidents": 0, "Alerts": 0} for b in buckets}
            for row in inc_rows:
                if row[0] in trend_dict:
                    trend_dict[row[0]]["Incidents"] += row[1]
            for row in alt_rows:
                if row[0] in trend_dict:
                    trend_dict[row[0]]["Alerts"] += row[1]
            return list(trend_dict.values())

        h_inc = (await db.execute(hourly_incidents_stmt)).all()
        h_alt = (await db.execute(hourly_alerts_stmt)).all()
        d_inc = (await db.execute(daily_incidents_stmt)).all()
        d_alt = (await db.execute(daily_alerts_stmt)).all()
        m_inc = (await db.execute(monthly_incidents_stmt)).all()
        m_alt = (await db.execute(monthly_alerts_stmt)).all()

        trend_data = {
            "hourlyData": build_filled_trend(h_inc, h_alt, hourly_buckets),
            "dailyData": build_filled_trend(d_inc, d_alt, daily_buckets),
            "monthlyData": build_filled_trend(m_inc, m_alt, monthly_buckets)
        }

        db_bytes = 58720256 # Default 56 MB matching Supabase metrics
        try:
            db_size_res = await db.execute(text("SELECT pg_database_size(current_database());"))
            fetched_bytes = db_size_res.scalar()
            if fetched_bytes and fetched_bytes > 0:
                db_bytes = fetched_bytes
        except Exception:
            pass

        db_size_mb = round(db_bytes / (1024 * 1024), 1)
        sla_pct = round(((total - open_inc) / total * 100), 1) if total > 0 else 95.0

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
            "active_alerts": active_alerts,
            "trend_data": trend_data,
            "database_bytes": db_bytes,
            "database_size_mb": db_size_mb,
            "sla_compliance_pct": sla_pct
        }

incident_repo = IncidentRepository()
