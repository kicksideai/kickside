#!/usr/bin/env bash
set -euo pipefail

source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)/lib/kickside.sh"

root="$(kickside_root)"
app_dir="$root/app"
require_dir "$app_dir"
pid_file="$app_dir/.wippy/app.pid"
log_file="$app_dir/run.log"
port="${KICKSIDE_PORT:-8085}"
screen_session="${KICKSIDE_SCREEN_SESSION:-kickside-app}"

bin="$(wippy_bin)"
if [[ ! -x "$bin" ]]; then
  printf 'wippy binary is not executable: %s\n' "$bin" >&2
  exit 1
fi

if [[ -z "${ENCRYPTION_KEY:-}" && -f "$app_dir/.env" ]]; then
  export ENCRYPTION_KEY
  ENCRYPTION_KEY="$(load_env_value "$app_dir/.env" ENCRYPTION_KEY)"
fi

if [[ -z "${ENCRYPTION_KEY:-}" ]]; then
  printf 'ENCRYPTION_KEY is required; set it or add it to app/.env\n' >&2
  exit 1
fi

is_app_pid() {
  local pid="$1"
  local args

  [[ "$pid" =~ ^[0-9]+$ ]] || return 1
  kill -0 "$pid" 2>/dev/null || return 1
  args="$(ps -p "$pid" -o args= 2>/dev/null || true)"
  [[ "$args" == *"wippy"* && "$args" == *" run -c"* ]]
}

stop_pid() {
  local pid="$1"

  if is_app_pid "$pid"; then
    kill -TERM "$pid" 2>/dev/null || true
  fi
}

mkdir -p "$(dirname "$pid_file")"

if command -v screen >/dev/null 2>&1; then
  screen -S "$screen_session" -X quit >/dev/null 2>&1 || true
fi

if [[ -f "$pid_file" ]]; then
  old_pid="$(tr -dc '0-9' < "$pid_file" || true)"
  if [[ -n "$old_pid" ]]; then
    stop_pid "$old_pid"
  fi
fi

for pid in $(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true); do
  stop_pid "$pid"
done

for _ in $(seq 1 80); do
  still_running=0
  if [[ -f "$pid_file" ]]; then
    old_pid="$(tr -dc '0-9' < "$pid_file" || true)"
    if [[ -n "$old_pid" ]] && is_app_pid "$old_pid"; then
      still_running=1
    fi
  fi
  for pid in $(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true); do
    if is_app_pid "$pid"; then
      still_running=1
    fi
  done
  if [[ "$still_running" == "0" ]]; then
    break
  fi
  sleep 0.25
done

for pid in $(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true); do
  if is_app_pid "$pid"; then
    printf 'existing app process did not stop: pid=%s\n' "$pid" >&2
    exit 1
  fi
done

cd "$app_dir"
: > "$log_file"
if command -v screen >/dev/null 2>&1; then
  screen -dmS "$screen_session" bash -lc "cd \"$app_dir\" && set -a && . ./.env && set +a && exec \"$bin\" run -c -p > \"$log_file\" 2>&1"
  start_pid=""
else
  nohup "$bin" run -c -p > "$log_file" 2>&1 &
  start_pid="$!"
  printf '%s\n' "$start_pid" > "$pid_file"
  disown "$start_pid"
fi

for _ in $(seq 1 120); do
  if [[ -n "$start_pid" ]]; then
    if ! kill -0 "$start_pid" 2>/dev/null; then
      printf 'kickside app exited during startup: pid=%s\n' "$start_pid" >&2
      tail -80 "$log_file" >&2 || true
      exit 1
    fi
  elif ! screen -ls | grep -q "[.]$screen_session"; then
    printf 'kickside app screen session exited during startup: session=%s\n' "$screen_session" >&2
    tail -80 "$log_file" >&2 || true
    exit 1
  fi
  code="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$port/" 2>/dev/null || true)"
  if [[ "$code" == "200" ]]; then
    listener_pid=""
    for pid in $(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true); do
      if is_app_pid "$pid"; then
        listener_pid="$pid"
        break
      fi
    done
    if [[ -n "$listener_pid" ]]; then
      printf '%s\n' "$listener_pid" > "$pid_file"
      printf 'started kickside app pid=%s url=http://localhost:%s\n' "$listener_pid" "$port"
    else
      printf 'started kickside app url=http://localhost:%s\n' "$port"
    fi
    exit 0
  fi
  sleep 0.25
done

printf 'kickside app did not become ready: url=http://localhost:%s\n' "$port" >&2
tail -120 "$log_file" >&2 || true
exit 1
