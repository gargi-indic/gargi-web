#!/usr/bin/env bash
#
# Deploy the Gargi inference service to Cloud Run.
#
#   ./deploy/gcp/deploy.sh                 # deploy (creates the secret first run)
#   REGION=us-central1 ./deploy/gcp/deploy.sh
#   MIN_INSTANCES=1 ./deploy/gcp/deploy.sh # keep one warm, no cold starts (costs money)
#
# Re-running is how you ship a change; Cloud Run keeps revisions and rolls
# traffic over only once the new one passes its health check.
set -euo pipefail

PROJECT="${PROJECT:-$(gcloud config get-value project 2>/dev/null)}"
# Mumbai: the audience for a Malayalam model is overwhelmingly in India, and
# this saves ~200ms per request over a US region. us-central1 is cheaper if
# that matters more than latency.
REGION="${REGION:-asia-south1}"
SERVICE="${SERVICE:-gargi-inference}"
MIN_INSTANCES="${MIN_INSTANCES:-0}"
MAX_INSTANCES="${MAX_INSTANCES:-2}"
SECRET_NAME="gargi-api-token"

[[ -n "$PROJECT" ]] || { echo "No project set. Run: gcloud config set project <id>" >&2; exit 1; }

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT/inference"

echo "==> Project $PROJECT / region $REGION / service $SERVICE"

echo "==> Enabling APIs (no-op if already on)"
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  --project "$PROJECT" --quiet

echo "==> Bearer token"
if ! gcloud secrets describe "$SECRET_NAME" --project "$PROJECT" &>/dev/null; then
  # Generated here and stored in Secret Manager, so the token never sits in a
  # shell history, a env file, or this repo.
  # tr -d '\n' matters: without it the newline openssl emits becomes part of the
  # secret, and every request 401s against a token that prints identically.
  openssl rand -hex 32 | tr -d '\n' | gcloud secrets create "$SECRET_NAME" \
    --data-file=- --replication-policy=automatic --project "$PROJECT" --quiet
  echo "    created secret $SECRET_NAME"
else
  echo "    secret $SECRET_NAME already exists, reusing"
fi

SA="$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')-compute@developer.gserviceaccount.com"

# Cloud Run's runtime service account needs to read the secret.
gcloud secrets add-iam-policy-binding "$SECRET_NAME" \
  --member="serviceAccount:$SA" --role=roles/secretmanager.secretAccessor \
  --project "$PROJECT" --quiet >/dev/null

echo "==> Build permissions"
# On projects created after GCP tightened default-service-account permissions,
# the compute SA no longer gets what Cloud Build needs, and `run deploy
# --source` fails with a PERMISSION_DENIED that names a storage bucket rather
# than the actual cause. Granting these up front is idempotent.
for role in roles/cloudbuild.builds.builder roles/storage.objectViewer \
            roles/artifactregistry.writer roles/logging.logWriter; do
  gcloud projects add-iam-policy-binding "$PROJECT" \
    --member="serviceAccount:$SA" --role="$role" --quiet >/dev/null
done

echo "==> Building and deploying (first build takes ~10 min: torch + 880 MB of weights)"
gcloud run deploy "$SERVICE" \
  --source . \
  --project "$PROJECT" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --memory 4Gi \
  --cpu 2 \
  --min-instances "$MIN_INSTANCES" \
  --max-instances "$MAX_INSTANCES" \
  --concurrency 8 \
  --timeout 300 \
  --cpu-boost \
  --no-cpu-throttling \
  --set-env-vars "TORCH_THREADS=2,QUANTIZE=0,MAX_NEW_TOKENS_CAP=300" \
  --set-secrets "GARGI_API_TOKEN=$SECRET_NAME:latest" \
  --quiet

URL="$(gcloud run services describe "$SERVICE" --region "$REGION" --project "$PROJECT" --format='value(status.url)')"

echo
echo "======================================================================"
echo "  Endpoint: $URL"
echo
echo "  Set on Vercel:"
echo "    GARGI_INFERENCE_URL=$URL"
echo "    GARGI_API_TOKEN=\$(gcloud secrets versions access latest --secret=$SECRET_NAME)"
echo
echo "  Verify:"
echo "    curl -s $URL/health | python3 -m json.tool"
echo "======================================================================"
