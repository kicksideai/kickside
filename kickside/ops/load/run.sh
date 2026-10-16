#!/usr/bin/env bash
set -euo pipefail

# Isolated LOD run: creates a fresh marked PG database, prepares a disposable
# copy of the Workflows test runtime with the load overlay, seeds by SQL, then
# runs the registered production worker against PG and SQLite.

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
if [[ -z "${WIPPY_BIN:-}" ]]; then
  echo "WIPPY_BIN is required; set it to the executable Wippy runtime for this host" >&2
  exit 1
fi
wippy_bin="$WIPPY_BIN"
pg_host="127.0.0.1"
pg_port=""
pg_user="${PGUSER:-kickside}"
pg_password="${PGPASSWORD:-kickside}"
admin_db="${PGDATABASE:-kickside}"
lod_scale="${SCALE:-1}"
lod_timeout="${LOD_TIMEOUT:-5400}"
lod_smoke="${LOD_SMOKE:-0}"
lod_scratch_root="${LOD_SCRATCH_ROOT:-$repo_root/../../scratchpad/fix-0924/impl/lanes/LOD/runtime}"
lod_report_root="${LOD_REPORT_ROOT:-$repo_root/../../scratchpad/fix-0924/impl/lanes/LOD/LOD2-runs}"

command -v psql >/dev/null || { echo "psql is required" >&2; exit 1; }
command -v sqlite3 >/dev/null || { echo "sqlite3 is required" >&2; exit 1; }
command -v timeout >/dev/null || { echo "timeout is required" >&2; exit 1; }
command -v uptime >/dev/null || { echo "uptime is required" >&2; exit 1; }
command -v docker >/dev/null || { echo "docker is required for an isolated PostgreSQL cluster" >&2; exit 1; }
[[ -x "$wippy_bin" ]] || { echo "Wippy binary is not executable: $wippy_bin" >&2; exit 1; }
python3 - "$lod_scale" <<'PY'
import sys
s=float(sys.argv[1])
if not (0 < s <= 1):
    raise SystemExit("SCALE must be >0 and <=1")
PY
if [[ "$lod_smoke" != "1" && "$lod_scale" != "1" ]]; then
  echo "Scaled runs must be marked LOD_SMOKE=1" >&2
  exit 1
fi

run_id="$(date -u +%Y%m%d%H%M%S)_$$"
pg_container="kickside-lod-pg-${run_id//_/-}"
lod_db="kickside_lod_${run_id}"
lod_marker="lane-lod:${run_id}"
mkdir -p "$lod_scratch_root" "$lod_report_root"
report_file="$lod_report_root/$run_id.txt"
exec > >(tee "$report_file") 2>&1
export PGPASSWORD="$pg_password"
export TMPDIR="$lod_scratch_root"
runtime_dir="$(mktemp -d "$lod_scratch_root/kickside-lod.XXXXXX")"
artifact_raw="$runtime_dir/artifacts"
mkdir -p "$artifact_raw"
sqlite_file="$runtime_dir/kickside_lod.sqlite"
run_log="$lod_report_root/$run_id.wippy.log"
pg_log="$lod_report_root/$run_id.postgres.log"
isolation_file="$lod_report_root/$run_id.isolation.txt"
isolation_marker="$lod_report_root/$run_id.unisolated"
: > "$isolation_file"

record_environment() {
  {
    echo "UTC: $(date -u +%FT%TZ)"
    echo "Machine: $(uname -a)"
    echo "CPU: $(nproc) logical; $(lscpu | sed -n 's/^Model name:[[:space:]]*//p' | head -1)"
    echo "RAM: $(free -h | sed -n '2p')"
    echo "Storage: $(df -h "$lod_scratch_root" | tail -1)"
    echo "Load: $(uptime)"
    echo "PostgreSQL: $(PGPASSWORD="$pg_password" psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$admin_db" -Atqc 'SELECT version()')"
    PGPASSWORD="$pg_password" psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$admin_db" -Atqc "SELECT name || '=' || setting FROM pg_settings WHERE name IN ('max_connections','shared_buffers','work_mem','maintenance_work_mem','synchronous_commit','fsync','full_page_writes','wal_level','log_min_duration_statement','log_disconnections','shared_preload_libraries') ORDER BY name"
    python3 "$repo_root/ops/load/host_isolation.py" "$$" || true
  } | tee -a "$isolation_file"
}

