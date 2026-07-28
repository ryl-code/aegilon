from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories import incident_repo, alert_repo
from app.models.incident import Incident
from app.models.alert import Alert
from datetime import datetime
from zoneinfo import ZoneInfo
from typing import Dict, Any

class IncidentGenerator:
    @staticmethod
    async def create_incident(
        db: AsyncSession,
        alert: Alert,
        rule_name: str,
        mitre_id: str,
        severity: str,
        risk_score: float,
        confidence: int,
        analysis: str
    ) -> Incident:
        wib = ZoneInfo("Asia/Jakarta")
        
        incident = await incident_repo.create(db, obj_in={
            "alert_id": alert.id,
            "risk_score": risk_score,
            "severity": severity,
            "action": rule_name,
            "analysis": f"Confidence: {confidence}%. MITRE: {mitre_id}. {analysis}",
            "processed_at": datetime.now(wib)
        })
        
        await alert_repo.update(db, db_obj=alert, obj_in={"status": "processed"})
        return incident

    @staticmethod
    async def mark_ignored(db: AsyncSession, alert: Alert):
        await alert_repo.update(db, db_obj=alert, obj_in={"status": "ignored"})

incident_generator = IncidentGenerator()
