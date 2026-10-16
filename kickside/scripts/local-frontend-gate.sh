#!/bin/sh
# Mirrors the retired CI test:frontend job.
set -eu
node app/scripts/build-facade-css.mjs --check
make install-all
make typecheck-all
make test-all
node --test scripts/check-frontend-static-freshness.test.mjs
snapshot_file=$(mktemp "${TMPDIR:-$(pwd)}/frontend-static.XXXXXX")
trap 'rm -f "$snapshot_file"' 0
node scripts/check-frontend-static-freshness.mjs snapshot "$snapshot_file"
make build-all
node scripts/check-frontend-static-freshness.mjs check "$snapshot_file"
