import logging
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.incident import Incident
from app.services.response import response_service
from app.services.telegram import telegram_service
from app.services.audit_log import audit_log_service

logger = logging.getLogger("aegilon-soar-engine")

PLAYBOOKS = [
    {
        "id": "playbook-001",
        "name": "Ransomware & Active Compromise Auto-Containment",
        "condition": lambda inc: inc.severity.lower() == "critical" or inc.category.lower() == "ransomware",
        "actions": ["Isolate Host", "Kill Process", "Telegram Alert"],
        "description": "Triggered when a Critical/Ransomware compromise is detected. Automatically isolates host, terminates malicious PID, and notifies SOC team via Telegram."
    },
    {
        "id": "playbook-002",
        "name": "Credential Access & Mimikatz Suppression",
        "condition": lambda inc: "credential" in inc.title.lower() or "mimikatz" in inc.title.lower() or "lsass" in inc.title.lower(),
        "actions": ["Kill Process", "Quarantine File", "Telegram Alert"],
        "description": "Triggered on LSASS memory dumping or Mimikatz execution. Immediately terminates offending process and quarantines binary."
    },
    {
        "id": "playbook-003",
        "name": "High Frequency Brute-Force Suppression",
        "condition": lambda inc: inc.occurrence >= 10,
        "actions": ["Block IP", "Telegram Alert"],
        "description": "Triggered when event occurrence count exceeds 10 repetitions from the same endpoint. Blocks target source IP."
    }
]

class SOARPlaybookEngine:
    @staticmethod
    async def evaluate_and_execute_playbooks(db: AsyncSession, incident: Incident) -> List[Dict[str, Any]]:
        executed_playbooks = []

        for pb in PLAYBOOKS:
            try:
                if pb["condition"](incident):
                    logger.info(f"[SOAR PLAYBOOK TRIGGERED] Executing '{pb['name']}' for Incident {incident.incident_number}")

                    # 1. Execute required response actions in sequence
                    for action in pb["actions"]:
                        if action == "Telegram Alert":
                            host_name = getattr(incident.host, "hostname", str(incident.host_id)) if incident.host else str(incident.host_id)
                            await telegram_service.send_incident_alert(
                                incident_number=incident.incident_number,
                                title=f"[SOAR AUTO] {incident.title}",
                                severity=incident.severity,
                                host_name=host_name,
                                risk_score=incident.risk_score or 90.0,
                                category=incident.category
                            )
                        else:
                            await response_service.create_response(db, {
                                "incident_id": incident.id,
                                "action": action,
                                "status": "executed",
                                "message": f"Automated SOAR Playbook Execution: {pb['name']}"
                            })

                    executed_playbooks.append({
                        "playbook_id": pb["id"],
                        "name": pb["name"],
                        "actions": pb["actions"],
                        "status": "triggered"
                    })
            except Exception as e:
                logger.error(f"Error executing SOAR Playbook {pb['id']}: {str(e)}")

        return executed_playbooks

soar_engine = SOARPlaybookEngine()
