#!/usr/bin/env bash
set -euo pipefail

source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)/lib/kickside.sh"

if [[ $# -ne 1 ]]; then
  printf 'usage: %s <rollout-env-file>\n' "$0" >&2
  exit 2
fi

manifest="$1"
if [[ ! -f "$manifest" ]]; then
  printf 'missing rollout manifest: %s\n' "$manifest" >&2
  exit 1
fi

source "$manifest"

if [[ -z "${PACKAGES:-}" ]]; then
  printf 'rollout manifest must set PACKAGES\n' >&2
  exit 1
fi

ops="$(ops_root)"
for package_dir in $PACKAGES; do
  var="DISPLAY_${package_dir//[^A-Za-z0-9]/_}"
  display_name="${!var:-}"
  "$ops/scripts/publish/package.sh" "$package_dir" "$display_name"
done

