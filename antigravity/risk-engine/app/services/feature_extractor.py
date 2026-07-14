import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class FeatureExtractor:
    @staticmethod
    def extract_features(incident: Dict[str, Any], alerts: List[Dict[str, Any]]) -> Dict[str, Any]:
        rule_level = 0
        mitre_technique = None
        
        rule_info = incident.get("rule")
        if rule_info:
            rule_level = rule_info.get("wazuh_level") or 5
            mitre_technique = rule_info.get("mitre")
            
        occurrence_count = incident.get("occurrence", 1)
        host_status = incident.get("host", {}).get("status", "active") if incident.get("host") else "active"
        
        jumlah_alert = len(alerts)
        frekuensi_alert = 1.0
        previous_incident_count = 0
        
        features = {
            "rule_level": rule_level,
            "mitre_technique": mitre_technique,
            "jumlah_alert": jumlah_alert,
            "frekuensi_alert": frekuensi_alert,
            "host_status": host_status,
            "previous_incident_count": previous_incident_count,
            "occurrence_count": occurrence_count,
            "timestamp": incident.get("created_at")
        }
        return features

feature_extractor = FeatureExtractor()
