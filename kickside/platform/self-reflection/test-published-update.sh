#!/usr/bin/env bash
set -euo pipefail
module_root="$(cd "$(dirname "$0")" && pwd)"
update_root="$(mktemp -d "${TMPDIR:?TMPDIR must point to the lane}/reflection-update.XXXXXXXX")"
trap 'rm -rf "$update_root"' EXIT
cp "$module_root/one-scope-test/"{_index.yaml,wippy.yaml} "$update_root/"
cp -r "$module_root/one-scope-test/src" "$update_root/src"
printf 'version: "1.0"\n' > "$update_root/published.yaml"
printf 'version: "1.0"\nworkspace:\n  replacements:\n    kickside/self-reflection: %s\n' "$module_root" > "$update_root/local.yaml"
cd "$update_root"
wippy update --src-dir . --config published.yaml --lock-file wippy.lock
cp wippy.lock published.lock
wippy test --config published.yaml
wippy update --src-dir . --config local.yaml --lock-file wippy.lock.fresh
mv wippy.lock.fresh wippy.lock
wippy test --config local.yaml