host_isolated() {
  python3 "$repo_root/ops/load/host_isolation.py" "$$"
}

cleanup() {
  local found_marker=""
  if [[ -n "${isolation_monitor_pid:-}" ]]; then
    kill "$isolation_monitor_pid" >/dev/null 2>&1 || true
    wait "$isolation_monitor_pid" 2>/dev/null || true
  fi
  if [[ -n "${lod_db:-}" && -n "${pg_port:-}" ]]; then
    found_marker="$(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -Atqc \
      "SELECT marker FROM kickside_lod_marker LIMIT 1" 2>/dev/null || true)"
    if [[ "$found_marker" == "$lod_marker" ]]; then
      psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$admin_db" \
        -v ON_ERROR_STOP=1 -c "DROP DATABASE \"$lod_db\"" >/dev/null 2>&1 || true
    fi
  fi
  if [[ -n "${pg_container:-}" ]]; then docker rm -fv "$pg_container" >/dev/null 2>&1 || true; fi
  rm -rf "$runtime_dir"
}
trap cleanup EXIT

docker run -d --name "$pg_container" -p 127.0.0.1::5432 \
  -e POSTGRES_USER="$pg_user" -e POSTGRES_PASSWORD="$pg_password" -e POSTGRES_DB="$admin_db" \
  postgres:16 -c log_min_duration_statement=0 -c log_line_prefix='%m [%p] ' \
  -c log_disconnections=on -c shared_preload_libraries=pg_stat_statements >/dev/null
pg_port="$(docker port "$pg_container" 5432/tcp | awk -F: '{print $NF}')"
for attempt in $(seq 1 60); do
  if PGPASSWORD="$pg_password" pg_isready -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$admin_db" >/dev/null 2>&1; then break; fi
  sleep 1
done
PGPASSWORD="$pg_password" pg_isready -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$admin_db" >/dev/null
record_environment
host_isolated || isolation_status=UNISOLATED
if [[ "${isolation_status:-}" == "UNISOLATED" && "$lod_smoke" != "1" ]]; then
  echo "UNISOLATED: full gate refused before fixture seeding"
  exit 2
fi
(
  while sleep 30; do
    if ! python3 "$repo_root/ops/load/host_isolation.py" "$$" >> "$isolation_file"; then
      : > "$isolation_marker"
    fi
  done
) &
isolation_monitor_pid=$!

scale_count() {
  awk -v n="$1" -v s="$lod_scale" 'BEGIN { printf "%d", n*s+0.5 }'
}

lod_base="$(scale_count 2000)"
lod_automation_count="$(scale_count 200)"
lod_source_threads_count="$(scale_count 50)"
lod_watchers="$(scale_count 10000)"
lod_events="$(scale_count 5000000)"
lod_receipts="$(scale_count 2000000)"
lod_ledger="$(scale_count 1000000)"
lod_runs="$(scale_count 300000)"
lod_prune="$(scale_count 1000000)"
lod_sqlite_drives="${LOD_SQLITE_DRIVES:-$(scale_count 200)}"
if [[ ! "$lod_sqlite_drives" =~ ^[0-9]+$ ]] || (( lod_sqlite_drives < 2 || lod_sqlite_drives > 200 )); then
  echo "LOD_SQLITE_DRIVES must be an integer from 2 to 200" >&2
  exit 1
fi
lod_base_extra=$((lod_base - 1))
lod_slots=$((lod_base + lod_watchers))
lod_run_depth=$((lod_runs / lod_slots))
if (( lod_base != lod_automation_count * 10 || lod_source_threads_count < 1 || lod_watchers < 1 || lod_events < lod_prune || lod_run_depth < 1 || lod_slots * lod_run_depth != lod_runs )); then
  echo "SCALE does not produce a valid integral fixture (drives=$lod_base watchers=$lod_watchers runs=$lod_runs)" >&2
  exit 1
fi
lod_data_threads=$(((lod_events - lod_prune + 3999) / 4000))
(( lod_data_threads > 0 )) || lod_data_threads=1

echo "Creating fresh PostgreSQL database $lod_db at $pg_host:$pg_port"
psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$admin_db" -v ON_ERROR_STOP=1 \
  -c "CREATE DATABASE \"$lod_db\" OWNER \"$pg_user\" TEMPLATE template0" >/dev/null
psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -v ON_ERROR_STOP=1 \
  -c 'CREATE TABLE kickside_lod_marker(marker TEXT PRIMARY KEY)' \
  -c "INSERT INTO kickside_lod_marker VALUES ('$lod_marker')" >/dev/null
pg_stat_statements_enabled="$(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -Atqc \
  "SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname='pg_stat_statements')")"
pg_stat_module_loaded="$(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$admin_db" -Atqc \
  "SELECT EXISTS (SELECT 1 FROM unnest(string_to_array(current_setting('shared_preload_libraries'),',')) AS lib WHERE btrim(lib)='pg_stat_statements')")"
if [[ "$pg_stat_module_loaded" == "t" && "$pg_stat_statements_enabled" != "t" ]]; then
  psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" \
    -c 'CREATE EXTENSION IF NOT EXISTS pg_stat_statements' >/dev/null 2>&1 || true
  pg_stat_statements_enabled="$(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -Atqc \
    "SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname='pg_stat_statements')")"
fi
echo "pg_stat_statements enabled for fresh database: $pg_stat_statements_enabled"
python3 "$repo_root/ops/load/hot_query_inventory.py" "$repo_root"

# Keep Wippy's checked-in test graph and workspace replacements, adding only
# this load module to a disposable source copy. This leaves product code alone.
# The test tree's src/src_link points back to platform/workflows/src. Preserve
# its contents inside the disposable runtime, where its original relative
# target would otherwise resolve outside the copied tree.
cp -aL "$repo_root/platform/workflows/test/." "$runtime_dir/"
mkdir -p "$runtime_dir/src/load"
cp -a "$repo_root/ops/load/src/load/." "$runtime_dir/src/load/"
touch "$sqlite_file"
cat > "$runtime_dir/.wippy.yaml" <<EOF
version: "1.0"
registry:
  enable_history: true
  history_type: memory
workspace:
  replacements:
    kickside/automation: "$repo_root/platform/automation"
    kickside/blocks: "$repo_root/platform/blocks"
    kickside/component: "$repo_root/core/component/src"
    kickside/connection: "$repo_root/platform/connection"
    kickside/core: "$repo_root/core/core/src"
    kickside/inbox: "$repo_root/platform/inbox"
    kickside/jobs: "$repo_root/core/jobs/src"
    kickside/contract: "$repo_root/core/contract"
    kickside/cron: "$repo_root/core/cron"
    kickside/execution: "$repo_root/core/execution"
    kickside/settings: "$repo_root/platform/settings"
    kickside/transform: "$repo_root/platform/transform"
    kickside/uploads: "$repo_root/platform/uploads"
    kickside/users: "$repo_root/platform/users"
    kickside/workflows: "$repo_root/platform/workflows"
vars:
  pg_host: "$pg_host"
  pg_port: $pg_port
  pg_database: "$lod_db"
  pg_username: "$pg_user"
  pg_password: "$pg_password"
  sqlite_file: "$sqlite_file"
profiles:
  lod_pg_seed:
    override:
      "app:db:kind": db.sql.postgres
      "app:db:host": "\${pg_host}"
      "app:db:port": "\${pg_port}"
      "app:db:database": "\${pg_database}"
      "app:db:username": "\${pg_username}"
      "app:db:password": "\${pg_password}"
      "app:db:options.sslmode": disable
      "app:db:pool.max_open": 16
      "app:db:pool.max_idle": 8
      "wippy.bootloader:bootloader.service:lifecycle.startup": complete
      "kickside.core.jobs.service:worker.service:lifecycle.auto_start": false
      "kickside.workflows.runs:maintenance.service:lifecycle.auto_start": false
  lod_pg_worker:
    override:
      "app:db:kind": db.sql.postgres
      "app:db:host": "\${pg_host}"
      "app:db:port": "\${pg_port}"
      "app:db:database": "\${pg_database}"
      "app:db:username": "\${pg_username}"
      "app:db:password": "\${pg_password}"
      "app:db:options.sslmode": disable
      "app:db:pool.max_open": 16
      "app:db:pool.max_idle": 8
      "wippy.bootloader:bootloader.service:lifecycle.startup": complete
      "kickside.core.jobs.service:worker.service:lifecycle.auto_start": true
      "kickside.workflows.runs:maintenance.service:lifecycle.auto_start": false
  lod_sqlite_seed:
    override:
      "app:db:kind": db.sql.sqlite
      "app:db:file": "\${sqlite_file}"
      "app:db:pool.max_open": 1
      "app:db:pool.max_idle": 1
      "wippy.bootloader:bootloader.service:lifecycle.startup": complete
      "kickside.core.jobs.service:worker.service:lifecycle.auto_start": false
      "kickside.workflows.runs:maintenance.service:lifecycle.auto_start": false
  lod_sqlite_worker:
    override:
      "app:db:kind": db.sql.sqlite
      "app:db:file": "\${sqlite_file}"
      "app:db:pool.max_open": 1
      "app:db:pool.max_idle": 1
      "wippy.bootloader:bootloader.service:lifecycle.startup": complete
      "kickside.core.jobs.service:worker.service:lifecycle.auto_start": true
      "kickside.workflows.runs:maintenance.service:lifecycle.auto_start": false
