#!/usr/bin/env bash
# `wippy run test` deliberately does not execute the test use case. The
# canonical command is one complete `wippy test` invocation; the CLI does not
# provide an entry filter, so callers must not receive a false focused result.
set -euo pipefail

output=$(mktemp "${TMPDIR:-$(pwd)}/automation-test.XXXXXX")
scratch_files=("$output")
trap 'rm -f -- "${scratch_files[@]}"' EXIT
database=$(mktemp "${TMPDIR:-$(pwd)}/automation-test.XXXXXXXX.sqlite")
scratch_files+=("$database" "$database-wal" "$database-shm")

if (($#)); then
  printf '%s\n' 'entry filters are not supported by wippy test; running the complete Automation suite' >&2
fi

extra_args=()
if [[ -n "${WIPPY_TEST_ARGS:-}" ]]; then
  read -r -a extra_args <<< "${WIPPY_TEST_ARGS}"
fi

set +e
wippy test --set "vars.sqlite_path=$database" "${extra_args[@]}" 2>&1 | tee "$output"
statuses=("${PIPESTATUS[@]}")
set -e
status=${statuses[0]}
if (( statuses[1] != 0 )); then status=${statuses[1]}; fi

if grep -qE 'FAILED|No tests found' "$output" ||
   ! grep -q 'PASSED' "$output" ||
   ! grep -qE '[1-9][0-9]* tests' "$output"; then
  printf '%s\n' 'Automation requires a nonzero passing terminal verdict' >&2
  status=1
fi

exit "$status"
