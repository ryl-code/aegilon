from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories import alert_repo, incident_repo, response_repo
from app.models.alert import Alert
from app.models.incident import Incident
from app.models.response import Response
from typing import List, Optional
from uuid import UUID

class AlertService:
    async def get_alerts(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        severity: Optional[str] = None,
        minutes: Optional[int] = None
    ) -> List[Alert]:
        return await alert_repo.get_multi(db, skip=skip, limit=limit, severity=severity, minutes=minutes)

    async def get_alert(self, db: AsyncSession, alert_id: UUID) -> Optional[Alert]:
        return await alert_repo.get(db, alert_id)

    async def get_unprocessed(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Alert]:
        return await alert_repo.get_unprocessed(db, skip=skip, limit=limit)

    async def process_analysis(self, db: AsyncSession, alert_id: UUID, risk_score: float, severity: str, action: str = None, analysis: str = None) -> Optional[Alert]:
        alert = await alert_repo.get(db, alert_id)
        if not alert:
            return None
            
        # 1. Fetch rule details for the alert
        from app.repositories import rule_repo
        rule = await rule_repo.get(db, alert.rule_id)
        rule_name = rule.name if rule else "Unknown Rule"
        rule_uuid = rule.id if rule else alert.rule_id
        
        # 2. Extract category and confidence from rule description conditions
        import json
        category = "Execution"
        confidence = 70
        if rule and rule.description and rule.description.strip().startswith("{") and rule.description.strip().endswith("}"):
            try:
                conds = json.loads(rule.description)
                category = conds.get("category", "Execution")
                confidence = int(conds.get("confidence", 70))
            except Exception:
                pass
                
        # 3. Handle incident creation/update via IncidentManager lifecycle
        from app.incident.manager import incident_manager
        incident = await incident_manager.handle_detection(
            db=db,
            alert=alert,
            rule_id=rule_uuid,
            rule_name=rule_name,
            category=category,
            severity=severity,
            confidence=confidence,
            priority="Low"
        )
        
        # 4. If action is specified and is not none, create Response record
        if action and action.lower() != "none":
            await response_repo.create(db, obj_in={
                "incident_id": incident.id,
                "action": action,
                "status": "pending",
                "message": f"Triggered response action: {action} (Analysis: {analysis})"
            })
            
        # 5. Update alert status to processed
        await alert_repo.update(db, db_obj=alert, obj_in={"status": "processed"})
            
        return alert

alert_service = AlertService()
