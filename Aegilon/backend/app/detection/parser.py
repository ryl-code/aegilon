import os
from typing import Dict, Any

class Parser:
    @staticmethod
    def parse_alert(alert_raw: Dict[str, Any]) -> Dict[str, str]:
        source = alert_raw.get("_source", alert_raw)
        
        process_name = ""
        path = ""
        cmdline = ""
        
        # 1. Try Osquery structure
        data = source.get("data", {})
        osquery = data.get("osquery", {})
        columns = osquery.get("columns", {})
        if columns:
            process_name = columns.get("name") or columns.get("process_name") or ""
            path = columns.get("path") or ""
            cmdline = columns.get("command_line") or columns.get("cmdline") or columns.get("cmd_line") or ""
            
        # 2. Try Sysmon / Windows Event Log structure
        win = data.get("win", {})
        eventdata = win.get("eventdata", {})
        if eventdata:
            if not path:
                path = eventdata.get("image") or eventdata.get("parentImage") or ""
            if not process_name:
                process_name = eventdata.get("originalFileName") or ""
                if not process_name and path:
                    process_name = os.path.basename(path.replace("\\", "/"))
            if not cmdline:
                cmdline = eventdata.get("commandLine") or ""
                
        # 3. Try generic process structures
        process = data.get("process", {})
        if process:
            if not process_name:
                process_name = process.get("name") or ""
            if not path:
                path = process.get("executable") or ""
            if not cmdline:
                cmdline = process.get("command_line") or ""
                
        # Fallback values
        if not process_name and "process_name" in source:
            process_name = source["process_name"]
        if not path and "path" in source:
            path = source["path"]
            
        if path and not process_name:
            process_name = os.path.basename(path.replace("\\", "/"))
            
        # Extract agent / host info
        agent = source.get("agent", {})
        hostname = agent.get("name") or source.get("host") or "unknown"
        agent_id = agent.get("id") or "000"
        
        return {
            "process_name": process_name,
            "path": path,
            "cmdline": cmdline,
            "hostname": hostname,
            "agent_id": agent_id
        }

parser = Parser()