EOF

run_wippy() {
  local entry="$1" profile="$2"
  echo "=== $entry ($profile) ==="
  set +e
  (cd "$runtime_dir" && timeout "${lod_timeout}s" "$wippy_bin" run -x "$entry" --profile "$profile") 2>&1 | tee -a "$run_log"
  local status=${PIPESTATUS[0]}
  set -e
  if (( status != 0 )); then
    echo "Wippy entry failed ($status): $entry" >&2
    return "$status"
  fi
}

run_wippy kickside.load:prepare lod_pg_seed
psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -v ON_ERROR_STOP=1 \
  -c "INSERT INTO kickside_lod_state(key,value) VALUES
    ('automation_count','$lod_automation_count'),('source_thread_count','$lod_source_threads_count'),
    ('timers_per_automation','8')
    ON CONFLICT(key) DO UPDATE SET value=excluded.value" >/dev/null
run_wippy kickside.load:install lod_pg_seed
echo "Seeding PG: drives=$lod_base + watchers=$lod_watchers events=$lod_events receipts=$lod_receipts ledger=$lod_ledger runs=$lod_runs"
psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -v ON_ERROR_STOP=1 \
  -v base_drive_count="$lod_base" -v base_extra_drives="$lod_base_extra" \
  -v watcher_count="$lod_watchers" -v event_count="$lod_events" \
  -v receipt_count="$lod_receipts" -v ledger_count="$lod_ledger" \
  -v prune_events="$lod_prune" -v run_depth="$lod_run_depth" \
  -v data_threads="$lod_data_threads" -v scale="$lod_scale" \
  -f "$repo_root/ops/load/seed-postgres.sql"
pg_seed_ok="$(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -Atqc \
  "SELECT (SELECT COUNT(*) FROM kickside_automation_drive WHERE automation_id IN (SELECT id FROM kickside_lod_automations UNION ALL SELECT id FROM kickside_lod_timer_automations))=$lod_slots
     AND (SELECT COUNT(*) FROM kickside_automation_drive WHERE source_kind='timer' AND automation_id IN (SELECT id FROM kickside_lod_timer_automations))=$((lod_automation_count * 8))
     AND (SELECT COUNT(*) FROM kickside_automation_drive WHERE source_kind='event' AND automation_id IN (SELECT id FROM kickside_lod_automations))=$((lod_automation_count * 2 + lod_watchers))
     AND (SELECT COUNT(DISTINCT thread_id) FROM kickside_lod_automations)=$lod_source_threads_count
     AND (SELECT COUNT(*) FROM kickside_event WHERE type='kickside.load:seed')=$lod_events
     AND (SELECT COUNT(*) FROM kickside_automation_receipt WHERE owner_id IN (SELECT id FROM kickside_lod_automations))=$lod_receipts
     AND (SELECT COUNT(*) FROM kickside_trigger_item_ledger WHERE owner_id IN (SELECT id FROM kickside_lod_automations))=$lod_ledger
     AND (SELECT COUNT(*) FROM kickside_job_run r JOIN kickside_automation_drive d ON d.job_id=r.job_id WHERE d.automation_id IN (SELECT id FROM kickside_lod_automations UNION ALL SELECT id FROM kickside_lod_timer_automations))=$lod_runs")"
