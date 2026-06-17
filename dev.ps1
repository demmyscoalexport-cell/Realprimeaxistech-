# Start all PrimeAxis dev servers (Windows PowerShell)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path .env)) {
  Write-Host "Missing .env — copy .env.example to .env and add your secrets first." -ForegroundColor Red
  exit 1
}

Write-Host "Starting API (5000), Site (5173), Studio (3333)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList '-NoExit', '-Command', "Set-Location '$PWD'; `$env:PORT='5000'; pnpm dev:api"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList '-NoExit', '-Command', "Set-Location '$PWD'; pnpm dev:site"
Start-Process powershell -ArgumentList '-NoExit', '-Command', "Set-Location '$PWD'; pnpm dev:studio"

Write-Host ""
Write-Host "Open:" -ForegroundColor Green
Write-Host "  Site:   http://localhost:5173"
Write-Host "  API:    http://localhost:5000/api/healthz"
Write-Host "  Studio: http://localhost:3333"
