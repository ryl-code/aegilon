import time
import random
import argparse
import sys
import httpx
from datetime import datetime

# Sample security threat templates for realistic presentation
INCIDENTS_TEMPLATES = [
    {
        "title": "Brute Force SSH Attack Detected",
        "severity": "HIGH",
        "category": "Authentication",
        "recommendation": "Block source IP on edge firewall and enforce fail2ban."
    },
    {
        "title": "Ransomware Canary File Encrypted",
        "severity": "CRITICAL",
        "category": "Ransomware",
        "recommendation": "Isolate host from network immediately and terminate process."
    },
    {
        "title": "Suspicious Encoded PowerShell Execution",
        "severity": "HIGH",
        "category": "Execution",
        "recommendation": "Inspect process tree PID %d and check parent process."
    },
    {
        "title": "Unauthorized Admin Privilege Escalation",
        "severity": "CRITICAL",
        "category": "Privilege Escalation",
        "recommendation": "Revoke active session tokens and reset user account credentials."
    },
    {
        "title": "SQL Injection Attempt Detected on Web Endpoint",
        "severity": "MEDIUM",
        "category": "Web Application",
        "recommendation": "Enable WAF rule #4092 and sanitize API query parameters."
    },
    {
        "title": "Internal Network Reconnaissance (Port Scan)",
        "severity": "LOW",
        "category": "Reconnaissance",
        "recommendation": "Verify host scan permission with internal SOC team."
    },
    {
        "title": "Mimikatz LSASS Memory Access Attempt",
        "severity": "CRITICAL",
        "category": "Credential Access",
        "recommendation": "Kill LSASS handle and isolate compromised endpoint."
    },
    {
        "title": "Persistence Mechanism Created (HKLM Run Key)",
        "severity": "MEDIUM",
        "category": "Persistence",
        "recommendation": "Remove registry subkey and quarantine executable."
    },
    {
        "title": "DNS Tunneling Data Exfiltration Activity",
        "severity": "HIGH",
        "category": "Exfiltration",
        "recommendation": "Block rogue DNS resolver and inspect network traffic."
    },
    {
        "title": "Unauthorized File Download from Unknown IP",
        "severity": "LOW",
        "category": "Policy Violation",
        "recommendation": "Notify user manager and review proxy logs."
    }
]

HOSTS = [
    "srv-db-prod-01",
    "win11-finance-04",
    "web-nginx-prod",
    "k8s-worker-node-02",
    "dc-primary-ad-01"
]

def run_simulation(target_url: str, delay_seconds: float, limit: int = None):
    print("=" * 60)
    print("🚀 AEGILON REAL-TIME ALERT SIMULATOR FOR N8N TELEGRAM NOTIFICATIONS")
    print(f"Target Endpoint : {target_url}")
    print(f"Interval        : Every {delay_seconds} seconds")
    print("Press CTRL+C to stop the simulator at any time.")
    print("=" * 60 + "\n")

    count = 0
    try:
        with httpx.Client(timeout=10.0) as client:
            while True:
                count += 1
                template = random.choice(INCIDENTS_TEMPLATES)
                host = random.choice(HOSTS)
                inc_id = f"INC-DEMO-{random.randint(1000, 9999)}"
                risk_score = round(random.uniform(20.0, 99.5), 1)

                recommendation = template["recommendation"]
                if "%d" in recommendation:
                    recommendation = recommendation % random.randint(1000, 9999)

                payload = {
                    "incident_id": inc_id,
                    "title": template["title"],
                    "severity": template["severity"],
                    "risk_score": risk_score,
                    "host": host,
                    "recommendation": recommendation
                }

                now_time = datetime.now().strftime("%H:%M:%S")
                print(f"[{now_time}] Sending Alert #{count} | {inc_id} | {template['severity']} | {template['title']}... ", end="")

                try:
                    resp = client.post(target_url, json=payload)
                    if resp.status_code in [200, 201]:
                        print("✅ SENT (200 OK)")
                    else:
                        print(f"⚠️ FAILED ({resp.status_code}: {resp.text})")
                except Exception as e:
                    print(f"❌ ERROR: {str(e)}")

                if limit and count >= limit:
                    print(f"\nReached total limit of {limit} alerts. Simulation complete!")
                    break

                time.sleep(delay_seconds)
    except KeyboardInterrupt:
        print("\n\n⏹️ Simulator stopped by user. Total alerts sent:", count)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Aegilon Continuous Alert Generator for Presentation")
    parser.add_argument("--url", default="http://localhost:8080/api/notifications/telegram", help="Target API URL")
    parser.add_argument("--interval", type=float, default=3.0, help="Interval between alerts in seconds")
    parser.add_argument("--limit", type=int, default=None, help="Optional max number of alerts to send")
    args = parser.parse_args()

    run_simulation(args.url, args.interval, args.limit)