[[ "$pg_seed_ok" == "t" ]] || { echo "PostgreSQL fixture counts do not match the requested scale" >&2; exit 1; }
psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -v ON_ERROR_STOP=1 \
  -c "INSERT INTO kickside_lod_state(key,value) VALUES('smoke','$lod_smoke') ON CONFLICT(key) DO UPDATE SET value=excluded.value" >/dev/null
run_wippy kickside.load:claim_probe lod_pg_seed
run_wippy kickside.load:breakdown lod_pg_seed
if [[ "$pg_stat_statements_enabled" == "t" ]]; then
  psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -Atqc "SELECT pg_stat_statements_reset()" >/dev/null
fi
run_wippy kickside.load:append_samples lod_pg_seed
run_wippy kickside.load:run_worker lod_pg_worker
sleep 2
# This cluster belongs only to the run. Its complete log includes prepare,
# install, claim_probe, breakdown, appends and all worker transactions.
docker logs --timestamps "$pg_container" > "$pg_log" 2>&1
pg_empty_start="$(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -Atqc "SELECT value FROM kickside_lod_state WHERE key='empty_phase_start_at'")"
pg_empty_end="$(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -Atqc "SELECT value FROM kickside_lod_state WHERE key='empty_phase_end_at'")"
pg_empty_done="$(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -Atqc "SELECT value FROM kickside_lod_state WHERE key='empty_round_done'")"
pg_empty_expected="$(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -Atqc "SELECT COUNT(*) FROM kickside_lod_round_baseline")"
psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -Atqc \
  "SELECT job_id FROM kickside_lod_round_baseline WHERE job_completed=1" \
  > "$lod_report_root/$run_id.empty-jobs.txt"
pg_completed_count="$(wc -l < "$lod_report_root/$run_id.empty-jobs.txt")"
read -r pg_tx_count pg_statement_count pg_incomplete pg_tx_p99 pg_tx_max pg_overhead_count pg_overhead_p95 pg_overhead_max pg_empty_rate pg_queue_ms < <(
  python3 "$repo_root/ops/load/pg_transactions.py" "$pg_log" "$artifact_raw/$run_id.transactions.csv" \
    "$pg_empty_start" "$pg_empty_end" "$lod_report_root/$run_id.empty-jobs.txt" \
    "$artifact_raw/$run_id.empty-rounds.csv"
)
echo "PostgreSQL transaction log: $pg_tx_count complete transactions, $pg_statement_count statements, $pg_incomplete open BEGIN records, p99=$pg_tx_p99 ms, max=$pg_tx_max ms"
echo "Passive empty rounds: $pg_overhead_count/$pg_completed_count/$pg_empty_done/$pg_empty_expected paired/job-completed/drive-committed/expected, p95=$pg_overhead_p95 ms, sustained rate=$pg_empty_rate/s"
echo "Release/queue latency to first claim: $pg_queue_ms ms"
psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -v ON_ERROR_STOP=1 \
  -c "INSERT INTO kickside_lod_metric(metric,target,measured,status,detail) VALUES
    ('transaction p99','≤50 ms','$pg_tx_p99',CASE WHEN $pg_incomplete>0 THEN 'UNMEASURED' WHEN $pg_tx_p99<=50 THEN 'PASS' ELSE 'FAIL' END,'$pg_tx_count logged transactions; $pg_statement_count statements; full observations in $run_id.transactions.csv'),
    ('transaction max','≤250 ms','$pg_tx_max',CASE WHEN $pg_incomplete>0 THEN 'UNMEASURED' WHEN $pg_tx_max<=250 THEN 'PASS' ELSE 'FAIL' END,'$pg_tx_count logged transactions; full observations in $run_id.transactions.csv')" >/dev/null
if (( pg_overhead_count > 0 )); then
  psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -v ON_ERROR_STOP=1 \
    -c "UPDATE kickside_lod_metric SET measured='$pg_overhead_p95',
      status=CASE WHEN $pg_overhead_count=$pg_empty_expected AND $pg_overhead_p95<=50 THEN 'PASS' ELSE 'FAIL' END,
      detail='$pg_overhead_count/$pg_empty_expected committed-AND-job-completed claim-to-durable-completion boundary pairs; no harness I/O inside intervals; $run_id.empty-rounds.csv'
      WHERE metric='empty-round overhead p95'" \
    -c "UPDATE kickside_lod_metric SET measured='$pg_empty_rate',
      status=CASE WHEN $pg_overhead_count=$pg_empty_expected AND $pg_empty_rate>=100 THEN 'PASS' ELSE 'FAIL' END,
      detail='$pg_overhead_count/$pg_empty_expected committed-AND-job-completed empty rounds over first claim to last durable completion; release/queue latency measured separately'
      WHERE metric='empty rounds/s'" >/dev/null
