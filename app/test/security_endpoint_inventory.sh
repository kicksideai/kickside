#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

(
  cd "$ROOT"
  wippy registry list --kind http.endpoint --json | jq -r '.[].id' | sort > "$TMP_DIR/registry.txt"
)

rg -o '\["[^"]+"\]' "$ROOT/test/security_policy_test.lua" \
  | sed 's/^\["//; s/"\]$//' \
  | sort > "$TMP_DIR/policy_test.txt"

if ! comm -23 "$TMP_DIR/registry.txt" "$TMP_DIR/policy_test.txt" > "$TMP_DIR/missing.txt"; then
  exit 1
fi
if ! comm -13 "$TMP_DIR/registry.txt" "$TMP_DIR/policy_test.txt" > "$TMP_DIR/stale.txt"; then
  exit 1
fi

if [[ -s "$TMP_DIR/missing.txt" || -s "$TMP_DIR/stale.txt" ]]; then
  echo "security endpoint inventory mismatch"
  if [[ -s "$TMP_DIR/missing.txt" ]]; then
    echo
    echo "Missing from USER_ENDPOINT_DECISIONS:"
    cat "$TMP_DIR/missing.txt"
  fi
  if [[ -s "$TMP_DIR/stale.txt" ]]; then
    echo
    echo "Stale in USER_ENDPOINT_DECISIONS:"
    cat "$TMP_DIR/stale.txt"
  fi
  exit 1
fi

echo "security endpoint inventory matches USER_ENDPOINT_DECISIONS"
