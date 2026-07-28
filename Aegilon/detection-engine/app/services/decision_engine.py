from typing import Dict, Any

class DecisionEngine:
    @staticmethod
    def decide_action(severity: str, features: Dict[str, Any]) -> str:
        description = features.get("description", "").lower()
        process_name = features.get("process_name", "").lower()
        
        if severity == "Critical":
            if "mimikatz" in description or "dump" in description:
                return "Isolate Host + Kill Process"
            return "Kill Process"
        elif severity == "High":
            if "powershell" in process_name or "cmd.exe" in process_name:
                return "Block Execution"
            return "Notify"
        elif severity == "Medium":
            return "Store"
        else:
            return "Store"

decision_engine = DecisionEngine()
