#!/usr/bin/env bash
set -euo pipefail

source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)/lib/kickside.sh"

if [[ $# -lt 1 || $# -gt 2 ]]; then
  printf 'usage: %s <package-dir> [display-name]\n' "$0" >&2
  exit 2
fi

root="$(kickside_root)"
pkg_dir="$root/$1"
display_name="${2:-}"
dry_run="${PUBLISH_DRY_RUN:-1}"
bin="$(wippy_bin)"

require_dir "$pkg_dir"

args=(publish --module-type library)
if [[ -n "$display_name" ]]; then
  args+=(--module-display-name "$display_name")
fi
if [[ "$dry_run" != "0" ]]; then
  args+=(--dry-run)
fi

cd "$pkg_dir"
suffix=""
if [[ "$dry_run" != "0" ]]; then
  suffix=" (dry-run)"
fi
printf 'publishing %s%s\n' "$1" "$suffix"
"$bin" "${args[@]}"
