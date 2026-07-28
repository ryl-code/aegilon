from sqlalchemy.ext.asyncio import AsyncSession
from app.models.alert import Alert
from app.models.incident import Incident
from app.incident.logger import logger
from app.incident.duplicate import duplicate_checker
from app.incident.creator import incident_creator
from app.incident.updater import incident_updater
from app.incident.evidence import evidence_manager
from app.incident.history import history_manager
from datetime import datetime
from uuid import UUID

class IncidentManager:
    @staticmethod
    async def handle_detection(
        db: AsyncSession,
        alert: Alert,
        rule_id: UUID,
        rule_name: str,
        category: str,
        severity: str,
        confidence: int,
        priority: str = "Low"
    ) -> Incident:
        active_inc = await duplicate_checker.get_active_incident(
            db,
            host_id=alert.host_id,
            rule_id=rule_id
        )
        
        if active_inc:
            logger.info(f"[INFO] Duplicate Incident: Increasing occurrence for incident {active_inc.incident_number}")
            old_occ = str(active_inc.occurrence)
            updated_inc = await incident_updater.increment_occurrence(
                db,
                incident=active_inc,
                last_seen=alert.created_at
            )
            
            await history_manager.log_change(
                db,
                incident_id=updated_inc.id,
                action="occurrence_increased",
                old_value=old_occ,
                new_value=str(updated_inc.occurrence),
                performed_by="system"
            )
            
            await evidence_manager.add_evidence(
                db,
                incident_id=updated_inc.id,
                alert_id=alert.id
            )
            
            await history_manager.log_change(
                db,
                incident_id=updated_inc.id,
                action="evidence_added",
                old_value=None,
                new_value=str(alert.id),
                performed_by="system"
            )
            
            return updated_inc
        else:
            logger.info(f"[INFO] Creating new incident for rule '{rule_name}' on host {alert.host_id}")
            title = f"{category} - {rule_name}"
            description = f"XDR Alert triggered rule '{rule_name}' with severity '{severity}'."
            
            new_inc = await incident_creator.create_new_incident(
                db=db,
                title=title,
                description=description,
                rule_id=rule_id,
                host_id=alert.host_id,
                severity=severity,
                priority=priority,
                category=category,
                confidence=confidence,
                first_seen=alert.created_at
            )
            
            await history_manager.log_change(
                db,
                incident_id=new_inc.id,
                action="incident_created",
                old_value=None,
                new_value=new_inc.incident_number,
                performed_by="system"
            )
            
            await evidence_manager.add_evidence(
                db,
                incident_id=new_inc.id,
                alert_id=alert.id
            )
            
            await history_manager.log_change(
                db,
                incident_id=new_inc.id,
                action="evidence_added",
                old_value=None,
                new_value=str(alert.id),
                performed_by="system"
            )

            # Trigger Telegram Alert Notification for High/Critical Incidents
            if severity.lower() in ["critical", "high"]:
                from app.services.telegram import telegram_service
                host_name = getattr(alert.host, "hostname", str(alert.host_id)) if alert.host else str(alert.host_id)
                import asyncio
                asyncio.create_task(
                    telegram_service.send_incident_alert(
                        incident_number=new_inc.incident_number,
                        title=title,
                        severity=severity,
                        host_name=host_name,
                        risk_score=new_inc.risk_score or 75.0,
                        category=category
                    )
                )
            
            return new_inc

incident_manager = IncidentManager()
