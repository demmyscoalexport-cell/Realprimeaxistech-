# Pre-deploy checklist: build for Vercel, then smoke-test local API routes.
$ErrorActionPreference = "Stop"
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $root

Write-Host "=== build:vercel ===" -ForegroundColor Cyan
pnpm run build:vercel
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n=== check-apis ===" -ForegroundColor Cyan
& "$PSScriptRoot/check-apis.ps1"
exit $LASTEXITCODE
