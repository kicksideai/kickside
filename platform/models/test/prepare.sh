#!/usr/bin/env bash
set -eu
models_test_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
mkdir -p "$models_test_dir/fixtures"
cp "$models_test_dir/../src/api/list_models.lua" "$models_test_dir/fixtures/list_models.lua"
# Real admin handlers, copied so the card-save contract suite runs the shipped
# source (sources outside the harness directory cannot be referenced).
cp "$models_test_dir/../src/api/admin/upsert_card.lua" "$models_test_dir/fixtures/upsert_card.lua"
cp "$models_test_dir/../src/api/admin/get_admin.lua" "$models_test_dir/fixtures/get_admin.lua"

cp "$models_test_dir/../src/discovery/reference_openrouter.lua" "$models_test_dir/fixtures/reference_openrouter.lua"
