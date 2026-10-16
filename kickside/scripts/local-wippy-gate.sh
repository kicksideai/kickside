#!/bin/sh
# Mirrors the retired CI test:wippy-lint job: release hygiene, workflow
# architecture, dependency pins, and wippy lint over the app namespaces with
# the same pinned wippy release. Requires WIPPY_HUB_TOKEN and the wippy CLI.
set -eu
python3 scripts/check-release-hygiene.py --root .
python3 scripts/test-release-hygiene.py
python3 -m unittest tests.test_release_hygiene tests.test_workflow_architecture tests.test_workflow_e2e_harness tests.test_deployment_requirements tests.test_source_conventions tests.test_contract_surface
python3 scripts/check-workflow-architecture.py --root .
python3 scripts/check-source-conventions.py
python3 scripts/check-harness-closure.py
python3 -m unittest tests.test_harness_closure
python3 scripts/check-contract-surface.py
cd app
python3 scripts/check_dependency_pins.py --app-dir .
node scripts/check-wiki-sources.mjs
lock_checksum=$(sha256sum wippy.lock)
wippy install
printf '%s\n' "$lock_checksum" | sha256sum -c -
wippy lint --level error --ns app --ns 'app.*'
