#!/usr/bin/env bash
set -euo pipefail
repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
for repetition in 1 2 3; do
  echo "SQLite 200-drive crash/race smoke repetition $repetition/3"
  LOD_SMOKE=1 SCALE=0.01 LOD_SQLITE_DRIVES=200 LOD_TIMEOUT=900 \
    "$repo_root/ops/load/run.sh"
done
