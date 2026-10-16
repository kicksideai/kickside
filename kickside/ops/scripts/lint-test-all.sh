#!/usr/bin/env bash
# Run `make lint` and `make test` for every kickside package (any dir with a
# Makefile that exposes a `test:` target). Prints a per-package PASS/FAIL table
# and a final tally; exits non-zero if anything failed.
#
#   ops/scripts/lint-test-all.sh [path-filter]
#
# path-filter (optional) restricts to package dirs containing the substring,
# e.g. `ops/scripts/lint-test-all.sh platform/` or `... uploads`.
set -uo pipefail

root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd -P)"
cd "$root"
filter="${1:-}"

if ! python3 ops/scripts/check-native-errors.py; then
  exit 1
fi

pass=0
failn=0
declare -a rows

while IFS= read -r mk; do
  dir="${mk%/Makefile}"
  dir="${dir#./}"
  [[ -f "$dir/wippy.yaml" ]] || continue
  grep -qE '^test:' "$mk" || continue
  [[ -n "$filter" && "$dir" != *"$filter"* ]] && continue

  lr="-"
  tr="-"
  if grep -qE '^lint:' "$mk"; then
    ns="$(sed -n 's/^namespace:[[:space:]]*//p' "$dir/src/_index.yaml" 2>/dev/null | head -n1)"
    if [[ -n "$ns" && -f "$dir/test/wippy.lock" ]]; then
      if out="$(cd "$dir/test" && wippy lint --level error --ns "$ns" --ns "$ns.*" 2>&1)"; then lr=PASS; else lr=FAIL; fi
    elif out="$(cd "$dir" && make lint 2>&1)"; then
      lr=PASS
    else
      lr=FAIL
    fi
    if [[ "$lr" == FAIL ]]; then
      printf '\n--- FAIL: %s (lint) ---\n%s\n' "$dir" "$(printf '%s\n' "$out" | tail -8)"
    fi
  fi
  if out="$(cd "$dir" && timeout 240 make test 2>&1)"; then
    # The Wippy test terminal currently exits zero even when its report contains
    # failed assertions. Treat the report as authoritative so this repository
    # gate cannot turn a red suite into a false pass.
    if printf '%s\n' "$out" | grep -q 'FAILED'; then
      tr=FAIL
    else
      tr=PASS
    fi
  else
    tr=FAIL
  fi
  if [[ "$tr" == FAIL ]]; then
    printf '\n--- FAIL: %s (make test) ---\n%s\n' "$dir" "$(printf '%s\n' "$out" | tail -8)"
  fi

  if [[ "$lr" == FAIL || "$tr" == FAIL ]]; then failn=$((failn + 1)); else pass=$((pass + 1)); fi
  rows+=("$(printf '%-42s lint=%-5s test=%-5s' "$dir" "$lr" "$tr")")
done < <(find . -name Makefile \
  -not -path '*/.git/*' -not -path '*/node_modules/*' \
  -not -path '*/.wippy/*' -not -path '*/ops/*' 2>/dev/null | sort)

printf '\n===== lint/test summary =====\n'
printf '%s\n' "${rows[@]}"
printf '\n%d passed, %d failed\n' "$pass" "$failn"
[[ "$failn" -gt 0 ]] && exit 1 || exit 0
