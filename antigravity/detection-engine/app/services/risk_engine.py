from typing import Dict, Any

class RiskEngine:
    @staticmethod
    def calculate_risk(features: Dict[str, Any]) -> float:
        rule_level = features.get("rule_level", 0)
        
        if rule_level >= 15:
            return 95.0
        elif rule_level >= 12:
            return 85.0
        elif rule_level >= 8:
            return 60.0
        elif rule_level >= 5:
            return 40.0
        else:
            return 15.0

risk_engine = RiskEngine()
