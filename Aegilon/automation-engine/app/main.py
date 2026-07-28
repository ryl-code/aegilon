import os
import sys
import time
import logging
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("aegilon-automation-engine")

from app.client.backend_client import backend_client
from app.services.decision_engine import decision_engine

def process_incidents():
    incidents = backend_client.get_respondable_incidents()
    if not incidents:
        return
        
    logger.info(f"Loaded {len(incidents)} respondable incidents for automated response.")
    for incident in incidents:
        incident_id = incident.get("id")
        title = incident.get("title", "Unknown Incident")
        severity = incident.get("severity", "Low")
        risk_score = incident.get("risk_score", 0.0)
        host_info = incident.get("host", {})
        hostname = host_info.get("hostname", "Unknown Host")
        agent_id = host_info.get("agent_id", "000")
        recommendation = incident.get("rule", {}).get("name", "Remediation Recommended") if incident.get("rule") else "Mitigate threat"

        logger.info(f"Processing Incident: ID={incident_id}, Title='{title}', Severity={severity}, Host={hostname}")
        
        actions = decision_engine.get_actions(incident)
        
        telegram_success = True
        active_response_success = True
        
        for action in actions:
            if action == "telegram":
                logger.info(f"Sending Telegram notification for incident {incident_id}")
                ok = backend_client.send_telegram_notification(
                    incident_id=incident_id,
                    severity=severity,
                    risk_score=risk_score,
                    title=title,
                    host=hostname,
                    recommendation=recommendation
                )
                if ok:
                    backend_client.save_response_history(
                        incident_id=incident_id,
                        action="Telegram Alert",
                        status="success",
                        message="Telegram notification sent to channel/chat successfully."
                    )
                else:
                    telegram_success = False
                    backend_client.save_response_history(
                        incident_id=incident_id,
                        action="Telegram Alert",
                        status="failed",
                        message="Failed to send Telegram notification."
                    )
            elif action in ["kill_process", "isolate_host"]:
                cmd_name = "kill-process" if action == "kill_process" else "isolate-host"
                args = ["PID"] if action == "kill_process" else ["host_id"]
                logger.info(f"Triggering Wazuh Active Response for incident {incident_id}: Action={cmd_name}")
                ok = backend_client.trigger_wazuh_active_response(
                    agent_id=agent_id,
                    command=cmd_name,
                    arguments=args
                )
                if ok:
                    backend_client.save_response_history(
                        incident_id=incident_id,
                        action=f"Wazuh Active Response: {cmd_name}",
                        status="success",
                        message=f"Active response command '{cmd_name}' executed on agent {agent_id}."
                    )
                else:
                    active_response_success = False
                    backend_client.save_response_history(
                        incident_id=incident_id,
                        action=f"Wazuh Active Response: {cmd_name}",
                        status="failed",
                        message=f"Failed to execute active response command '{cmd_name}' on agent {agent_id}."
                    )
            elif action == "monitor":
                backend_client.save_response_history(
                    incident_id=incident_id,
                    action="Monitor Log",
                    status="success",
                    message="Incident recorded and logged for passive monitoring."
                )

        backend_client.update_incident_status(incident_id, "RESPONDED")

        if telegram_success and active_response_success:
            logger.info(f"Response actions for incident {incident_id} succeeded. Closing incident.")
            backend_client.update_incident_status(incident_id, "CLOSED")
        else:
            logger.warning(f"Some response actions for incident {incident_id} failed. Status left as RESPONDED.")

def run_loop():
    logger.info("Starting AEGILON Automation Response Layer Engine Standalone loop (10s interval)...")
    
    if not backend_client.login():
        logger.warning("Could not connect to backend at startup. Will retry in loop.")

    while True:
        try:
            process_incidents()
        except Exception as e:
            logger.error(f"Error in Automation Engine loop: {str(e)}")
            
        time.sleep(10)

if __name__ == "__main__":
    run_loop()
