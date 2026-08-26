#!/usr/bin/env bash
#
# Let GitHub Actions deploy to Cloud Run without a service-account key.
#
#   ./deploy/gcp/setup-github-oidc.sh gargi-indic/gargi-web
#
# Workload Identity Federation trades a long-lived JSON key -- which would sit
# in GitHub secrets forever, leak in a log, and need rotating -- for short-lived
# tokens minted per workflow run and scoped to this one repository.
#
# Prints the two values to paste into GitHub repo secrets at the end.
set -euo pipefail

REPO="${1:-}"
[[ -n "$REPO" ]] || { echo "usage: $0 <owner/repo>" >&2; exit 1; }

PROJECT="${PROJECT:-$(gcloud config get-value project 2>/dev/null)}"
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')"
POOL="github-pool"
PROVIDER="github-provider"
SA_NAME="github-deployer"
SA="${SA_NAME}@${PROJECT}.iam.gserviceaccount.com"

echo "==> Enabling APIs"
gcloud services enable iamcredentials.googleapis.com sts.googleapis.com \
  --project "$PROJECT" --quiet

echo "==> Workload identity pool"
gcloud iam workload-identity-pools describe "$POOL" --location=global \
  --project "$PROJECT" &>/dev/null || \
gcloud iam workload-identity-pools create "$POOL" --location=global \
  --display-name="GitHub Actions" --project "$PROJECT" --quiet

echo "==> OIDC provider"
gcloud iam workload-identity-pools providers describe "$PROVIDER" \
  --location=global --workload-identity-pool="$POOL" --project "$PROJECT" &>/dev/null || \
gcloud iam workload-identity-pools providers create-oidc "$PROVIDER" \
  --location=global \
  --workload-identity-pool="$POOL" \
  --display-name="GitHub" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='${REPO}'" \
  --project "$PROJECT" --quiet

echo "==> Deployer service account"
gcloud iam service-accounts describe "$SA" --project "$PROJECT" &>/dev/null || \
gcloud iam service-accounts create "$SA_NAME" \
  --display-name="GitHub Actions deployer" --project "$PROJECT" --quiet

echo "==> Waiting for the service account to propagate"
# Creation returns before the account is visible to the IAM policy API, and the
# grants below then fail with "does not exist". Poll rather than sleep blindly.
for i in $(seq 1 30); do
  gcloud iam service-accounts describe "$SA" --project "$PROJECT" &>/dev/null && break
  sleep 2
done

echo "==> Roles"
# Enough to build and deploy, and nothing else. Notably not Editor.
for role in roles/run.admin roles/cloudbuild.builds.editor roles/artifactregistry.writer \
            roles/storage.admin roles/iam.serviceAccountUser roles/logging.viewer; do
  gcloud projects add-iam-policy-binding "$PROJECT" \
    --member="serviceAccount:$SA" --role="$role" --quiet >/dev/null
done
gcloud secrets add-iam-policy-binding gargi-api-token \
  --member="serviceAccount:$SA" --role=roles/secretmanager.secretAccessor \
  --project "$PROJECT" --quiet >/dev/null 2>&1 || true

echo "==> Trusting ${REPO} to impersonate the deployer"
# Scoped to this repository only: a workflow in any other repo cannot mint a
# token for this service account.
gcloud iam service-accounts add-iam-policy-binding "$SA" \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL}/attribute.repository/${REPO}" \
  --project "$PROJECT" --quiet >/dev/null

PROVIDER_PATH="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL}/providers/${PROVIDER}"

cat <<EOF

======================================================================
  Add these at
  https://github.com/${REPO}/settings/secrets/actions

    GCP_WIF_PROVIDER   ${PROVIDER_PATH}
    GCP_SERVICE_ACCOUNT ${SA}

  Neither is a credential -- they are identifiers. The trust is the
  binding above, and it only works from ${REPO}.
======================================================================
EOF
