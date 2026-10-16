#!/usr/bin/env bash
# `wippy run test` deliberately does not execute the test use case. The
# canonical command is one complete `wippy test` invocation; the CLI does not
# provide an entry filter, so callers must not receive a false focused result.
set -uo pipefail

output=$(mktemp "${TMPDIR:-/tmp}/transform-test.XXXXXX")
trap 'rm -f "$output"' EXIT

if (($#)); then
  printf '%s\n' 'entry filters are not supported by wippy test; running the complete Transform suite' >&2
fi

extra_args=()
if [[ -n "${WIPPY_TEST_ARGS:-}" ]]; then
  read -r -a extra_args <<< "${WIPPY_TEST_ARGS}"
fi

wippy test "${extra_args[@]}" 2>&1 | tee "$output"
status=${PIPESTATUS[0]}

if grep -q 'FAILED' "$output"; then
  printf '%s\n' 'wippy reported FAILED; marking the Transform test command failed' >&2
  status=1
fi

exit "$status"
