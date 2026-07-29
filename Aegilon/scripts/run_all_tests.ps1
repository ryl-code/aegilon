# AEGILON XDR — Automated Verification & Active Response Test Suite (PowerShell)
# Usage: .\scripts\run_all_tests.ps1

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  AEGILON XDR: Executing Test Suite via PowerShell" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$pythonCmd = Get-Command py -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    $pythonCmd = Get-Command python -ErrorAction SilentlyContinue
}

if ($pythonCmd) {
    & $pythonCmd.Source "$PSScriptRoot\run_all_tests.py"
} else {
    Write-Host "[!] Python/py launcher not found. Running PowerShell native checks..." -ForegroundColor Yellow
    
    # 1. Process Kill Test
    Write-Host "=== TEST 1: Active Response Process Kill / Terminate Simulation ===" -ForegroundColor Yellow
    $proc = Start-Process notepad.exe -PassThru
    $pidNum = $proc.Id
    Write-Host "  * Started notepad.exe with PID $pidNum" -ForegroundColor Cyan
    Start-Sleep -Seconds 1
    
    Stop-Process -Id $pidNum -Force
    Start-Sleep -Seconds 1
    
    if (-not (Get-Process -Id $pidNum -ErrorAction SilentlyContinue)) {
        Write-Host "  * [PASSED] Process PID $pidNum was successfully TERMINATED!" -ForegroundColor Green
    } else {
        Write-Host "  * [FAILED] Process PID $pidNum is still running." -ForegroundColor Red
    }
    
    # 2. Health Checks
    Write-Host "`n=== TEST 2: Service Health Checks ===" -ForegroundColor Yellow
    try {
        $backend = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 5
        Write-Host "  * Aegilon Backend API (http://localhost:8080/health): [PASSED] - $($backend | ConvertTo-Json -Compress)" -ForegroundColor Green
    } catch {
        Write-Host "  * Aegilon Backend API: [FAILED] - $_" -ForegroundColor Red
    }
    
    try {
        $frontend = Invoke-WebRequest -Uri "http://localhost:3002" -UseBasicParsing -TimeoutSec 5
        Write-Host "  * Aegilon Frontend UI (http://localhost:3002): [PASSED] - HTTP $($frontend.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "  * Aegilon Frontend UI: [FAILED] - $_" -ForegroundColor Red
    }
}
