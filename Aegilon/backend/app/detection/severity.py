from typing import Dict, Any

class SeverityCalculator:
    @staticmethod
    def calculate(rule: Dict[str, Any], wazuh_level: int) -> Dict[str, Any]:
        severity = rule.get("severity") or "Low"
        conditions = rule.get("conditions", {})
        confidence = int(conditions.get("confidence", 70))
        
        # Mapping base weights for risk calculation
        sev_offset = 0
        if severity == "Critical":
            sev_offset = 40
        elif severity == "High":
            sev_offset = 30
        elif severity == "Medium":
            sev_offset = 15
            
        risk_score = min(100.0, float((wazuh_level * 3.5) + sev_offset))
        
        return {
            "severity": severity,
            "confidence": confidence,
            "risk_score": round(risk_score, 2)
        }

severity_calculator = SeverityCalculator()
