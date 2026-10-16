#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

db=.proof/native-wait.db
log1=.proof/native-wait-first.log
log2=.proof/native-wait-second.log
driver_pid=""

mkdir -p .proof

runtime_pid() {
  local script_pid
  [[ -n "$driver_pid" ]] || return 0
  script_pid=$driver_pid
  pgrep -P "$script_pid" -x wippy 2>/dev/null | head -n 1 || true
}

start_phase() {
  local entrypoint=$1 logfile=$2
  setsid script -qefc "wippy run -c -x $entrypoint" "$logfile" >/dev/null 2>&1 &
  driver_pid=$!
}

stop_server() {
  local runtime
  runtime=$(runtime_pid)
  [[ -z "$runtime" ]] || kill -TERM "$runtime" 2>/dev/null || true
  if [[ -n "$driver_pid" ]] && kill -0 "$driver_pid" 2>/dev/null; then
    kill -TERM -- "-$driver_pid" 2>/dev/null || true
    wait "$driver_pid" 2>/dev/null || true
  fi
  driver_pid=""
}
trap stop_server EXIT

assert_execution_frame() {
  [[ "$(sqlite3 "$db" "SELECT actor_id FROM dataflows WHERE dataflow_id='$dataflow_id'")" == "system:native-wait-owner" ]]
  [[ "$(sqlite3 "$db" "SELECT json_extract(actor_context, '$.kind') FROM dataflows WHERE dataflow_id='$dataflow_id'")" == "dataflow.execution_frame" ]]
  [[ "$(sqlite3 "$db" "SELECT json_extract(actor_context, '$.version') FROM dataflows WHERE dataflow_id='$dataflow_id'")" == "1" ]]
  [[ "$(sqlite3 "$db" "SELECT json_extract(actor_context, '$.policy_ids') FROM dataflows WHERE dataflow_id='$dataflow_id'")" == '["app:proof_policy"]' ]]
  [[ "$(sqlite3 "$db" "SELECT json_type(actor_context, '$.actor_meta') FROM dataflows WHERE dataflow_id='$dataflow_id'")" == "object" ]]
  [[ "$(sqlite3 "$db" "SELECT json_extract(actor_context, '$.actor_meta.system') FROM dataflows WHERE dataflow_id='$dataflow_id'")" == "1" ]]
}

rm -rf ../.test-modules .wippy
rm -f "$db" "$db-shm" "$db-wal" "$log1" "$log2"

start_phase app:native_wait_phase_one "$log1"
for _ in $(seq 1 160); do
  dataflow_id=$(sqlite3 "$db" "SELECT dataflow_id FROM dataflows WHERE type='native-wait-proof' LIMIT 1" 2>/dev/null || true)
  yield_count=$(sqlite3 "$db" "SELECT COUNT(*) FROM dataflow_data WHERE dataflow_id='$dataflow_id' AND type='node.yield'" 2>/dev/null || true)
  [[ -n "$dataflow_id" && "$yield_count" == "1" ]] && break
  flow_status=$(sqlite3 "$db" "SELECT status FROM dataflows WHERE dataflow_id='$dataflow_id'" 2>/dev/null || true)
  if [[ "$flow_status" == "failed" || "$flow_status" == "cancelled" ]]; then
    tail -n 100 "$log1" >&2
    exit 1
  fi
  kill -0 "$driver_pid" 2>/dev/null || { tail -n 100 "$log1" >&2; exit 1; }
  sleep 0.25
done
if [[ -z "${dataflow_id:-}" || "${yield_count:-}" != "1" ]]; then
  tail -n 100 "$log1" >&2
  exit 1
fi
[[ "$(sqlite3 "$db" "SELECT COUNT(*) FROM dataflow_nodes WHERE dataflow_id='$dataflow_id' AND type='kickside.blocks:await'")" == "1" ]]

runtime=$(runtime_pid)
[[ -n "$runtime" ]]
[[ "$(sqlite3 "$db" "SELECT COUNT(*) FROM native_wait_arm_calls WHERE actor_id='system:native-wait-owner' AND signal_id='native-wait-restart'")" == "1" ]]
assert_execution_frame
kill -KILL "$runtime"
kill -TERM -- "-$driver_pid" 2>/dev/null || true
wait "$driver_pid" 2>/dev/null || true
driver_pid=""

start_phase app:native_wait_phase_two "$log2"
for _ in $(seq 1 200); do
  status=$(sqlite3 "$db" "SELECT status FROM dataflows WHERE dataflow_id='$dataflow_id'" 2>/dev/null || true)
  [[ "$status" == "completed" ]] && break
  if [[ "$status" == "failed" || "$status" == "cancelled" ]]; then
    tail -n 120 "$log2" >&2
    exit 1
  fi
  kill -0 "$driver_pid" 2>/dev/null || { tail -n 120 "$log2" >&2; exit 1; }
  sleep 0.15
done
stop_server

if [[ "${status:-}" != "completed" ]]; then
  tail -n 120 "$log2" >&2
  exit 1
fi
[[ "$(sqlite3 "$db" "SELECT COUNT(*) FROM dataflow_nodes WHERE dataflow_id='$dataflow_id'")" == "1" ]]
[[ "$(sqlite3 "$db" "SELECT COUNT(*) FROM dataflow_nodes WHERE dataflow_id='$dataflow_id' AND status='completed'")" == "1" ]]
[[ "$(sqlite3 "$db" "SELECT COUNT(*) FROM dataflow_data WHERE dataflow_id='$dataflow_id' AND type='node.signal.consumed'")" == "1" ]]
[[ "$(sqlite3 "$db" "SELECT COUNT(*) FROM dataflow_data WHERE dataflow_id='$dataflow_id' AND type='dataflow.output'")" == "1" ]]

[[ "$(sqlite3 "$db" "SELECT COUNT(*) FROM native_wait_arm_calls WHERE actor_id='system:native-wait-owner' AND signal_id='native-wait-restart'")" == "1" ]]
assert_execution_frame

jq -n --arg dataflow_id "$dataflow_id" --arg status "$status" \
  '{dataflow_id:$dataflow_id,status:$status,native_wait_nodes:1,arm_calls:1,consumed_signals:1,outputs:1,restarts:1}'
