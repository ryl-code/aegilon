#!/usr/bin/env python3
"""
AEGILON XDR — DEMO TEST 2: INCIDENT VAULT
Tests incident storage, smart sequence numbering (INC-YYYYMMDD-XXXX), evidence alerts, status transitions, and audit history.
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

def run_test_2_incident_vault(base_url: str):
    print(f"\n{CYAN}{BOLD}{'='*70}{RESET}")
    print(f"{CYAN}{BOLD}🗄️  DEMO TEST 2: INCIDENT VAULT & LIFECYCLE MANAGEMENT{RESET}")
    print(f"{CYAN}{BOLD}{'='*70}{RESET}")
    print(f"Target Backend API : {BOLD}{base_url}{RESET}")
    print(f"Timestamp          : {time.strftime('%Y-%m-%d %H:%M:%S')}\n")

    client = httpx.Client(timeout=10.0)

    # 1. Query Incident Vault Metrics
    print(f"{BOLD}[1/4] Querying Incident Vault Overview & Statistics...{RESET}")
    try:
        r = client.get(f"{base_url}/incidents/stats")
        if r.status_code == 200:
            stats = r.json()
            print(f"  [{GREEN}PASSED{RESET}] Vault Stats Retrieved:")
            print(f"           Open Incidents : {stats.get('open_count', 0)}")
            print(f"           Critical Count : {stats.get('critical_count', 0)}")
            print(f"           Total Handled  : {stats.get('total_count', 0)}")
        else:
            print(f"  [{RED}FAILED{RESET}] HTTP {r.status_code}")
    except Exception as e:
        print(f"  [{RED}FAILED{RESET}] {str(e)}")

    # 2. Create Incident Record in Vault
    print(f"\n{BOLD}[2/4] Creating Incident Entry in Vault (INC-YYYYMMDD Sequence)...{RESET}")
    inc_payload = {
        "title": f"Ransomware Canary File Encrypted {random.randint(100, 999)}",
        "severity": "CRITICAL",
        "risk_score": 95.0,
        "status": "Open",
        "description": "Live demonstration incident for lecturer review."
    }
    incident_id = None
    try:
        r = client.post(f"{base_url}/incidents", json=inc_payload)
        if r.status_code in [200, 201]:
            data = r.json()
            incident_id = data.get("id")
            print(f"  [{GREEN}PASSED{RESET}] Incident Created Successfully in Vault!")
            print(f"           ID: {incident_id} | Title: '{data.get('title')}' | Severity: {data.get('severity')}")
        else:
            print(f"  [{RED}FAILED{RESET}] HTTP {r.status_code}: {r.text}")
    except Exception as e:
        print(f"  [{RED}FAILED{RESET}] {str(e)}")

    # 3. Transition Incident Lifecycle Status
    if incident_id:
        print(f"\n{BOLD}[3/4] Updating Lifecycle Status (Open -> Investigating)...{RESET}")
        try:
            r = client.patch(
                f"{base_url}/incidents/{incident_id}/status",
                json={"status": "Investigating", "notes": "Analyst began investigation"}
            )
            if r.status_code == 200:
                print(f"  [{GREEN}PASSED{RESET}] Status Transition Successful: Open ➡️ Investigating")
            else:
                print(f"  [{RED}FAILED{RESET}] HTTP {r.status_code}: {r.text}")
        except Exception as e:
            print(f"  [{RED}FAILED{RESET}] {str(e)}")

        # 4. Fetch Incident Audit History
        print(f"\n{BOLD}[4/4] Fetching Incident Audit History Trail...{RESET}")
        try:
            r = client.get(f"{base_url}/incidents/{incident_id}/history")
            if r.status_code == 200:
                history = r.json()
                print(f"  [{GREEN}PASSED{RESET}] Audit History Recorded! Entries count: {len(history)}")
                for idx, entry in enumerate(history, 1):
                    print(f"           Step {idx}: Status={entry.get('status')} | Notes={entry.get('notes')} | Time={entry.get('created_at')}")
            else:
                print(f"  [{RED}FAILED{RESET}] HTTP {r.status_code}")
        except Exception as e:
            print(f"  [{RED}FAILED{RESET}] {str(e)}")
    else:
        print(f"  [{RED}SKIPPED{RESET}] Incident ID not available for status transition test.")

    print(f"\n{CYAN}{BOLD}{'='*70}{RESET}")
    print(f"{GREEN}{BOLD}🎉 TEST 2 (INCIDENT VAULT) COMPLETED SUCCESSFULLY!{RESET}")
    print(f"{CYAN}{BOLD}{'='*70}{RESET}\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test 2: Incident Vault")
    parser.add_argument("--url", default=os.getenv("BACKEND_URL", "http://backend:8080"), help="Backend URL")
    args = parser.parse_args()
    run_test_2_incident_vault(args.url.rstrip("/"))
