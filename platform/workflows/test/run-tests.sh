#!/usr/bin/env bash
set -u

log=$(mktemp -t workflows-test.XXXXXX) || exit 1
trap 'rm -f "$log"' EXIT

# The current test runner reports assertion failures in its result stream while
# returning zero. Keep a terminal for its interactive reporter, then enforce the
# displayed terminal result as the shell result consumed by make and CI.
read -r -a test_args <<< "${WIPPY_TEST_ARGS:-}"
printf -v test_command '%q ' wippy test "${test_args[@]}"
script -qefc "$test_command" "$log"
status=$?

if grep -q 'FAILED' "$log"; then
    printf '%s\n' 'wippy reported failed assertions' >&2
    status=1
elif ! grep -q 'PASSED' "$log"; then
    printf '%s\n' 'wippy did not report a terminal test result' >&2
    status=1
elif ! grep -qE '[1-9][0-9]* tests' "$log"; then
    printf '%s\n' 'wippy did not report any executed tests' >&2
    status=1
fi

exit "$status"
