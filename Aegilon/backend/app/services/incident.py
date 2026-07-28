from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.repositories.incident import incident_repo
from app.repositories.incident_alert import incident_alert_repo
from app.repositories.incident_history import incident_history_repo
from app.models.incident import Incident
from app.models.incident_alert import IncidentAlert
from app.models.incident_history import IncidentHistory
from app.incident.creator import incident_creator
from app.incident.history import history_manager
from datetime import datetime
from uuid import UUID
from typing import List, Optional, Dict, Any
from zoneinfo import ZoneInfo

class IncidentService:
    async def get_incidents(
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
        return await incident_repo.get_filtered(
            db,
            skip=skip,
            limit=limit,
            severity=severity,
            priority=priority,
            status=status,
            category=category,
            host_name=host_name,
            rule_name=rule_name,
            date_from=date_from,
            date_to=date_to,
            incident_number=incident_number,
            respondable=respondable
        )

    async def get_incident(self, db: AsyncSession, incident_id: UUID) -> Optional[Incident]:
        return await incident_repo.get(db, incident_id)

    async def get_incident_history(self, db: AsyncSession, incident_id: UUID) -> List[IncidentHistory]:
        query = select(IncidentHistory).where(IncidentHistory.incident_id == incident_id).order_by(desc(IncidentHistory.created_at))
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_incident_alerts(self, db: AsyncSession, incident_id: UUID) -> List[IncidentAlert]:
        from sqlalchemy.orm import selectinload
        from app.models.alert import Alert
        query = select(IncidentAlert).where(IncidentAlert.incident_id == incident_id).options(
            selectinload(IncidentAlert.alert).selectinload(Alert.host),
            selectinload(IncidentAlert.alert).selectinload(Alert.rule)
        ).order_by(desc(IncidentAlert.created_at))
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_incident_stats(self, db: AsyncSession) -> Dict[str, Any]:
        return await incident_repo.get_stats(db)

    async def create_incident(self, db: AsyncSession, obj_in: dict) -> Incident:
        wib = ZoneInfo("Asia/Jakarta")
        now_wib = datetime.now(wib)
        
        incident = await incident_creator.create_new_incident(
            db=db,
            title=obj_in["title"],
            description=obj_in.get("description", ""),
            rule_id=obj_in["rule_id"],
            host_id=obj_in["host_id"],
            severity=obj_in["severity"],
            priority=obj_in.get("priority", "Low"),
            category=obj_in["category"],
            confidence=obj_in.get("confidence", 70),
            first_seen=now_wib
        )
        
        await history_manager.log_change(
            db,
            incident_id=incident.id,
            action="incident_created",
            old_value=None,
            new_value=incident.incident_number,
            performed_by="admin"
        )
        return incident

    async def update_incident(self, db: AsyncSession, incident_id: UUID, obj_in: dict, performed_by: str = "admin") -> Optional[Incident]:
        incident = await incident_repo.get(db, incident_id)
        if not incident:
            return None
            
        wib = ZoneInfo("Asia/Jakarta")
        updates = {}
        
        for field in ["priority", "status", "assigned_to", "description"]:
            if field in obj_in and obj_in[field] is not None:
                old_val = getattr(incident, field)
                new_val = obj_in[field]
                if old_val != new_val:
                    updates[field] = new_val
                    await history_manager.log_change(
                        db,
                        incident_id=incident.id,
                        action=f"{field}_changed",
                        old_value=str(old_val) if old_val is not None else None,
                        new_value=str(new_val),
                        performed_by=performed_by
                    )
                    
        if "status" in updates and updates["status"] == "Closed":
            updates["closed_at"] = datetime.now(wib)
            
        updates["updated_at"] = datetime.now(wib)
        return await incident_repo.update(db, db_obj=incident, obj_in=updates)

    async def update_incident_status(self, db: AsyncSession, incident_id: UUID, status: str, performed_by: str = "admin") -> Optional[Incident]:
        return await self.update_incident(db, incident_id=incident_id, obj_in={"status": status}, performed_by=performed_by)

    async def delete_incident(self, db: AsyncSession, incident_id: UUID) -> Optional[Incident]:
        incident = await incident_repo.get(db, incident_id)
        if incident:
            await incident_repo.remove(db, id=incident_id)
        return incident

    async def analyze_incident(self, db: AsyncSession, incident_id: UUID, analysis_data: dict, performed_by: str = "risk-engine") -> Optional[Incident]:
        incident = await incident_repo.get(db, incident_id)
        if not incident:
            return None
            
        wib = ZoneInfo("Asia/Jakarta")
        updates = {
            "risk_score": analysis_data["risk_score"],
            "severity": analysis_data["severity"],
            "confidence": analysis_data["confidence"],
            "updated_at": datetime.now(wib)
        }
        
        # Log changes in history
        if incident.risk_score != updates["risk_score"]:
            await history_manager.log_change(
                db,
                incident_id=incident.id,
                action="risk_score_analyzed",
                old_value=str(incident.risk_score) if incident.risk_score is not None else None,
                new_value=str(updates["risk_score"]),
                performed_by=performed_by
            )
            
        if incident.severity != updates["severity"]:
            await history_manager.log_change(
                db,
                incident_id=incident.id,
                action="severity_analyzed",
                old_value=str(incident.severity),
                new_value=updates["severity"],
                performed_by=performed_by
            )
            
        # Create corresponding Response record if action is recommended
        recommended_action = analysis_data.get("recommended_action")
        analysis_desc = analysis_data.get("analysis", "")
        
        if recommended_action and recommended_action.lower() not in ["none", "store", "monitor"]:
            from app.repositories import response_repo
            await response_repo.create(db, obj_in={
                "incident_id": incident.id,
                "action": recommended_action,
                "status": "pending",
                "message": f"Recommended action triggered: {recommended_action}. Details: {analysis_desc}"
            })
            
        return await incident_repo.update(db, db_obj=incident, obj_in=updates)

incident_service = IncidentService()
