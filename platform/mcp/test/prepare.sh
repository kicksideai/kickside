#!/usr/bin/env bash
set -eu
mcp_test_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
mkdir -p "$mcp_test_dir/src/fixtures"
cp "$mcp_test_dir/../src/api/serve_mcp.lua" "$mcp_test_dir/src/fixtures/serve_mcp.lua"
cp "$mcp_test_dir/../src/oauth/endpoints.lua" "$mcp_test_dir/src/fixtures/oauth_endpoints.lua"
cp "$mcp_test_dir/../src/api/create_credential.lua" "$mcp_test_dir/src/fixtures/create_credential.lua"
cp "$mcp_test_dir/../src/api/update_credential.lua" "$mcp_test_dir/src/fixtures/update_credential.lua"
cp "$mcp_test_dir/../src/presets.lua" "$mcp_test_dir/src/fixtures/presets.lua"
cp "$mcp_test_dir/../src/api/list_presets.lua" "$mcp_test_dir/src/fixtures/list_presets.lua"
