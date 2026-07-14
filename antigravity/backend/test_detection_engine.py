import unittest
import sys
import os

# Add parent directory to path so app can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.detection.normalizer import normalizer
from app.detection.parser import parser
from app.detection.matcher import matcher
from app.detection.severity import severity_calculator

class TestDetectionEngine(unittest.TestCase):
    def test_normalizer(self):
        self.assertEqual(normalizer.normalize_process_name("Chrome.EXE "), "chrome.exe")
        self.assertEqual(normalizer.normalize_path("C:\\Windows\\System32"), "c:/windows/system32")
        self.assertEqual(normalizer.normalize_cmdline(" SELECT 1 "), "select 1")

    def test_parser_osquery(self):
        alert = {
            "_source": {
                "data": {
                    "osquery": {
                        "columns": {
                            "name": "mimikatz.exe",
                            "path": "C:\\temp\\mimikatz.exe",
                            "command_line": "mimikatz.exe coffee"
                        }
                    }
                },
                "agent": {
                    "name": "host-01",
                    "id": "001"
                }
            }
        }
        parsed = parser.parse_alert(alert)
        self.assertEqual(parsed["process_name"], "mimikatz.exe")
        self.assertEqual(parsed["path"], "C:\\temp\\mimikatz.exe")
        self.assertEqual(parsed["cmdline"], "mimikatz.exe coffee")
        self.assertEqual(parsed["hostname"], "host-01")

    def test_matcher(self):
        parsed_alert = {
            "process_name": "powershell.exe",
            "path": "c:/windows/system32/windowspowershell/v1.0/powershell.exe",
            "cmdline": "powershell.exe -enc ..."
        }
        rules = [
            {
                "name": "Suspicious PowerShell Execution",
                "mitre": "T1059.001",
                "severity": "High",
                "conditions": {"process_name": "powershell.exe", "confidence": 80}
            }
        ]
        match = matcher.match_rule(parsed_alert, rules)
        self.assertIsNotNone(match)
        self.assertEqual(match["name"], "Suspicious PowerShell Execution")

    def test_severity_calculator(self):
        rule = {
            "severity": "High",
            "conditions": {"confidence": 80}
        }
        res = severity_calculator.calculate(rule, wazuh_level=10)
        self.assertEqual(res["severity"], "High")
        self.assertEqual(res["confidence"], 80)
        self.assertEqual(res["risk_score"], 65.0) # (10 * 3.5) + 30 = 65.0

if __name__ == "__main__":
    unittest.main()
