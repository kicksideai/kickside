#!/usr/bin/env bash
# Run module test targets on isolated PostgreSQL databases.
set -euo pipefail

PG_HOST=${PG_HOST:-localhost}
PG_PORT=${PG_PORT:-5433}
PG_USER=${PG_USER:-kickside}
PG_PASSWORD=${PG_PASSWORD:-kickside}
PG_ADMIN_DB=${PG_ADMIN_DB:-kickside}
TIMEOUT=${TIMEOUT:-600}

root="$(cd "$(dirname "$0")/../.." && pwd)"
scratch_root=$(mktemp -d "${TMPDIR:?TMPDIR points to an owned scratch directory}/kickside-pg-XXXXXX")
active_db=
cleanup() {
  status=$?
  trap - EXIT
  if [ -n "$active_db" ]; then
    if ! PGPASSWORD="$PG_PASSWORD" dropdb -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" "$active_db"; then
      status=1
    fi
  fi
  if ! rm -rf "$scratch_root"; then status=1; fi
  exit "$status"
}
trap cleanup EXIT

PGPASSWORD="$PG_PASSWORD" psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_ADMIN_DB" \
  -v ON_ERROR_STOP=1 -Atc 'select 1' >/dev/null

targets=()
if (($#)); then
  for arg in "$@"; do targets+=("$root/$arg"); done
else
  for module in "$root"/platform/* "$root"/core/*; do
    if [ -d "$module/test" ]; then targets+=("$module"); fi
  done
fi
if [ "${#targets[@]}" -eq 0 ]; then
  echo 'No module test targets found' >&2
  exit 1
fi
for module in "${targets[@]}"; do
  if [ ! -f "$module/Makefile" ] || [ ! -f "$module/test/.wippy.yaml" ] || \
      ! grep -qE '^  postgres:' "$module/test/.wippy.yaml"; then
    echo "Required module target or PostgreSQL profile is absent: $module" >&2
    exit 1
  fi
done

results=()
failed=0
for module in "${targets[@]}"; do
  name=${module#"$root/"}
  active_db="kickside_test_${$}_${RANDOM}_${RANDOM}"
  PGPASSWORD="$PG_PASSWORD" createdb -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -T template0 "$active_db"
  output="$scratch_root/${name//\//_}.log"
  printf '\n%s (database %s)\n' "$name" "$active_db"
  arguments="--profile postgres --set vars.pg_host=$PG_HOST --set vars.pg_port=$PG_PORT --set vars.pg_username=$PG_USER --set vars.pg_password=$PG_PASSWORD --set vars.pg_database=$active_db"
  if timeout "$TIMEOUT" make -C "$module" test WIPPY_TEST_ARGS="$arguments" 2>&1 | tee "$output"; then
    status=0
  else
    status=$?
  fi
  if [ "$status" -eq 0 ] && ! grep -qE 'FAILED|No tests found|[1-9][0-9]* failed' "$output" && \
      grep -q PASSED "$output" && grep -qE '[1-9][0-9]* tests' "$output"; then
    results+=("PASS $name")
  else
    results+=("FAIL $name")
    failed=1
  fi
  PGPASSWORD="$PG_PASSWORD" dropdb -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" "$active_db"
  active_db=
done
printf '\nPostgreSQL test sweep\n'
printf '%s\n' "${results[@]}"
exit "$failed"
