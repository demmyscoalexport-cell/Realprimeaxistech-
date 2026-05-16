# PrimeAxis Tech — one-command bootstrap for Windows / PowerShell / VS Code.
# Run from inside the unpacked bundle's `source/` folder:
#   powershell -ExecutionPolicy Bypass -File .\start.ps1

$ErrorActionPreference = "Stop"
Write-Host "▶ PrimeAxis Tech bootstrap" -ForegroundColor Cyan

# 1. tooling check
function Need($cmd, $hint) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    Write-Host "  ✗ Missing: $cmd  →  $hint" -ForegroundColor Red
    exit 1
  }
}
Need node    "Install Node 24:  winget install OpenJS.NodeJS"
Need pnpm    "Install pnpm:     npm install -g pnpm"
Write-Host "  ✓ node $(node -v)  pnpm $(pnpm -v)"

# 2. .env
if (-not (Test-Path .env)) {
  if (Test-Path ..\.env.template) {
    Copy-Item ..\.env.template .env
    Write-Host "  ✓ Created .env from template — opening in Notepad. Fill in your secrets, save, then re-run this script." -ForegroundColor Yellow
    Start-Process notepad .env -Wait
  } else {
    Write-Host "  ✗ No .env and no ..\.env.template found." -ForegroundColor Red; exit 1
  }
}

# 3. load .env into this session
Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*([^#=]+?)\s*=\s*(.*)\s*$') {
    [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
  }
}
Write-Host "  ✓ Loaded .env into session"

# 4. install deps
Write-Host "▶ Installing dependencies (pnpm install)…"
pnpm install

# 5. push DB schema
if ($env:DATABASE_URL) {
  Write-Host "▶ Pushing DB schema…"
  pnpm --filter @workspace/db run push
} else {
  Write-Host "  ⚠ DATABASE_URL not set — skipping db push" -ForegroundColor Yellow
}

# 6. (optional) restore Sanity content
if ((Test-Path ..\sanity\dataset.ndjson) -and $env:SANITY_API_TOKEN) {
  $ans = Read-Host "Restore Sanity dataset from ..\sanity\dataset.ndjson? [y/N]"
  if ($ans -eq "y") {
    if (-not (Get-Command sanity -ErrorAction SilentlyContinue)) {
      npm install -g @sanity/cli
    }
    sanity dataset import ..\sanity\dataset.ndjson $env:SANITY_DATASET --replace
  }
}

# 7. launch all three dev servers in separate windows
Write-Host "▶ Launching dev servers in 3 new windows…" -ForegroundColor Green
Start-Process powershell -ArgumentList '-NoExit','-Command','pnpm --filter @workspace/api-server run dev'
Start-Process powershell -ArgumentList '-NoExit','-Command','pnpm --filter @workspace/primeaxis run dev'
Start-Process powershell -ArgumentList '-NoExit','-Command','pnpm --filter @workspace/studio run dev'

Write-Host ""
Write-Host "✅ Done. Open VS Code with:  code ." -ForegroundColor Green
Write-Host "   API:     http://localhost:5000"
Write-Host "   Site:    (port shown in the primeaxis window)"
Write-Host "   Studio:  http://localhost:3333"
