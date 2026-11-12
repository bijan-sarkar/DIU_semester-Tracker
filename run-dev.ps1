# DIU CSE Semester & Exam Tracker - Local Development Runner
Write-Host "=======================================================" -ForegroundColor Green
Write-Host " DIU CSE Semester & Exam Tracker - Starting Services   " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Green

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$VenvPython = Join-Path $Root ".venv\Scripts\python.exe"

if (-not (Test-Path $VenvPython)) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    py -m venv .venv
    & $VenvPython -m pip install -r backend\requirements.txt
}

$DbPath = Join-Path $Root "backend\diu_tracker.db"
$RootDbPath = Join-Path $Root "diu_tracker.db"

if (-not (Test-Path $DbPath) -and -not (Test-Path $RootDbPath)) {
    Write-Host "Seeding initial DIU course database..." -ForegroundColor Yellow
    & $VenvPython backend\seed_data.py
}

Write-Host "`n[1/2] Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Green
$BackendJob = Start-Process -FilePath $VenvPython -ArgumentList "-m uvicorn app.main:app --reload --port 8000" -WorkingDirectory (Join-Path $Root "backend") -PassThru

Write-Host "[2/2] Starting Vite Frontend on http://localhost:5173 ..." -ForegroundColor Green
$FrontendJob = Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory (Join-Path $Root "frontend") -PassThru

Write-Host "`nAll services launched successfully!" -ForegroundColor Cyan
Write-Host "- Frontend Application: http://localhost:5173" -ForegroundColor White
Write-Host "- Backend API & Docs:   http://localhost:8000/docs" -ForegroundColor White
Write-Host "- 1-Click Demo Login:   Available directly on the UI" -ForegroundColor White
Write-Host "`nPress Ctrl+C to exit and stop processes.`n"

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "Stopping backend and frontend processes..." -ForegroundColor Yellow
    Stop-Process -Id $BackendJob.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $FrontendJob.Id -ErrorAction SilentlyContinue
}
