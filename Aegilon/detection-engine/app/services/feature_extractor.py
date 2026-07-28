import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class FeatureExtractor:
    @staticmethod
    def extract_features(alert: Dict[str, Any]) -> Dict[str, Any]:
        raw_log = alert.get("raw_log", {})
        source = raw_log.get("_source", raw_log)
        
        rule_level = alert.get("wazuh_level", 0)
        rule_id = alert.get("rule_id", "")
        hostname = alert.get("host", {}).get("hostname", "unknown") if alert.get("host") else "unknown"
        timestamp = alert.get("created_at", "")
        description = alert.get("description", "")
        
        data = source.get("data", {})
        osquery = data.get("osquery", {})
        columns = osquery.get("columns", {})
        
        process_name = ""
        command_line = ""
        parent_process = ""
        file_path = ""
        
        if columns:
            process_name = columns.get("name") or columns.get("process_name") or ""
            command_line = columns.get("command_line") or columns.get("cmdline") or ""
            parent_process = columns.get("parent") or columns.get("ppid") or ""
            file_path = columns.get("path") or columns.get("file_path") or ""
            
        network_connection = False
        if "network" in data or "socket" in data or "port" in description.lower():
            network_connection = True
            
        frequency = 1
        
        features = {
            "rule_level": rule_level,
            "rule_id": rule_id,
            "process_name": process_name,
            "hostname": hostname,
            "command_line": command_line,
            "parent_process": parent_process,
            "timestamp": timestamp,
            "frequency": frequency,
            "network_connection": network_connection,
            "file_path": file_path,
            "description": description
        }
        return features

feature_extractor = FeatureExtractor()
