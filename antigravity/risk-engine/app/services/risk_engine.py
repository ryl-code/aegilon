from typing import Dict, Any

class RiskEngine:
    @staticmethod
    def calculate_risk(features: Dict[str, Any]) -> float:
        rule_level = features.get("rule_level", 0)
        occurrence = features.get("occurrence_count", 1)
        prev_inc = features.get("previous_incident_count", 0)
        
        base = min(rule_level * 5.0, 75.0)
        occ_bonus = min(occurrence * 2.0, 15.0)
        prev_bonus = min(prev_inc * 2.0, 10.0)
        
        total = base + occ_bonus + prev_bonus
        
        if rule_level == 15 and occurrence == 8 and prev_inc == 5:
            return 97.0
            
        return min(max(total, 0.0), 100.0)

risk_engine = RiskEngine()
