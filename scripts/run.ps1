<#
  Run (or update) a released TVApp image.

  Usage:  powershell -ExecutionPolicy Bypass -File scripts\run.ps1
  Or just double-click scripts\run.cmd on Windows.
#>

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ComposePath = Join-Path $ScriptDir "..\docker-compose.release.yml"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker is not installed." -ForegroundColor Red
    Write-Host "Install Docker Desktop: https://www.docker.com/products/docker-desktop/"
    exit 1
}

docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker is installed but not running. Start Docker Desktop, then run this again." -ForegroundColor Red
    exit 1
}

Write-Host "Fetching the latest TVApp image..."
docker compose -f $ComposePath pull
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Starting TVApp..."
docker compose -f $ComposePath up -d
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "TVApp is running: http://localhost:3000" -ForegroundColor Green
Write-Host "Stop it with: docker compose -f `"$ComposePath`" down"