else
  psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -v ON_ERROR_STOP=1 \
    -c "UPDATE kickside_lod_metric SET measured='0 complete pairs',status='FAIL',
      detail='No committed-and-job-completed empty rounds have paired claim/completion boundaries'
      WHERE metric IN ('empty-round overhead p95','empty rounds/s')" >/dev/null
fi
psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -v ON_ERROR_STOP=1 \
  -c "INSERT INTO kickside_lod_metric(metric,target,measured,status,detail)
    VALUES('release-to-first-claim','diagnostic','$pg_queue_ms','MEASURED',
      'Release UPDATE completion to first claim BEGIN in passive PostgreSQL statement log')
    ON CONFLICT(metric) DO UPDATE SET measured=excluded.measured,status=excluded.status,detail=excluded.detail" >/dev/null
psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -v ON_ERROR_STOP=1 \
  -f "$repo_root/ops/load/vacuum-report.sql"

echo "Preparing SQLite $lod_sqlite_drives-drive scale=$lod_scale run"
sqlite_log_start="$(wc -c < "$run_log")"
run_wippy kickside.load:prepare lod_sqlite_seed
sqlite3 "$sqlite_file" "INSERT INTO kickside_lod_state(key,value) VALUES
  ('automation_count','$lod_sqlite_drives'),('source_thread_count','1'),('timers_per_automation','0')
  ON CONFLICT(key) DO UPDATE SET value=excluded.value"
run_wippy kickside.load:install lod_sqlite_seed
sqlite3 -cmd ".parameter init" \
  -cmd ".parameter set :base_drive_count $lod_sqlite_drives" \
  "$sqlite_file" \
  < "$repo_root/ops/load/seed-sqlite.sql"
sqlite_drive_count="$(sqlite3 "$sqlite_file" "SELECT COUNT(*) FROM kickside_automation_drive WHERE automation_id IN (SELECT id FROM kickside_lod_automations)")"
[[ "$sqlite_drive_count" == "$lod_sqlite_drives" ]] || { echo "SQLite fixture has $sqlite_drive_count drives; expected $lod_sqlite_drives" >&2; exit 1; }
sqlite3 "$sqlite_file" "INSERT INTO kickside_lod_state(key,value) VALUES('smoke','$lod_smoke') ON CONFLICT(key) DO UPDATE SET value=excluded.value"
run_wippy kickside.load:claim_probe lod_sqlite_seed
run_wippy kickside.load:breakdown lod_sqlite_seed
run_wippy kickside.load:append_samples lod_sqlite_seed
run_wippy kickside.load:run_worker lod_sqlite_worker
sqlite_lock_errors="$(python3 - "$run_log" "$sqlite_log_start" <<'PY'
import re
import sys

with open(sys.argv[1], "rb") as report:
    report.seek(int(sys.argv[2]))
    lines = report.read().decode("utf-8", "replace").splitlines()
pattern = re.compile(r"database is locked|SQLITE_(?:BUSY|LOCKED)|self.?deadlock", re.I)
print(sum(bool(pattern.search(line)) for line in lines))
PY
)"
sqlite3 "$sqlite_file" "INSERT INTO kickside_lod_metric(metric,target,measured,status,detail)
  VALUES('SQLite lock errors','0','$sqlite_lock_errors',
    CASE WHEN $sqlite_lock_errors=0 THEN 'PASS' ELSE 'FAIL' END,
    'Count of database-is-locked, SQLITE_BUSY/LOCKED, and self-deadlock lines in the SQLite Wippy log segment')
  ON CONFLICT(metric) DO UPDATE SET measured=excluded.measured,status=excluded.status,detail=excluded.detail"

echo
record_environment
if ! host_isolated; then isolation_status=UNISOLATED; fi
if [[ -e "$isolation_marker" ]]; then isolation_status=UNISOLATED; fi
report_mode=VERDICT
if [[ "${isolation_status:-}" == "UNISOLATED" ]]; then
  report_mode=UNISOLATED
