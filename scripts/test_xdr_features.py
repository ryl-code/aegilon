#!/usr/bin/env python3
"""
AEGILON XDR - Complete Multi-Feature Verification & Test Suite
Tests 4 Core Pillars of Aegilon:
 1. Alerts Stream (Ingestion, Stream Simulation & Processing)
 2. Incident Vault (Incident Queries, Smart Deduplication, Evidence & Audit Trail)
 3. Response Actions (SOAR Automation, Playbooks, Telegram Notifications & Response Log)
 4. Kill & Isolate (Host Containment & Process Termination Active Responses)
"""

import sys
import os
import time
import argparse
import random
from typing import Dict, Any, Optional
import httpx

# ANSI Color codes for clean terminal output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

class AegilonXDRTester:
    def __init__(self, base_url: str, email: Optional[str] = None, password: Optional[str] = None):
        self.base_url = base_url.rstrip("/")
        self.email = email or os.getenv("ADMIN_EMAIL", "admin@aegilon.com")
        self.password = password or os.getenv("ADMIN_PASSWORD", "admin123")
        self.client = httpx.Client(timeout=30.0)
        self.headers = {"Content-Type": "application/json"}
        self.token = None
        self.stats = {"passed": 0, "failed": 0, "skipped": 0}

    def print_banner(self):
        print(f"\n{CYAN}{BOLD}{'='*70}{RESET}")
        print(f"{CYAN}{BOLD} 🛡️  AEGILON XDR AUTOMATED INTEGRATION & FEATURE TEST SUITE 🛡️ {RESET}")
        print(f"{CYAN}{BOLD}{'='*70}{RESET}")
        print(f"Target Backend API: {BOLD}{self.base_url}{RESET}")
        print(f"Test Environment  : Docker Container / Automated Runner")
        print(f"Timestamp         : {time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{CYAN}{'='*70}{RESET}\n")

    def log_result(self, test_name: str, passed: bool, detail: str = ""):
        if passed:
            self.stats["passed"] += 1
            print(f"  [{GREEN}PASSED{RESET}] {BOLD}{test_name}{RESET} {f'- {detail}' if detail else ''}")
        else:
            self.stats["failed"] += 1
            print(f"  [{RED}FAILED{RESET}] {BOLD}{test_name}{RESET} {f'- {detail}' if detail else ''}")

    def authenticate(self):
        print(f"{BOLD}🔑 [AUTH] Attempting Analyst/Admin Authentication...{RESET}")
        try:
            resp = self.client.post(
                f"{self.base_url}/auth/login",
                data={"username": self.email, "password": self.password},
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            if resp.status_code == 200:
                data = resp.json()
                self.token = data.get("access_token")
                self.headers["Authorization"] = f"Bearer {self.token}"
                self.log_result("Backend JWT Login", True, f"Token acquired for {self.email}")
            else:
                self.log_result("Backend JWT Login", False, f"HTTP {resp.status_code}: {resp.text[:100]} (Continuing in unauthenticated/webhook mode)")
        except Exception as e:
            self.log_result("Backend JWT Login", False, f"Connection error: {str(e)}")

    def test_backend_health(self) -> bool:
        print(f"\n{BOLD}🏥 [HEALTH] Checking System Status...{RESET}")
        try:
            resp = self.client.get(f"{self.base_url}/health")
            if resp.status_code == 200:
                data = resp.json()
                self.log_result("Backend Health Endpoint", True, f"Status: {data.get('status', 'OK')}")
                return True
            else:
                self.log_result("Backend Health Endpoint", False, f"HTTP {resp.status_code}")
                return False
        except Exception as e:
            self.log_result("Backend Health Endpoint", False, f"Error connecting to {self.base_url}: {str(e)}")
            return False

    # -------------------------------------------------------------
    # PILLAR 1: ALERTS STREAM
    # -------------------------------------------------------------
    def test_alerts_stream(self):
        print(f"\n{CYAN}{BOLD}====================================================={RESET}")
        print(f"{CYAN}{BOLD}📡 TEST PILLAR 1: ALERTS STREAM (Ingestion & Stream){RESET}")
        print(f"{CYAN}{BOLD}====================================================={RESET}")

        # 1. Ingest Simulated Telemetry Alert via Wazuh Endpoint
        sample_wazuh_alert = {
            "rule": {
                "id": f"100{random.randint(10, 99)}",
                "description": "Suspicious Encoded PowerShell Execution with LSASS Access",
                "level": 12,
                "mitre": {"id": ["T1059.001", "T1003.001"]}
            },
            "agent": {
                "id": "001",
                "name": "win11-finance-04",
                "ip": "192.168.1.104"
            },
            "data": {
                "process": "powershell.exe",
                "command": "powershell -enc JABzAD0ATgBlAHcALQBPAGIAagBlAGMAdAA=",
                "pid": random.randint(1000, 9999)
            },
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }

        try:
            resp = self.client.post(
                f"{self.base_url}/wazuh/alerts",
                json=sample_wazuh_alert,
                headers={"Content-Type": "application/json"}
            )
            if resp.status_code in [200, 201]:
                self.log_result("Wazuh Telemetry Alert Stream Ingestion", True, f"HTTP {resp.status_code} - Alert Ingested")
            else:
                self.log_result("Wazuh Telemetry Alert Stream Ingestion", False, f"HTTP {resp.status_code}: {resp.text}")
        except Exception as e:
            self.log_result("Wazuh Telemetry Alert Stream Ingestion", False, str(e))

        # 2. Query Raw / Unprocessed Alerts Stream
        try:
            resp = self.client.get(f"{self.base_url}/alerts", headers=self.headers)
            if resp.status_code == 200:
                alerts = resp.json()
                self.log_result("Query Telemetry Alerts Stream", True, f"Retrieved {len(alerts)} alerts from stream")
            else:
                self.log_result("Query Telemetry Alerts Stream", False, f"HTTP {resp.status_code}")
        except Exception as e:
            self.log_result("Query Telemetry Alerts Stream", False, str(e))

    # -------------------------------------------------------------
    # PILLAR 2: INCIDENT VAULT
    # -------------------------------------------------------------
    def test_incident_vault(self) -> Optional[str]:
        print(f"\n{CYAN}{BOLD}====================================================={RESET}")
        print(f"{CYAN}{BOLD}🗄️  TEST PILLAR 2: INCIDENT VAULT (Storage & Lifecycle){RESET}")
        print(f"{CYAN}{BOLD}====================================================={RESET}")

        target_incident_id = None

        # 1. Fetch Incidents List
        try:
            resp = self.client.get(f"{self.base_url}/incidents", headers=self.headers)
            if resp.status_code == 200:
                incidents = resp.json()
                self.log_result("Query Incident Vault List", True, f"Found {len(incidents)} incidents stored in vault")
                if incidents:
                    target_incident_id = incidents[0].get("id")
            else:
                self.log_result("Query Incident Vault List", False, f"HTTP {resp.status_code}")
        except Exception as e:
            self.log_result("Query Incident Vault List", False, str(e))

        # 2. Fetch Incident Vault Stats
        try:
            resp = self.client.get(f"{self.base_url}/incidents/stats", headers=self.headers)
            if resp.status_code == 200:
                stats = resp.json()
                self.log_result("Query Incident Vault Metrics & Stats", True, f"Open: {stats.get('open_count', 0)}, Critical: {stats.get('critical_count', 0)}")
            else:
                self.log_result("Query Incident Vault Metrics & Stats", False, f"HTTP {resp.status_code}")
        except Exception as e:
            self.log_result("Query Incident Vault Metrics & Stats", False, str(e))

        # 3. Create New Incident directly in Vault if needed for testing
        host_id = None
        rule_id = None
        try:
            hosts_res = self.client.get(f"{self.base_url}/hosts", headers=self.headers)
            if hosts_res.status_code == 200 and hosts_res.json():
                host_id = hosts_res.json()[0].get("id")
        except Exception:
            pass

        try:
            rules_res = self.client.get(f"{self.base_url}/rules", headers=self.headers)
            if rules_res.status_code == 200 and rules_res.json():
                rule_id = rules_res.json()[0].get("id")
        except Exception:
            pass

        if host_id and rule_id:
            try:
                new_inc_payload = {
                    "title": f"TEST - Mimikatz LSASS Privilege Escalation {random.randint(100, 999)}",
                    "description": "Automated integration test incident for vault verification.",
                    "rule_id": rule_id,
                    "host_id": host_id,
                    "severity": "CRITICAL",
                    "priority": "High",
                    "category": "Privilege Escalation",
                    "confidence": 90
                }
                resp = self.client.post(f"{self.base_url}/incidents", json=new_inc_payload, headers=self.headers)
                if resp.status_code in [200, 201]:
                    created_inc = resp.json()
                    target_incident_id = created_inc.get("id")
                    self.log_result("Incident Vault Direct Manual Creation", True, f"Created Incident ID: {target_incident_id}")
                else:
                    self.log_result("Incident Vault Direct Manual Creation", False, f"HTTP {resp.status_code}: {resp.text[:100]}")
            except Exception as e:
                self.log_result("Incident Vault Direct Manual Creation", False, str(e))
        else:
            self.log_result("Incident Vault Direct Manual Creation", False, "Could not fetch valid host_id or rule_id for creation")

        # 4. Verify Evidence Alerts and Lifecycle History for the incident
        if target_incident_id:
            # Query Detail
            try:
                resp = self.client.get(f"{self.base_url}/incidents/{target_incident_id}", headers=self.headers)
                if resp.status_code == 200:
                    self.log_result("Fetch Incident Detail Record", True, f"Verified Vault Record for ID: {target_incident_id}")
                else:
                    self.log_result("Fetch Incident Detail Record", False, f"HTTP {resp.status_code}")
            except Exception as e:
                self.log_result("Fetch Incident Detail Record", False, str(e))

            # Query Evidence
            try:
                resp = self.client.get(f"{self.base_url}/incidents/{target_incident_id}/alerts", headers=self.headers)
                if resp.status_code == 200:
                    ev = resp.json()
                    self.log_result("Query Incident Evidence Grouping", True, f"Linked Evidence Alerts Count: {len(ev)}")
                else:
                    self.log_result("Query Incident Evidence Grouping", False, f"HTTP {resp.status_code}")
            except Exception as e:
                self.log_result("Query Incident Evidence Grouping", False, str(e))

            # Update Lifecycle Status (Open -> Investigating -> Contained -> Closed)
            try:
                resp = self.client.patch(
                    f"{self.base_url}/incidents/{target_incident_id}/status",
                    json={"status": "Investigating", "notes": "Automated test status transition to Investigating"},
                    headers=self.headers
                )
                if resp.status_code == 200:
                    self.log_result("Incident Lifecycle Transition (Investigating)", True, "Status updated")
                else:
                    self.log_result("Incident Lifecycle Transition (Investigating)", False, f"HTTP {resp.status_code}: {resp.text}")
            except Exception as e:
                self.log_result("Incident Lifecycle Transition (Investigating)", False, str(e))

            # Query History Audit Trail
            try:
                resp = self.client.get(f"{self.base_url}/incidents/{target_incident_id}/history", headers=self.headers)
                if resp.status_code == 200:
                    history = resp.json()
                    self.log_result("Fetch Incident Audit History Trail", True, f"History entries recorded: {len(history)}")
                else:
                    self.log_result("Fetch Incident Audit History Trail", False, f"HTTP {resp.status_code}")
            except Exception as e:
                self.log_result("Fetch Incident Audit History Trail", False, str(e))

        return target_incident_id

    # -------------------------------------------------------------
    # PILLAR 3: RESPONSE ACTIONS & SOAR
    # -------------------------------------------------------------
    def test_response_actions(self, incident_id: Optional[str]):
        print(f"\n{CYAN}{BOLD}====================================================={RESET}")
        print(f"{CYAN}{BOLD}🤖 TEST PILLAR 3: RESPONSE ACTIONS & SOAR AUTOMATION{RESET}")
        print(f"{CYAN}{BOLD}====================================================={RESET}")

        # 1. Trigger Telegram SOAR Notification Dispatch
        telegram_payload = {
            "incident_id": incident_id or f"INC-TEST-{random.randint(1000, 9999)}",
            "severity": "CRITICAL",
            "risk_score": 98.0,
            "title": "Automated SOAR Playbook Execution Test",
            "host": "srv-db-prod-01",
            "recommendation": "Isolate host immediately and terminate process PID 4892."
        }
        try:
            resp = self.client.post(f"{self.base_url}/notifications/telegram", json=telegram_payload)
            if resp.status_code in [200, 201]:
                res = resp.json()
                self.log_result("SOAR Telegram Notification Dispatch", True, f"Status: {res.get('status', 'success')}")
            else:
                self.log_result("SOAR Telegram Notification Dispatch", False, f"HTTP {resp.status_code}: {resp.text[:100]}")
        except Exception as e:
            self.log_result("SOAR Telegram Notification Dispatch", False, str(e))

        # 2. Query Playbooks Registry
        try:
            resp = self.client.get(f"{self.base_url}/playbooks", headers=self.headers)
            if resp.status_code == 200:
                playbooks = resp.json()
                self.log_result("Query SOAR Playbook Registry", True, f"Available Playbooks: {len(playbooks)}")
            else:
                self.log_result("Query SOAR Playbook Registry", False, f"HTTP {resp.status_code}")
        except Exception as e:
            self.log_result("Query SOAR Playbook Registry", False, str(e))

        # 3. Create & Log Response Action Entry
        try:
            resp_payload = {
                "incident_id": incident_id,
                "action": "Block Malicious Firewall IP & Revoke Sessions",
                "status": "executed",
                "message": "Automated SOAR playbook rule applied successfully."
            }
            resp = self.client.post(f"{self.base_url}/responses", json=resp_payload, headers=self.headers)
            if resp.status_code in [200, 201]:
                self.log_result("Log SOAR Response Action Execution", True, "Response action recorded in database")
            else:
                self.log_result("Log SOAR Response Action Execution", False, f"HTTP {resp.status_code}: {resp.text}")
        except Exception as e:
            self.log_result("Log SOAR Response Action Execution", False, str(e))

        # 4. Fetch All Response Actions History
        try:
            resp = self.client.get(f"{self.base_url}/responses", headers=self.headers)
            if resp.status_code == 200:
                responses_list = resp.json()
                self.log_result("Fetch Response Actions Execution History", True, f"Total Response Actions Logged: {len(responses_list)}")
            else:
                self.log_result("Fetch Response Actions Execution History", False, f"HTTP {resp.status_code}")
        except Exception as e:
            self.log_result("Fetch Response Actions Execution History", False, str(e))

    # -------------------------------------------------------------
    # PILLAR 4: KILL & ISOLATE
    # -------------------------------------------------------------
    def test_kill_and_isolate(self, incident_id: Optional[str] = None):
        print(f"\n{CYAN}{BOLD}====================================================={RESET}")
        print(f"{CYAN}{BOLD}⚡ TEST PILLAR 4: KILL & ISOLATE (Active Response){RESET}")
        print(f"{CYAN}{BOLD}====================================================={RESET}")

        # If incident_id not provided, try fetching one from backend
        if not incident_id:
            try:
                inc_res = self.client.get(f"{self.base_url}/incidents", headers=self.headers)
                if inc_res.status_code == 200 and inc_res.json():
                    incident_id = inc_res.json()[0].get("id")
            except Exception:
                pass

        # 1. Execute Process Kill Active Response
        kill_payload = {
            "agent_id": "001",
            "command": "kill-process",
            "arguments": ["PID_4892", "powershell.exe"]
        }
        try:
            resp = self.client.post(f"{self.base_url}/wazuh/active-response", json=kill_payload, headers=self.headers)
            if resp.status_code in [200, 201]:
                res = resp.json()
                self.log_result("Kill Malicious Process (kill-process PID)", True, f"Status: {res.get('status', 'success')}")
            else:
                # Active response endpoint might return status info or mock success
                self.log_result("Kill Malicious Process (kill-process PID)", False, f"HTTP {resp.status_code}: {resp.text[:100]}")
        except Exception as e:
            self.log_result("Kill Malicious Process (kill-process PID)", False, str(e))

        # 2. Execute Host Network Isolation Active Response
        isolate_payload = {
            "agent_id": "001",
            "command": "isolate-host",
            "arguments": ["win11-finance-04", "host-deny"]
        }
        try:
            resp = self.client.post(f"{self.base_url}/wazuh/active-response", json=isolate_payload, headers=self.headers)
            if resp.status_code in [200, 201]:
                res = resp.json()
                self.log_result("Isolate Host Network (isolate-host / host-deny)", True, f"Status: {res.get('status', 'success')}")
            else:
                self.log_result("Isolate Host Network (isolate-host / host-deny)", False, f"HTTP {resp.status_code}: {resp.text[:100]}")
        except Exception as e:
            self.log_result("Isolate Host Network (isolate-host / host-deny)", False, str(e))

        # 3. Log Active Response Containment Record in Response History
        if incident_id:
            try:
                containment_log = {
                    "incident_id": incident_id,
                    "action": "Host Isolation & Process Termination (Kill PID 4892)",
                    "status": "executed",
                    "message": "Host win11-finance-04 network interface quarantined and PID 4892 killed."
                }
                resp = self.client.post(f"{self.base_url}/responses", json=containment_log, headers=self.headers)
                if resp.status_code in [200, 201]:
                    self.log_result("Containment Record Audit Logging", True, "Kill & Isolate audit trail updated")
                else:
                    self.log_result("Containment Record Audit Logging", False, f"HTTP {resp.status_code}: {resp.text[:100]}")
            except Exception as e:
                self.log_result("Containment Record Audit Logging", False, str(e))
        else:
            self.log_result("Containment Record Audit Logging", False, "No incident_id available to link containment record")

    def run_all_tests(self):
        self.print_banner()

        healthy = self.test_backend_health()
        if not healthy:
            print(f"\n{RED}{BOLD}❌ ABORTING TEST SUITE: Aegilon Backend is not accessible at {self.base_url}.{RESET}")
            print(f"Please ensure Docker services are running: {YELLOW}docker compose up -d{RESET}\n")
            sys.exit(1)

        self.authenticate()
        self.test_alerts_stream()
        incident_id = self.test_incident_vault()
        self.test_response_actions(incident_id)
        self.test_kill_and_isolate(incident_id)

        # Summary
        print(f"\n{CYAN}{BOLD}{'='*70}{RESET}")
        print(f"{CYAN}{BOLD}📊 AEGILON XDR TEST SUITE EXECUTION SUMMARY{RESET}")
        print(f"{CYAN}{BOLD}{'='*70}{RESET}")
        print(f"  {GREEN}{BOLD}PASSED {RESET}: {self.stats['passed']}")
        print(f"  {RED}{BOLD}FAILED {RESET}: {self.stats['failed']}")
        print(f"  {YELLOW}{BOLD}SKIPPED{RESET}: {self.stats['skipped']}")

        total = self.stats['passed'] + self.stats['failed']
        pass_rate = (self.stats['passed'] / total * 100) if total > 0 else 0
        print(f"  {BOLD}Pass Rate: {pass_rate:.1f}%{RESET}")
        print(f"{CYAN}{'='*70}{RESET}\n")

        if self.stats['failed'] > 0:
            print(f"{YELLOW}⚠️ Some test assertions failed. Review log output above for details.{RESET}\n")
            sys.exit(1)
        else:
            print(f"{GREEN}{BOLD}🎉 ALL 4 AEGILON XDR CORE PILLARS PASSED TEST VALIDATION PERFECTLY!{RESET}\n")
            sys.exit(0)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Aegilon XDR 4-Pillar Automated Test Suite")
    parser.add_argument("--url", default=os.getenv("BACKEND_URL", "http://backend:8080"), help="Target Aegilon Backend URL")
    parser.add_argument("--email", default=os.getenv("ADMIN_EMAIL", "admin@aegilon.com"), help="Analyst Email")
    parser.add_argument("--password", default=os.getenv("ADMIN_PASSWORD", "admin123"), help="Analyst Password")
    args = parser.parse_args()

    tester = AegilonXDRTester(base_url=args.url, email=args.email, password=args.password)
    tester.run_all_tests()
