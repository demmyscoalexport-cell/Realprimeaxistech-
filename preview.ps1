# PrimeAxis Tech — verify production build, then preview
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path .env)) {
  Write-Host "Missing .env — copy .env.example to .env and add your Sanity token." -ForegroundColor Red
  exit 1
}

Write-Host "Building site and API..." -ForegroundColor Cyan
$env:PORT = "5173"
$env:BASE_PATH = "/"
pnpm --filter @workspace/primeaxis run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$env:PORT = "5000"
pnpm --filter @workspace/api-server run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Build OK. Start preview in two terminals:" -ForegroundColor Green
Write-Host "  1) `$env:PORT='5000'; pnpm dev:api" -ForegroundColor Gray
Write-Host "  2) `$env:PORT='5173'; `$env:BASE_PATH='/'; pnpm --filter @workspace/primeaxis run serve" -ForegroundColor Gray
Write-Host ""
Write-Host "Open http://localhost:5173" -ForegroundColor Green