elif [[ "$lod_smoke" == "1" ]]; then
  report_mode=SMOKE
elif [[ "$lod_scale" != "1" ]]; then
  report_mode=PARTIAL
fi
artifact_mode=ISOLATED
artifact_isolation=ISOLATED
if [[ "${isolation_status:-}" == "UNISOLATED" ]]; then
  artifact_isolation=UNISOLATED
  artifact_mode=UNISOLATED
fi
if [[ "$lod_smoke" == "1" ]]; then artifact_mode=SMOKE; fi
run_type=FULL
if [[ "$lod_smoke" == "1" ]]; then run_type=SMOKE; fi
echo "Lane LOD $run_type measurements (SCALE=$lod_scale; SQLite drives=$lod_sqlite_drives; $report_mode):"
echo "PostgreSQL:"
psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" --csv \
  -c "SELECT metric,target,measured,status,detail FROM kickside_lod_metric ORDER BY metric" \
  > "$artifact_raw/$run_id.pg-metrics.csv"
psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" --csv \
  -c "SELECT * FROM kickside_lod_outage_observation ORDER BY tick" \
  > "$artifact_raw/$run_id.pg-outage.csv"
psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -P border=2 -P pager=off \
  -c "SELECT metric,target,measured,CASE WHEN '$report_mode'='VERDICT' THEN status ELSE '$report_mode' END AS status FROM kickside_lod_metric ORDER BY metric"
echo "PostgreSQL worker pulse lookup EXPLAIN (ANALYZE, BUFFERS):"
psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -P pager=off \
  -c "EXPLAIN (ANALYZE, BUFFERS) SELECT p.worker_id FROM kickside_job_worker_pulse p JOIN kickside_job_worker w ON w.id=p.worker_id WHERE p.worker_id=(SELECT id FROM kickside_job_worker ORDER BY id LIMIT 1) AND p.last_seen_at > NOW() - INTERVAL '30 seconds'"
echo "PostgreSQL worker lock wait samples:"
psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -P pager=off \
  -c "SELECT CASE WHEN query_text LIKE '%kickside_job_worker_pulse%' THEN 'pulse' WHEN query_text LIKE '%kickside_job_worker%' THEN 'marker' ELSE 'other' END AS writer,COUNT(*) AS samples,ROUND(MAX(wait_ms)::numeric,3) AS max_wait_ms FROM kickside_lod_lock_observation WHERE query_text LIKE '%kickside_job_worker%' GROUP BY 1 ORDER BY 1"
echo "SQLite:"
sqlite3 -header -csv "$sqlite_file" \
  "SELECT metric,target,measured,status,detail FROM kickside_lod_metric ORDER BY metric" \
  > "$artifact_raw/$run_id.sqlite-metrics.csv"
sqlite3 -header -csv "$sqlite_file" \
  "SELECT * FROM kickside_lod_outage_observation ORDER BY tick" \
  > "$artifact_raw/$run_id.sqlite-outage.csv"
sqlite3 -header -csv "$sqlite_file" \
  "SELECT * FROM kickside_lod_sqlite_round_sample ORDER BY sample_no" \
  > "$artifact_raw/$run_id.sqlite-empty-rounds.csv"
python3 "$repo_root/ops/load/stamp_artifacts.py" "$artifact_raw" "$lod_report_root" \
  "$run_id" "$artifact_mode" "$artifact_isolation"
sqlite3 -header -column "$sqlite_file" \
  "SELECT metric,target,measured,CASE WHEN '$report_mode'='VERDICT' THEN status ELSE '$report_mode' END AS status FROM kickside_lod_metric ORDER BY metric"

pg_failures="$(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -Atqc \
  "SELECT COUNT(*) FROM kickside_lod_metric WHERE status IN ('FAIL','PARTIAL','UNMEASURED')")"
