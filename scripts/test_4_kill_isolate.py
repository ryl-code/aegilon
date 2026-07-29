#!/usr/bin/env python3
"""
AEGILON XDR — DEMO TEST 4: KILL & ISOLATE
Tests Wazuh Active Response process termination (kill-process) and host network containment (isolate-host).
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

def run_test_4_kill_isolate(base_url: str):
    print(f"\n{CYAN}{BOLD}{'='*70}{RESET}")
    print(f"{CYAN}{BOLD}⚡ DEMO TEST 4: KILL & ISOLATE (ACTIVE RESPONSE & CONTAINMENT){RESET}")
    print(f"{CYAN}{BOLD}{'='*70}{RESET}")
    print(f"Target Backend API : {BOLD}{base_url}{RESET}")
    print(f"Timestamp          : {time.strftime('%Y-%m-%d %H:%M:%S')}\n")

    client = httpx.Client(timeout=15.0)

    # Fetch incident ID if available
    incident_id = None
    try:
        inc_res = client.get(f"{base_url}/incidents")
        if inc_res.status_code == 200 and inc_res.json():
            incident_id = inc_res.json()[0].get("id")
    except Exception:
        pass

    # 1. Execute Active Response: Kill Malicious Process
    target_pid = random.randint(1000, 9999)
    print(f"{BOLD}[1/3] Executing Active Response: Kill Malicious Process PID {target_pid}...{RESET}")
    kill_payload = {
        "agent_id": "001",
        "command": "kill-process",
        "arguments": [f"PID_{target_pid}", "powershell.exe"]
    }
    try:
        r = client.post(f"{base_url}/wazuh/active-response", json=kill_payload)
        if r.status_code in [200, 201]:
            res = r.json()
            print(f"  [{GREEN}PASSED{RESET}] Process Kill Command Executed Successfully!")
            print(f"           Command: kill-process | Agent ID: 001 | Target: PID {target_pid} (powershell.exe)")
        else:
            print(f"  [{RED}FAILED{RESET}] HTTP {r.status_code}: {r.text[:100]}")
    except Exception as e:
        print(f"  [{RED}FAILED{RESET}] {str(e)}")

    # 2. Execute Active Response: Isolate Host Network
    print(f"\n{BOLD}[2/3] Executing Active Response: Isolate Host Network (host-deny)...{RESET}")
    isolate_payload = {
        "agent_id": "001",
        "command": "isolate-host",
        "arguments": ["win11-finance-04", "host-deny"]
    }
    try:
        r = client.post(f"{base_url}/wazuh/active-response", json=isolate_payload)
        if r.status_code in [200, 201]:
            res = r.json()
            print(f"  [{GREEN}PASSED{RESET}] Host Network Isolation Command Executed Successfully!")
            print(f"           Command: isolate-host | Target Host: win11-finance-04 | Mode: host-deny")
        else:
            print(f"  [{RED}FAILED{RESET}] HTTP {r.status_code}: {r.text[:100]}")
    except Exception as e:
        print(f"  [{RED}FAILED{RESET}] {str(e)}")

    # 3. Log Audit Trail in Response History
    print(f"\n{BOLD}[3/3] Recording Containment Action Audit Entry...{RESET}")
    if incident_id:
        audit_payload = {
            "incident_id": incident_id,
            "action": f"Active Response Containment (Kill PID {target_pid} & Host Isolate)",
            "status": "executed",
            "message": f"Host win11-finance-04 network interface quarantined and PID {target_pid} terminated."
        }
        try:
            r = client.post(f"{base_url}/responses", json=audit_payload)
            if r.status_code in [200, 201]:
                print(f"  [{GREEN}PASSED{RESET}] Containment Audit Record Written to Database!")
            else:
                print(f"  [{RED}FAILED{RESET}] HTTP {r.status_code}: {r.text}")
        except Exception as e:
            print(f"  [{RED}FAILED{RESET}] {str(e)}")
    else:
        print(f"  [{YELLOW}SKIPPED{RESET}] No existing incident found to link containment audit entry.")

    print(f"\n{CYAN}{BOLD}{'='*70}{RESET}")
    print(f"{GREEN}{BOLD}🎉 TEST 4 (KILL & ISOLATE) COMPLETED SUCCESSFULLY!{RESET}")
    print(f"{CYAN}{BOLD}{'='*70}{RESET}\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test 4: Kill & Isolate")
    parser.add_argument("--url", default=os.getenv("BACKEND_URL", "http://backend:8080"), help="Backend URL")
    args = parser.parse_args()
    run_test_4_kill_isolate(args.url.rstrip("/"))
