# Deployment (EKS)

CI (`.gitlab-ci.yml`) tests, builds a container image (`Dockerfile`) to ECR
`wippy-kickside`, and exposes two manual deploy jobs that `helm upgrade
--install` the `helm/` chart:

- `Deploy_to_STAGE_EKS` — namespace `wippy-cloud`, kickside.stage.wippy.ai
- `Deploy_to_PROD_GEN2_EKS` — namespace `wippy-production`, kickside.wippy.ai

Both hosts sit behind an **internal ALB reachable only over the NetBird
mesh** (routing peers advertise the cluster VPC; see iac
`k8s-manifests/netbird-router.yaml`). All app secrets (`ENCRYPTION_KEY`,
`KICKSIDE_PG_*`, `PUBLIC_API_URL`, admin bootstrap) live in the per-environment
`EKS_ENV` GitLab variable, materialised as the `kickside-env` Secret on deploy.

The image ships `app/` at the built commit using the published versions in the
single `app/wippy.lock`. Shipping newer platform/provider code requires
publishing the modules, regenerating that lock without replacements, and
verifying a fresh install. The database needs the `vector` (pgvector) extension
available.
