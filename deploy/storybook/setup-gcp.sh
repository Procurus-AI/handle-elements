#!/usr/bin/env bash
# One-time Google Cloud setup for the hosted Storybook. Safe to re-run: every step checks
# for what already exists. Run by a project admin with roles/iap.admin (editor is not enough
# for the IAP access binding); the GitHub workflow only deploys.
#
#   deploy/storybook/setup-gcp.sh            # set up, then deploy the local storybook-static/
#   deploy/storybook/setup-gcp.sh --no-deploy
#
# What it creates in handle-v2-development (us-central1):
#   - Artifact Registry repo  design-system
#   - Service accounts        storybook-runtime (runs the container, no roles)
#                             storybook-deploy  (used by GitHub Actions)
#   - Workload identity       provider handle-elements-storybook in pool github-actions,
#                             accepting only storybook.yml on main of Procurus-AI/handle-elements
#   - Cloud Run service       handle-elements-storybook, IAP on, no public access;
#                             readable by anyone signed in with a usehandle.ai account
set -euo pipefail

PROJECT=handle-v2-development
PROJECT_NUMBER=695023505931
REGION=us-central1
SERVICE=handle-elements-storybook
REPO=design-system
POOL=github-actions
PROVIDER=handle-elements-storybook
GITHUB_REPO=Procurus-AI/handle-elements
GITHUB_REPO_ID=1340240703
WORKFLOW=.github/workflows/storybook.yml
VIEWERS=domain:usehandle.ai
RUNTIME_SA=storybook-runtime@${PROJECT}.iam.gserviceaccount.com
DEPLOY_SA=storybook-deploy@${PROJECT}.iam.gserviceaccount.com
IMAGE=${REGION}-docker.pkg.dev/${PROJECT}/${REPO}/storybook
IAP_AGENT=service-${PROJECT_NUMBER}@gcp-sa-iap.iam.gserviceaccount.com

gc() { gcloud --project="$PROJECT" --quiet "$@"; }
say() { printf '\n== %s\n' "$*"; }

say "Artifact Registry repo"
gc artifacts repositories describe "$REPO" --location="$REGION" >/dev/null 2>&1 ||
  gc artifacts repositories create "$REPO" --location="$REGION" --repository-format=docker \
    --description="Handle design system (Storybook images)"

say "Service accounts"
for sa in storybook-runtime storybook-deploy; do
  gc iam service-accounts describe "${sa}@${PROJECT}.iam.gserviceaccount.com" >/dev/null 2>&1 ||
    gc iam service-accounts create "$sa" --display-name="Handle Elements Storybook (${sa#storybook-})"
done

say "Workload identity provider (GitHub Actions, main branch, storybook.yml only)"
CONDITION="attribute.repository_id=='${GITHUB_REPO_ID}' && attribute.ref=='refs/heads/main' && attribute.workflow_ref=='${GITHUB_REPO}/${WORKFLOW}@refs/heads/main' && (attribute.event_name=='push' || attribute.event_name=='workflow_dispatch')"
MAPPING="google.subject=assertion.sub,attribute.repository_id=assertion.repository_id,attribute.ref=assertion.ref,attribute.workflow_ref=assertion.workflow_ref,attribute.event_name=assertion.event_name"
if gc iam workload-identity-pools providers describe "$PROVIDER" --workload-identity-pool="$POOL" --location=global >/dev/null 2>&1; then
  gc iam workload-identity-pools providers update-oidc "$PROVIDER" --workload-identity-pool="$POOL" --location=global \
    --attribute-mapping="$MAPPING" --attribute-condition="$CONDITION"
else
  gc iam workload-identity-pools providers create-oidc "$PROVIDER" --workload-identity-pool="$POOL" --location=global \
    --issuer-uri=https://token.actions.githubusercontent.com --attribute-mapping="$MAPPING" --attribute-condition="$CONDITION"
fi
gc iam service-accounts add-iam-policy-binding "$DEPLOY_SA" --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL}/attribute.repository_id/${GITHUB_REPO_ID}" >/dev/null

say "Deploy account: push images, deploy this one service as the runtime account"
gc artifacts repositories add-iam-policy-binding "$REPO" --location="$REGION" \
  --member="serviceAccount:${DEPLOY_SA}" --role=roles/artifactregistry.writer >/dev/null
gc iam service-accounts add-iam-policy-binding "$RUNTIME_SA" \
  --member="serviceAccount:${DEPLOY_SA}" --role=roles/iam.serviceAccountUser >/dev/null

if [[ "${1:-}" == "--no-deploy" ]] && ! gc run services describe "$SERVICE" --region="$REGION" >/dev/null 2>&1; then
  echo "Service not created yet; run without --no-deploy once to create it."
  exit 0
fi

if [[ "${1:-}" != "--no-deploy" ]]; then
  say "Build and push the image from the local storybook-static/"
  test -f storybook-static/index.html || { echo "Run npm run build-storybook first"; exit 1; }
  TAG="${IMAGE}:$(git rev-parse --short HEAD)"
  gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet >/dev/null
  docker build --platform=linux/amd64 -f deploy/storybook/Dockerfile -t "$TAG" .
  docker push "$TAG"

  say "Deploy Cloud Run service with IAP"
  gc beta run deploy "$SERVICE" --image="$TAG" --region="$REGION" \
    --service-account="$RUNTIME_SA" --no-allow-unauthenticated --iap \
    --cpu=1 --memory=256Mi --min-instances=0 --max-instances=2 --port=8080
fi

say "Access: IAP may invoke the service; usehandle.ai accounts may pass IAP"
gc run services add-iam-policy-binding "$SERVICE" --region="$REGION" \
  --member="serviceAccount:${IAP_AGENT}" --role=roles/run.invoker >/dev/null
gc beta iap web add-iam-policy-binding --resource-type=cloud-run --service="$SERVICE" --region="$REGION" \
  --member="$VIEWERS" --role=roles/iap.httpsResourceAccessor >/dev/null
gc run services add-iam-policy-binding "$SERVICE" --region="$REGION" \
  --member="serviceAccount:${DEPLOY_SA}" --role=roles/run.developer >/dev/null

say "URL"
gc run services describe "$SERVICE" --region="$REGION" --format='value(status.url)'
