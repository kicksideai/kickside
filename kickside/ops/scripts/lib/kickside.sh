#!/usr/bin/env bash
set -euo pipefail

script_dir() {
  cd -- "$(dirname -- "${BASH_SOURCE[1]}")" && pwd -P
}

ops_root() {
  local dir
  dir="$(script_dir)"
  cd -- "$dir/../.." && pwd -P
}

kickside_root() {
  if [[ -n "${KICKSIDE_ROOT:-}" ]]; then
    cd -- "$KICKSIDE_ROOT" && pwd -P
    return
  fi
  cd -- "$(ops_root)/.." && pwd -P
}

wippy_bin() {
  if [[ -n "${WIPPY_BIN:-}" ]]; then
    printf '%s\n' "$WIPPY_BIN"
    return
  fi
  if command -v wippy >/dev/null 2>&1; then
    command -v wippy
    return
  fi
  if [[ -x "$HOME/wippy/wippy/dist/wippy-linux-amd64" ]]; then
    printf '%s\n' "$HOME/wippy/wippy/dist/wippy-linux-amd64"
    return
  fi
  command -v wippy
}

load_env_value() {
  local file="$1"
  local key="$2"
  awk -F= -v key="$key" '$1 == key { print substr($0, index($0, "=") + 1); exit }' "$file" 2>/dev/null
}

require_dir() {
  local dir="$1"
  if [[ ! -d "$dir" ]]; then
    printf 'missing directory: %s\n' "$dir" >&2
    exit 1
  fi
}
