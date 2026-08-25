#!/usr/bin/env bash
#
# Point the local dev site at the deployed Cloud Run service.
#
#   ./deploy/gcp/wire-local.sh
#
# Reads the service URL and the bearer token straight from GCP and rewrites the
# two lines in web/.env.local, so neither value has to be copied by hand or
# pasted anywhere it might be logged.
set -euo pipefail

PROJECT="${PROJECT:-$(gcloud config get-value project 2>/dev/null)}"
REGION="${REGION:-asia-south1}"
SERVICE="${SERVICE:-gargi-inference}"
SECRET_NAME="gargi-api-token"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$REPO_ROOT/web/.env.local"

URL="$(gcloud run services describe "$SERVICE" --region "$REGION" --project "$PROJECT" \
        --format='value(status.url)')"
TOKEN="$(gcloud secrets versions access latest --secret="$SECRET_NAME" --project "$PROJECT")"

[[ -n "$URL"   ]] || { echo "could not read the service URL" >&2; exit 1; }
[[ -n "$TOKEN" ]] || { echo "could not read the bearer token" >&2; exit 1; }

touch "$ENV_FILE"
# Replace in place if present, append if not.
for pair in "GARGI_INFERENCE_URL=$URL" "GARGI_API_TOKEN=$TOKEN"; do
  key="${pair%%=*}"
  if grep -q "^${key}=" "$ENV_FILE"; then
    # `|` as the delimiter: the values contain slashes.
    sed -i.bak "s|^${key}=.*|${pair}|" "$ENV_FILE" && rm -f "$ENV_FILE.bak"
  else
    printf '%s\n' "$pair" >> "$ENV_FILE"
  fi
done

echo "web/.env.local now points at $URL"
echo "Restart the dev server to pick it up:  cd web && npm run dev"
