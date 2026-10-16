#!/usr/bin/env bash
set -uo pipefail
repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
if [[ -z "${WIPPY_BIN:-}" ]]; then
  echo "WIPPY_BIN is required for the isolated full gate" >&2
  exit 1
fi
failed=0
for repetition in 1 2 3; do
  echo "LOD isolated full repetition $repetition/3"
  LOD_SMOKE=0 SCALE=1 LOD_SQLITE_DRIVES=200 "$repo_root/ops/load/run.sh"
  status=$?
  if (( status == 2 )); then
    echo "UNISOLATED: the full gate has no verdict" >&2
    exit 2
  fi
  if (( status != 0 )); then failed=1; fi
done
exit "$failed"
