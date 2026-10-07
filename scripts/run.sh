#!/usr/bin/env bash
# Run (or update) a released TVApp image. Usage: bash scripts/run.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_PATH="$SCRIPT_DIR/../docker-compose.release.yml"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed." >&2
  echo "Install Docker Engine or Desktop: https://docs.docker.com/get-docker/" >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker is installed but not running. Start Docker, then run this again." >&2
  exit 1
fi

echo "Fetching the latest TVApp image..."
docker compose -f "$COMPOSE_PATH" pull

echo "Starting TVApp..."
docker compose -f "$COMPOSE_PATH" up -d

echo ""
echo "TVApp is running: http://localhost:3000"
echo "Stop it with: docker compose -f \"$COMPOSE_PATH\" down"
