import os
import sys
import time
import logging
from datetime import datetime
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("aegilon-risk-engine")

from app.client.backend_client import backend_client
from app.services.feature_extractor import feature_extractor
from app.services.risk_engine import risk_engine
from app.services.severity_engine import severity_engine
from app.services.recommendation_engine import recommendation_engine

def run_loop():
    logger.info("Starting AEGILON Python Risk Analysis Engine Standalone loop (10s interval)...")
    
    if not backend_client.login():
        logger.warning("Could not connect to backend at startup. Will retry in loop.")

    while True:
        try:
            incidents = backend_client.get_open_incidents()
            if incidents:
                logger.info(f"Loaded {len(incidents)} open incidents for risk analysis.")
                for incident in incidents:
                    start_time = time.time()
                    incident_id = incident.get("id")
                    
                    alerts = backend_client.get_incident_alerts(incident_id)
                    
                    features = feature_extractor.extract_features(incident, alerts)
                    risk = risk_engine.calculate_risk(features)
                    severity = severity_engine.classify_severity(risk)
                    recommendation = recommendation_engine.get_recommendation(severity, features)
                    confidence = 90.0
                    
                    processing_time = time.time() - start_time
                    
                    logger.info(
                        f"Analyzed Incident: ID={incident_id}, ProcessingTime={processing_time:.3f}s, "
                        f"RiskScore={risk}, Severity={severity}, Recommendation={recommendation}, Confidence={confidence}"
                    )
                    
                    analysis_text = f"Python Risk Engine verified incident with risk score {risk} ({severity})."
                    backend_client.send_incident_analysis(
                        incident_id=incident_id,
                        risk_score=risk,
                        severity=severity,
                        action=recommendation,
                        confidence=confidence,
                        analysis=analysis_text
                    )
            
        except Exception as e:
            logger.error(f"Error in Risk Engine loop: {str(e)}")
            
        time.sleep(10)

if __name__ == "__main__":
    run_loop()
