#!/usr/bin/env bash
# Two-process admission race under a real installed automation.
# Usage: admission-race-test.sh [postgres|sqlite]
# Set RACE_OVERLAY to a Wippy config layered after this harness's .wippy.yaml.
# Two independent Wippy processes contend for the last slot; exactly one wins.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

export PGPASSWORD=kickside
DB_HOST="127.0.0.1"
DB_PORT="5433"
DB_USER="kickside"
ENGINE="${1:-postgres}"
DB_NAME=""
SQLITE_PATH=""
RUN_ARGS=()
CONFIG_ARGS=()

if [[ -n "${RACE_OVERLAY:-}" ]]; then
    CONFIG_ARGS=(--config .wippy.yaml --config "$RACE_OVERLAY")
fi

case "$ENGINE" in
    postgres)
        DB_NAME="wf_admission_race_${$}_$(date +%s)"
        RUN_ARGS=(--profile postgres --set "vars.pg_database=$DB_NAME")
        ;;
    sqlite)
        SQLITE_PATH="$SCRIPT_DIR/storage/wf_admission_race_${$}.sqlite"
        RUN_ARGS=(--set "vars.sqlite_path=$SQLITE_PATH")
        ;;
    *)
        echo "Usage: $0 [postgres|sqlite]" >&2
        exit 2
        ;;
esac

LOG_DIR="$SCRIPT_DIR/storage/race_logs_${$}"
mkdir -p "$LOG_DIR"
if [[ "$ENGINE" == "sqlite" ]]; then
    rm -f "$SQLITE_PATH" "$SQLITE_PATH-wal" "$SQLITE_PATH-shm"
fi

cleanup() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        echo "=== Failure detected (exit code $exit_code), dumping logs ==="
        for f in "$LOG_DIR"/*; do
            if [[ -f "$f" ]]; then
                echo "--- $f ---"
                cat "$f"
            fi
        done
    fi
    if [[ "$ENGINE" == "postgres" ]]; then
        PGPASSWORD="$PGPASSWORD" dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" 2>/dev/null || true
    else
        rm -f "$SQLITE_PATH" "$SQLITE_PATH-wal" "$SQLITE_PATH-shm"
    fi
    rm -rf "$LOG_DIR"
    exit "$exit_code"
}
trap cleanup EXIT

if [[ "$ENGINE" == "postgres" ]]; then
    echo "=== Creating fresh PG database: $DB_NAME ==="
    PGPASSWORD="$PGPASSWORD" createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
else
    echo "=== Creating fresh SQLite database: $SQLITE_PATH ==="
fi

echo "=== Initializing schema and barrier tables ($ENGINE) ==="
if ! wippy run "${CONFIG_ARGS[@]}" "${RUN_ARGS[@]}" -x app:admission_race_init > "$LOG_DIR/init.log" 2>&1; then
    echo "Initialization failed:"
    cat "$LOG_DIR/init.log"
    exit 1
fi

echo "=== Launching two independent racer processes for last slot contention ==="
wippy run "${CONFIG_ARGS[@]}" "${RUN_ARGS[@]}" -x app:admission_race_racer_a > "$LOG_DIR/racer-a.log" 2>&1 &
PID_A=$!

wippy run "${CONFIG_ARGS[@]}" "${RUN_ARGS[@]}" -x app:admission_race_racer_b > "$LOG_DIR/racer-b.log" 2>&1 &
PID_B=$!

wait $PID_A
RC_A=$?
wait $PID_B
RC_B=$?

if [[ $RC_A -ne 0 ]]; then
    echo "Racer A failed with code $RC_A:"
    cat "$LOG_DIR/racer-a.log"
    exit 1
fi

if [[ $RC_B -ne 0 ]]; then
    echo "Racer B failed with code $RC_B:"
    cat "$LOG_DIR/racer-b.log"
    exit 1
fi

echo "=== Database Results ==="
if [[ "$ENGINE" == "postgres" ]]; then
    PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT * FROM workflow_race_results;"
    PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT run_id, trigger_id, dedup_key, status, admission_state FROM workflow_runs;"
else
    sqlite3 -header -column "$SQLITE_PATH" "SELECT * FROM workflow_race_results;"
    sqlite3 -header -column "$SQLITE_PATH" "SELECT run_id, trigger_id, dedup_key, status, admission_state FROM workflow_runs;"
fi

echo "=== Verifying results: exactly one winner, one typed capacity refusal, no double admission ==="
wippy run "${CONFIG_ARGS[@]}" "${RUN_ARGS[@]}" -x app:admission_race_verify > "$LOG_DIR/verify.log" 2>&1
V_RC=$?
cat "$LOG_DIR/verify.log"

if [[ "$ENGINE" == "postgres" ]]; then
    VERIFY_STATUS=$(PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -A -c "SELECT status FROM workflow_race_verification LIMIT 1;")
else
    VERIFY_STATUS=$(sqlite3 "$SQLITE_PATH" "SELECT status FROM workflow_race_verification LIMIT 1;")
fi

if [[ "$V_RC" -ne 0 || "$VERIFY_STATUS" != "PASS" ]]; then
    echo "=== Verification FAILED (rc=$V_RC, db_status='$VERIFY_STATUS') ==="
    echo "Racer A log:"
    cat "$LOG_DIR/racer-a.log" || true
    echo "Racer B log:"
    cat "$LOG_DIR/racer-b.log" || true
    exit 1
fi

echo "=== Race test PASSED ($ENGINE): 1 winner, 1 typed capacity refusal, 0 double admission ==="
