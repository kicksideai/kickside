#!/usr/bin/env python3
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[2]


def entry(entries, name):
    return next(item for item in entries if item.get("name") == name)


health = yaml.safe_load((ROOT / "src/app/health/_index.yaml").read_text())
entries = health["entries"]

production_source = (ROOT / "src/app/health/serve.lua").read_text()
harness_source = (ROOT / "test/health/src/serve.lua").read_text()
assert harness_source == production_source, "health behavior harness must mirror production source"

endpoint = entry(entries, "endpoint")
assert endpoint["kind"] == "http.endpoint"
assert endpoint["meta"]["router"] == "app:api.public"
assert endpoint["method"] == "GET"
assert endpoint["path"] == "/health"
assert endpoint["func"] == "serve"

handler = entry(entries, "serve")
assert handler["security"] == {
    "actor": {"id": "app.health:serve"},
    "policies": ["app.health:db_access"],
}

policy = entry(entries, "db_access")
assert policy["policy"] == {
    "resources": "app:db",
    "actions": ["db.get"],
    "effect": "allow",
}

deployment = (ROOT.parent / "helm/templates/deployment.yaml").read_text()
assert "livenessProbe:" in deployment
assert "path: /api/public/env/public.js" in deployment
assert "readinessProbe:" in deployment
assert "path: /api/public/health" in deployment

ingress = (ROOT.parent / "helm/templates/ingress.yaml").read_text()
assert "alb.ingress.kubernetes.io/healthcheck-path: /api/public/health" in ingress

print("health endpoint, policy, readiness, and liveness wiring: ok")
