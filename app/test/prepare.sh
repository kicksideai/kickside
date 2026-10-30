#!/usr/bin/env bash
set -eu
app_test_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
mkdir -p "$app_test_dir/src/fixtures"
ln -sfn "../../../src/app/documentation.lua" "$app_test_dir/src/fixtures/documentation.lua"
awk -v wanted="documentation" '
  /^version:|^namespace:/ { print; next }
  /^entries:/ { print; next }
  /^  - / { selected = ($0 == "  - name: " wanted); if (selected) found++ }
  selected { if ($0 ~ /^    source:/) $0 = "    source: file://fixtures/documentation.lua"; print }
  END { if (found != 1) exit 1 }
' "$app_test_dir/../src/app/registry/documentation/_index.yaml" > "$app_test_dir/src/documentation_tool_fixture.yaml"
cp "$app_test_dir/../src/app/login/login_jet.lua" "$app_test_dir/src/login_subject.lua"
cp "$app_test_dir/../src/app/ui/_index.yaml" "$app_test_dir/src/navigation_fixture.yaml"

cp "$app_test_dir/../src/app/api/websocket/ws_endpoint.lua" "$app_test_dir/src/ws_scope_subject.lua"
