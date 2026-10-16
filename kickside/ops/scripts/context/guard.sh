#!/usr/bin/env bash
set -euo pipefail

source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)/lib/kickside.sh"

root="${1:-$(kickside_root)}"
max_bytes="${CONTEXT_GUARD_MAX_BYTES:-1048576}"
allowlist="${CONTEXT_GUARD_ALLOWLIST:-$(ops_root)/context-allowlist.txt}"

cd "$root"

is_allowlisted() {
  local path="$1"
  local pattern

  [[ -f "$allowlist" ]] || return 1
  while IFS= read -r pattern || [[ -n "$pattern" ]]; do
    [[ -z "$pattern" || "${pattern:0:1}" == "#" ]] && continue
    case "$path" in
      $pattern) return 0 ;;
    esac
  done <"$allowlist"

  return 1
}

is_context_risk() {
  local path="$1"

  case "$path" in
    *.7z|*.bz2|*.db|*.db-shm|*.db-wal|*.gif|*.gz|*.jpeg|*.jpg|*.log|*.map|*.mov|*.mp4|*.pdf|*.png|*.sqlite|*.tar|*.tgz|*.tsbuildinfo|*.wapp|*.webp|*.zip)
      return 0
      ;;
    */static/*.js|*/static/*.css|*/static*/*.js|*/static*/*.css)
      return 0
      ;;
  esac

  return 1
}

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

if ! command -v rg >/dev/null 2>&1; then
  printf 'context guard requires rg so it can honor .rgignore\n' >&2
  exit 2
fi

rg --files >"$tmp"

violations=0
allowed=0

while IFS= read -r path || [[ -n "$path" ]]; do
  size="$(stat -c '%s' "$path")"

  if (( size <= max_bytes )) && ! is_context_risk "$path"; then
    continue
  fi

  if is_allowlisted "$path"; then
    ((allowed += 1))
    continue
  fi

  if (( violations == 0 )); then
    printf 'Context-risk files found. Do not bulk-read these into prompts:\n' >&2
  fi
  printf '  %10d  %s\n' "$size" "$path" >&2
  ((violations += 1))
done <"$tmp"

if (( violations > 0 )); then
  printf '\nAdd intentional generated assets to %s; otherwise delete or keep them outside the repo.\n' "$allowlist" >&2
  exit 1
fi

printf 'context guard passed'
if (( allowed > 0 )); then
  printf ' (%d allowlisted large/generated files skipped)' "$allowed"
fi
printf '\n'
