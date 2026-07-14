from typing import Dict, Any

class RecommendationEngine:
    @staticmethod
    def get_recommendation(severity: str, features: Dict[str, Any]) -> str:
        if severity == "Critical":
            return "Notify SOC + Kill Process + Isolate Host"
        elif severity == "High":
            return "Notify SOC"
        elif severity == "Medium":
            return "Monitor"
        else:
            return "Store"

recommendation_engine = RecommendationEngine()
