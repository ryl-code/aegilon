from typing import Dict, Any, List

class DecisionEngine:
    @staticmethod
    def get_actions(incident: Dict[str, Any]) -> List[str]:
        severity = incident.get("severity", "Low")
        
        if severity == "Critical":
            return ["telegram", "kill_process", "isolate_host"]
        elif severity == "High":
            return ["telegram"]
        elif severity == "Medium":
            return ["monitor"]
        else:
            return ["none"]

decision_engine = DecisionEngine()
