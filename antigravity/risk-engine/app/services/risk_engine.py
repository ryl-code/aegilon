from typing import Dict, Any, Tuple

class RiskEngine:
    @staticmethod
    def calculate_risk(features: Dict[str, Any]) -> float:
        score, _ = RiskEngine.calculate_risk_breakdown(features)
        return score

    @staticmethod
    def calculate_risk_breakdown(features: Dict[str, Any]) -> Tuple[float, Dict[str, float]]:
        rule_level = features.get("rule_level", 0)
        occurrence = features.get("occurrence_count", 1)
        prev_inc = features.get("previous_incident_count", 0)
        host_criticality = features.get("host_criticality", 1.0)
        
        # 1. Base Rule Severity Score (Max 50 points: rule_level 1-15 mapped to 50)
        base_score = min((rule_level / 15.0) * 50.0, 50.0)
        
        # 2. Occurrence Frequency Score (Max 30 points: occurrence count)
        occ_score = min((occurrence - 1) * 3.0, 30.0)
        
        # 3. Asset / Incident History Bonus (Max 20 points)
        prev_score = min(prev_inc * 4.0, 20.0)
        
        raw_total = (base_score + occ_score + prev_score) * host_criticality
        total_score = min(max(round(raw_total, 1), 0.0), 100.0)
        
        breakdown = {
            "base_score": round(base_score, 1),
            "occurrence_score": round(occ_score, 1),
            "asset_score": round(prev_score, 1),
            "total_score": total_score
        }
        
        return total_score, breakdown

risk_engine = RiskEngine()
