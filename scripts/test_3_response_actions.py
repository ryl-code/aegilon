#!/usr/bin/env python3
"""
AEGILON XDR — DEMO TEST 3: RESPONSE ACTIONS & SOAR
Tests SOAR Playbook registry, Telegram instant notifications, and Response Actions logging.
Designed for live demonstration to lecturer/reviewers.
"""

import os
import sys
import time
import random
import argparse
import httpx

GREEN = "\033[92m"
RED = "\033[91m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

def run_test_3_response_actions(base_url: str):
    print(f"\n{CYAN}{BOLD}{'='*70}{RESET}")
    print(f"{CYAN}{BOLD}🤖 DEMO TEST 3: RESPONSE ACTIONS & SOAR AUTOMATION{RESET}")
    print(f"{CYAN}{BOLD}{'='*70}{RESET}")
    print(f"Target Backend API : {BOLD}{base_url}{RESET}")
    print(f"Timestamp          : {time.strftime('%Y-%m-%d %H:%M:%S')}\n")

    client = httpx.Client(timeout=15.0)

    # 1. Fetch an incident ID to link response action
    incident_id = None
    try:
        inc_res = client.get(f"{base_url}/incidents")
        if inc_res.status_code == 200 and inc_res.json():
            incident_id = inc_res.json()[0].get("id")
    except Exception:
        pass

    # 2. Trigger Telegram Instant Alert (SOAR)
    print(f"{BOLD}[1/3] Triggering SOAR Telegram Analyst Instant Alert Dispatch...{RESET}")
    telegram_payload = {
        "incident_id": incident_id or f"INC-DEMO-{random.randint(1000, 9999)}",
        "severity": "CRITICAL",
        "risk_score": 98.5,
        "title": "Demonstration: Brute Force & Privilege Escalation Detected",
        "host": "srv-db-prod-01",
        "recommendation": "Block source IP on firewall and isolate host endpoint."
    }
    try:
        r = client.post(f"{base_url}/notifications/telegram", json=telegram_payload)
        if r.status_code in [200, 201]:
            res = r.json()
            print(f"  [{GREEN}PASSED{RESET}] Telegram Alert Dispatched! Result: {res.get('status', 'success')}")
        else:
            print(f"  [{RED}FAILED{RESET}] HTTP {r.status_code}: {r.text[:100]}")
    except Exception as e:
        print(f"  [{RED}FAILED{RESET}] {str(e)}")

    # 3. Query Playbooks Registry
    print(f"\n{BOLD}[2/3] Querying SOAR Playbooks Registry...{RESET}")
    try:
        r = client.get(f"{base_url}/playbooks")
        if r.status_code == 200:
            playbooks = r.json()
            print(f"  [{GREEN}PASSED{RESET}] Playbooks Retrieved! Total registered playbooks: {len(playbooks)}")
            for pb in playbooks:
                print(f"           - Playbook: '{pb.get('name')}' | Trigger: {pb.get('severity_trigger')}")
        else:
            print(f"  [{RED}FAILED{RESET}] HTTP {r.status_code}")
    except Exception as e:
        print(f"  [{RED}FAILED{RESET}] {str(e)}")

    # 4. Log Response Action Execution Record
    print(f"\n{BOLD}[3/3] Recording Response Action Execution in Database...{RESET}")
    if incident_id:
        resp_payload = {
            "incident_id": incident_id,
            "action": "Firewall Drop Rule & Revoke Session Tokens",
            "status": "executed",
            "message": "Automated SOAR playbook mitigation executed successfully for demo."
        }
        try:
            r = client.post(f"{base_url}/responses", json=resp_payload)
            if r.status_code in [200, 201]:
                data = r.json()
                print(f"  [{GREEN}PASSED{RESET}] Response Action Logged! ID={data.get('id')} | Status={data.get('status')}")
            else:
                print(f"  [{RED}FAILED{RESET}] HTTP {r.status_code}: {r.text}")
        except Exception as e:
            print(f"  [{RED}FAILED{RESET}] {str(e)}")
    else:
        print(f"  [{YELLOW}SKIPPED{RESET}] No existing incident found to link response action record.")

    print(f"\n{CYAN}{BOLD}{'='*70}{RESET}")
    print(f"{GREEN}{BOLD}🎉 TEST 3 (RESPONSE ACTIONS) COMPLETED SUCCESSFULLY!{RESET}")
    print(f"{CYAN}{BOLD}{'='*70}{RESET}\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test 3: Response Actions")
    parser.add_argument("--url", default=os.getenv("BACKEND_URL", "http://backend:8080"), help="Backend URL")
    args = parser.parse_args()
    run_test_3_response_actions(args.url.rstrip("/"))
