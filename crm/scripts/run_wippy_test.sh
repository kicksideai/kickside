#!/usr/bin/env bash
set -euo pipefail

output="$(mktemp "${TMPDIR:-$PWD/.wippy}/crm-suite.XXXXXX.log")"
trap 'rm -f "$output"' EXIT

set +e
wippy test "$@" 2>&1 | tee "$output"
status=${PIPESTATUS[0]}
set -e

if [ "$status" -ne 0 ] || grep -q 'FAILED' "$output" || ! grep -q 'PASSED' "$output"; then
  echo "wippy test did not report a passing suite" >&2
  exit 1
fi
