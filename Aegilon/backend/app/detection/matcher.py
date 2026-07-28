from typing import Dict, Any, List, Optional
from app.detection.normalizer import normalizer

class Matcher:
    @staticmethod
    def match_rule(parsed_alert: Dict[str, str], rules: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        alert_proc = normalizer.normalize_process_name(parsed_alert.get("process_name", ""))
        alert_path = normalizer.normalize_path(parsed_alert.get("path", ""))
        alert_cmdline = normalizer.normalize_cmdline(parsed_alert.get("cmdline", ""))
        
        for rule in rules:
            conditions = rule.get("conditions", {})
            if not conditions:
                continue
                
            # 1. Match process_name (exact match if specified)
            rule_proc = normalizer.normalize_process_name(conditions.get("process_name", ""))
            if rule_proc and alert_proc != rule_proc:
                continue
                
            # 2. Match path_contains (substring check if specified)
            rule_path_contains = normalizer.normalize_path(conditions.get("path_contains", ""))
            if rule_path_contains and rule_path_contains not in alert_path:
                continue
                
            # 3. Match cmdline_contains (substring check if specified)
            rule_cmd_contains = normalizer.normalize_cmdline(conditions.get("cmdline_contains", ""))
            if rule_cmd_contains and rule_cmd_contains not in alert_cmdline:
                continue
                
            # If all conditions satisfied, we have a match
            return rule
            
        return None

matcher = Matcher()
