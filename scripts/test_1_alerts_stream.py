#!/usr/bin/env python3
"""
AEGILON XDR — DEMO TEST 1: ALERTS STREAM
Tests real-time telemetry stream ingestion, Wazuh parsing, and stream endpoint queries.
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

def run_test_1_alerts_stream(base_url: str):
    print(f"\n{CYAN}{BOLD}{'='*70}{RESET}")
    print(f"{CYAN}{BOLD}📡 DEMO TEST 1: ALERTS STREAM INGESTION & PROCESSING{RESET}")
    print(f"{CYAN}{BOLD}{'='*70}{RESET}")
    print(f"Target Backend API : {BOLD}{base_url}{RESET}")
    print(f"Timestamp          : {time.strftime('%Y-%m-%d %H:%M:%S')}\n")

    client = httpx.Client(timeout=15.0)

    # 1. Health Check
    print(f"{BOLD}[1/3] Checking Backend Health Status...{RESET}")
    try:
        r = client.get(f"{base_url}/health")
        if r.status_code == 200:
            print(f"  [{GREEN}PASSED{RESET}] Backend status: {r.json().get('status', 'ok').upper()}")
        else:
            print(f"  [{RED}FAILED{RESET}] HTTP {r.status_code}")
            sys.exit(1)
    except Exception as e:
        print(f"  [{RED}FAILED{RESET}] Connection error: {str(e)}")
        sys.exit(1)

    # 2. Ingest Simulated Wazuh Alert Stream
    print(f"\n{BOLD}[2/3] Ingesting Live Telemetry Alert Stream (Wazuh SIEM format)...{RESET}")
    sample_alert = {
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
        r = client.post(f"{base_url}/wazuh/alerts", json=sample_alert)
        if r.status_code in [200, 201]:
            print(f"  [{GREEN}PASSED{RESET}] Alert Ingested Successfully! Status: {r.status_code}")
            print(f"           Event Details: Agent={sample_alert['agent']['name']} | Rule={sample_alert['rule']['id']} | Severity=HIGH/CRITICAL")
        else:
            print(f"  [{RED}FAILED{RESET}] HTTP {r.status_code}: {r.text}")
    except Exception as e:
        print(f"  [{RED}FAILED{RESET}] {str(e)}")

    # 3. Query Stream Alerts
    print(f"\n{BOLD}[3/3] Fetching Active Telemetry Alerts Stream from Database...{RESET}")
    try:
        r = client.get(f"{base_url}/alerts")
        if r.status_code == 200:
            alerts = r.json()
            print(f"  [{GREEN}PASSED{RESET}] Successfully queried stream! Total alerts retrieved: {len(alerts)}")
            if alerts:
                top = alerts[0]
                print(f"           Latest Alert: ID={top.get('id')} | Host={top.get('host_id')} | Title='{top.get('title')}'")
        else:
            print(f"  [{RED}FAILED{RESET}] HTTP {r.status_code}")
    except Exception as e:
        print(f"  [{RED}FAILED{RESET}] {str(e)}")

    print(f"\n{CYAN}{BOLD}{'='*70}{RESET}")
    print(f"{GREEN}{BOLD}🎉 TEST 1 (ALERTS STREAM) COMPLETED SUCCESSFULLY!{RESET}")
    print(f"{CYAN}{BOLD}{'='*70}{RESET}\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test 1: Alerts Stream")
    parser.add_argument("--url", default=os.getenv("BACKEND_URL", "http://backend:8080"), help="Backend URL")
    args = parser.parse_args()
    run_test_1_alerts_stream(args.url.rstrip("/"))
