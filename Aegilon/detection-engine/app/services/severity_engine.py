from typing import Dict, Any

class SeverityEngine:
    @staticmethod
    def classify_severity(features: Dict[str, Any]) -> str:
        rule_level = features.get("rule_level", 0)
        
        if rule_level >= 15:
            return "Critical"
        elif rule_level >= 12:
            return "High"
        elif rule_level >= 8:
            return "Medium"
        else:
            return "Low"

severity_engine = SeverityEngine()
