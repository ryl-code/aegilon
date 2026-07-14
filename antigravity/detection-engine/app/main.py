import os
import sys
import time
import json
import logging
from datetime import datetime
from dotenv import load_dotenv

# Ensure the package root is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aegilon-detection-engine")

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcfromtimestamp(record.created).isoformat(),
            "level": record.levelname,
            "message": record.getMessage()
        }
        if hasattr(record, "json_fields"):
            log_data.update(record.json_fields)
        return json.dumps(log_data)

handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.handlers = [handler]
logger.propagate = False

from app.client.backend_client import backend_client
from app.services.feature_extractor import feature_extractor
from app.services.risk_engine import risk_engine
from app.services.severity_engine import severity_engine
from app.services.decision_engine import decision_engine

def run_loop():
    logger.info("Starting AEGILON Python Detection Engine Standalone loop (10s interval)...")
    
    if not backend_client.login():
        logger.warning("Could not connect to backend at startup. Will retry in loop.")

    while True:
        try:
            alerts = backend_client.get_unprocessed_alerts()
            if alerts:
                logger.info(f"Loaded {len(alerts)} unprocessed alerts for behaviour analysis.")
                for alert in alerts:
                    start_time = time.time()
                    
                    features = feature_extractor.extract_features(alert)
                    risk = risk_engine.calculate_risk(features)
                    severity = severity_engine.classify_severity(features)
                    action = decision_engine.decide_action(severity, features)
                    
                    processing_time = time.time() - start_time
                    alert_id = alert.get("id")
                    
                    log_fields = {
                        "json_fields": {
                            "request_time": datetime.utcnow().isoformat(),
                            "alert_id": alert_id,
                            "processing_time_ms": int(processing_time * 1000),
                            "risk_score": risk,
                            "severity": severity,
                            "decision": action
                        }
                    }
                    logger.info(f"Analyzed alert {alert_id}", extra=log_fields)
                    
                    analysis_text = f"Standalone behaviour analysis flagged rule {features['rule_id']} with severity {severity}."
                    backend_client.send_analysis(
                        alert_id=alert_id,
                        risk_score=risk,
                        severity=severity,
                        action=action,
                        analysis=analysis_text
                    )
            
        except Exception as e:
            logger.error(f"Error in Detection Engine loop: {str(e)}")
            
        time.sleep(10)

if __name__ == "__main__":
    run_loop()
