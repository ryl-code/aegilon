"""
AEGILON XDR — Automated Verification & Active Response Test Suite
Run this script to test system health, container statuses, and active response process termination.

Usage:
    python scripts/run_all_tests.py
    or
    py scripts/run_all_tests.py
"""

import urllib.request
import urllib.error
import subprocess
import json
import time
import os
import sys

# Color codes for pretty terminal output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

def print_header(title):
    print(f"\n{CYAN}{BOLD}{'=' * 70}{RESET}")
    print(f"{CYAN}{BOLD}  AEGILON XDR: {title}{RESET}")
    print(f"{CYAN}{BOLD}{'=' * 70}{RESET}\n")

def test_http_health(url, expected_status=200):
    """Test an HTTP endpoint health."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "AegilonTestRunner/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.status
            body = response.read().decode('utf-8')
            if status == expected_status:
                try:
                    data = json.loads(body)
                    return True, f"HTTP {status} OK — {json.dumps(data)}"
                except Exception:
                    return True, f"HTTP {status} OK"
            else:
                return False, f"Unexpected HTTP status {status}"
    except urllib.error.HTTPError as e:
        return False, f"HTTP Error {e.code}: {e.reason}"
    except urllib.error.URLError as e:
        return False, f"Connection Failed: {e.reason}"
    except Exception as e:
        return False, f"Error: {str(e)}"

def test_docker_containers(required_containers):
    """Check running docker containers."""
    try:
        res = subprocess.run(
            'docker ps --format "{{.Names}}|{{.Status}}"',
            capture_output=True,
            text=True,
            shell=True
        )
        if res.returncode != 0:
            return False, {"error": f"Docker CLI error (code {res.returncode}): {res.stderr.strip()}"}

        lines = [line.strip() for line in res.stdout.strip().split("\n") if line.strip()]
        running_dict = {}
        for line in lines:
            parts = line.split("|")
            if len(parts) == 2:
                running_dict[parts[0]] = parts[1]

        results = {}
        for container in required_containers:
            if container in running_dict:
                results[container] = (True, running_dict[container])
            else:
                results[container] = (False, "NOT RUNNING")
        return True, results
    except Exception as e:
        return False, {"error": str(e)}

def test_process_kill_simulation():
    """Simulate active response process termination (Kill Process)."""
    print(f"{BOLD}[1/4] Spawning dummy target process (notepad.exe)...{RESET}")
    try:
        proc = subprocess.Popen(["notepad.exe"])
        pid = proc.pid
        print(f"      -> Process started with {CYAN}PID {pid}{RESET}")
    except Exception as e:
        return False, f"Failed to spawn dummy process: {str(e)}"

    time.sleep(1.0)
    if proc.poll() is not None:
        return False, f"Process died immediately with code {proc.poll()}"

    print(f"{BOLD}[2/4] Verifying process is active...{RESET}")
    print(f"      -> {GREEN}Verified PID {pid} is RUNNING.{RESET}")

    print(f"{BOLD}[3/4] Executing Active Response Action: 'Kill Process' on PID {pid}...{RESET}")
    try:
        kill_cmd = f"taskkill /PID {pid} /F"
        res = subprocess.run(kill_cmd, shell=True, capture_output=True, text=True)
        cmd_out = res.stdout.strip() or res.stderr.strip()
        print(f"      -> Active Response Command Output: {cmd_out}")
    except Exception as e:
        return False, f"Execution failed: {str(e)}"

    time.sleep(1.0)
    print(f"{BOLD}[4/4] Verifying process termination status...{RESET}")
    if proc.poll() is not None:
        return True, f"Process PID {pid} was successfully KILLED / TERMINATED!"
    else:
        proc.kill()
        return False, f"Process PID {pid} remained running after kill command."

def main():
    print_header("AUTOMATED SYSTEM VERIFICATION & ACTIVE RESPONSE TEST SUITE")
    
    test_summary = []

    # -------------------------------------------------------------
    # STEP 1: Process Kill / Terminate Active Response Test
    # -------------------------------------------------------------
    print(f"{BOLD}=== TEST 1: Active Response Process Kill / Terminate Simulation ==={RESET}\n")
    kill_success, kill_msg = test_process_kill_simulation()
    if kill_success:
        print(f"\nResult: {GREEN}{BOLD}[PASSED] {kill_msg}{RESET}\n")
        test_summary.append(("Active Response Process Termination", True, kill_msg))
    else:
        print(f"\nResult: {RED}{BOLD}[FAILED] {kill_msg}{RESET}\n")
        test_summary.append(("Active Response Process Termination", False, kill_msg))

    # -------------------------------------------------------------
    # STEP 2: HTTP Health Endpoints Test
    # -------------------------------------------------------------
    print(f"{CYAN}{'-' * 70}{RESET}")
    print(f"{BOLD}=== TEST 2: Aegilon Service HTTP Health Checks ==={RESET}\n")

    endpoints = [
        ("AEGILON Backend API", "http://localhost:8080/health"),
        ("AEGILON Frontend UI", "http://localhost:3002")
    ]

    for name, url in endpoints:
        ok, msg = test_http_health(url)
        status_str = f"{GREEN}[PASSED]{RESET}" if ok else f"{RED}[FAILED]{RESET}"
        print(f"  * {name:<25} ({url}): {status_str} — {msg}")
        test_summary.append((f"Service Health: {name}", ok, msg))

    # -------------------------------------------------------------
    # STEP 3: Docker Containers Status Check
    # -------------------------------------------------------------
    print(f"\n{CYAN}{'-' * 70}{RESET}")
    print(f"{BOLD}=== TEST 3: Docker Container Infrastructure Status ==={RESET}\n")

    target_containers = [
        "aegilon-backend",
        "aegilon-frontend",
        "aegilon-automation-engine",
        "aegilon-detection-engine",
        "aegilon-risk-engine",
        "single-node-wazuh.manager-1"
    ]

    ok, c_data = test_docker_containers(target_containers)
    if ok and isinstance(c_data, dict):
        all_containers_ok = True
        for cname, (c_ok, c_status) in c_data.items():
            status_str = f"{GREEN}[PASSED]{RESET}" if c_ok else f"{RED}[FAILED]{RESET}"
            print(f"  * Container {cname:<30}: {status_str} — {c_status}")
            if not c_ok:
                all_containers_ok = False
        test_summary.append(("Docker Containers Infrastructure", all_containers_ok, "All required containers online" if all_containers_ok else "Some containers offline"))
    else:
        err_msg = c_data.get("error", "Failed to query Docker")
        print(f"  {RED}[FAILED] {err_msg}{RESET}")
        test_summary.append(("Docker Containers Infrastructure", False, err_msg))

    # -------------------------------------------------------------
    # FINAL SUMMARY REPORT TABLE
    # -------------------------------------------------------------
    print_header("TEST RESULTS SUMMARY REPORT")
    print(f"{'Component / Test Case':<45} | {'Result':<10} | {'Details'}")
    print("-" * 80)

    total_passed = 0
    for name, success, details in test_summary:
        res_str = f"{GREEN}PASSED{RESET}" if success else f"{RED}FAILED{RESET}"
        if success:
            total_passed += 1
        print(f"{name:<45} | {res_str:<19} | {details[:40]}")

    print("-" * 80)
    overall_status = f"{GREEN}{BOLD}ALL TESTS PASSED ({total_passed}/{len(test_summary)}){RESET}" if total_passed == len(test_summary) else f"{RED}{BOLD}SOME TESTS FAILED ({total_passed}/{len(test_summary)}){RESET}"
    print(f"Overall Status: {overall_status}\n")

    sys.exit(0 if total_passed == len(test_summary) else 1)

if __name__ == "__main__":
    main()
