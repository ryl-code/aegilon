class SeverityEngine:
    @staticmethod
    def classify_severity(risk_score: float) -> str:
        if risk_score >= 85.0:
            return "Critical"
        elif risk_score >= 60.0:
            return "High"
        elif risk_score >= 30.0:
            return "Medium"
        else:
            return "Low"

severity_engine = SeverityEngine()