sqlite_failures="$(sqlite3 "$sqlite_file" "SELECT COUNT(*) FROM kickside_lod_metric WHERE status IN ('FAIL','PARTIAL','UNMEASURED')")"
if (( pg_failures > 0 )); then
  echo "PostgreSQL diagnostic rows exceeding thresholds or lacking coverage ($report_mode):"
  psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -P pager=off -x \
    -c "SELECT metric,target,measured,CASE WHEN '$report_mode'='VERDICT' THEN status ELSE '$report_mode' END AS status,detail FROM kickside_lod_metric WHERE status='FAIL' OR (status='PARTIAL' AND metric<>'10,000-watcher propagation') ORDER BY metric"
  echo "PostgreSQL hot statements:"
  if [[ "$pg_stat_statements_enabled" == "t" ]]; then
    psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -P pager=off -x \
      -c "SELECT calls,round(total_exec_time::numeric,3) AS total_ms,round(mean_exec_time::numeric,3) AS mean_ms,LEFT(query,500) AS query FROM pg_stat_statements WHERE dbid=(SELECT oid FROM pg_database WHERE datname=current_database()) ORDER BY total_exec_time DESC LIMIT 5"
  else
    echo "pg_stat_statements is not enabled; longest observed active SQL statements:"
    psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -P pager=off -x \
      -c "SELECT observed_at,xact_age_ms,LEFT(hot_statement,500) AS hot_statement FROM kickside_lod_observation WHERE hot_statement<>'' ORDER BY xact_age_ms DESC LIMIT 5"
  fi
  echo "PostgreSQL pg_locks wait samples:"
  psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -P pager=off -x \
    -c "SELECT observed_at,pid,blocking_pids,locktype,relation_name,mode,wait_ms,LEFT(query_text,500) AS query_text FROM kickside_lod_lock_observation ORDER BY wait_ms DESC LIMIT 10"
  echo "PostgreSQL EXPLAIN evidence for hot lookup paths:"
  psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -P pager=off \
    -c "SELECT metric,detail FROM kickside_lod_metric WHERE metric='indexed hot queries'"
fi
if (( sqlite_failures > 0 )); then
  echo "SQLite diagnostic rows, EXPLAIN plans, and timed database-pool waits ($report_mode):"
  sqlite3 -header -line "$sqlite_file" \
    "SELECT metric,target,measured,CASE WHEN '$report_mode'='VERDICT' THEN status ELSE '$report_mode' END AS status,detail FROM kickside_lod_metric WHERE status='FAIL' OR status='PARTIAL' OR metric IN ('indexed hot queries','nested waits') ORDER BY metric"
fi
echo ""
echo "Diagnostic rows exceeding thresholds or lacking coverage: PostgreSQL=$pg_failures SQLite=$sqlite_failures"
if [[ "$report_mode" == "UNISOLATED" && "$lod_smoke" != "1" ]]; then exit 2; fi
if [[ "$report_mode" == "PARTIAL" && "$lod_smoke" != "1" ]]; then exit 2; fi
if [[ "$lod_smoke" == "1" ]]; then
  pg_workflow_proofs="$(psql -h "$pg_host" -p "$pg_port" -U "$pg_user" -d "$lod_db" -Atqc \
    "SELECT COUNT(*) FROM kickside_lod_metric WHERE metric IN ('1,000 terminal checks','dataflow terminal evidence retained') AND status='SMOKE'")"
  sqlite_workflow_proofs="$(sqlite3 "$sqlite_file" \
    "SELECT COUNT(*) FROM kickside_lod_metric WHERE metric IN ('1,000 terminal checks','dataflow terminal evidence retained') AND status='SMOKE'")"
  if [[ "$pg_workflow_proofs" != "2" || "$sqlite_workflow_proofs" != "2" ]]; then
    echo "Workflow terminal/evidence smoke failed: PG=$pg_workflow_proofs SQLite=$sqlite_workflow_proofs" >&2
    exit 1
  fi
  sqlite_correctness_status="$(sqlite3 "$sqlite_file" \
    "SELECT status FROM kickside_lod_metric WHERE metric='SQLite 200-drive correctness'")"
  if [[ "$sqlite_correctness_status" != "SMOKE" ]]; then
    echo "SQLite $lod_sqlite_drives-drive correctness smoke failed: $sqlite_correctness_status" >&2
    exit 1
  fi
  if (( sqlite_lock_errors != 0 )); then
    echo "SQLite $lod_sqlite_drives-drive smoke recorded $sqlite_lock_errors lock errors" >&2
    exit 1
  fi
fi
if [[ "$report_mode" == "VERDICT" ]] && (( pg_failures > 0 || sqlite_failures > 0 )); then exit 1; fi
