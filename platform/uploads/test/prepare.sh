#!/usr/bin/env bash
set -eu
upload_test_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
mkdir -p "$upload_test_dir/src/fixtures"
cp "$upload_test_dir/../src/uploads_presigned.lua" "$upload_test_dir/src/fixtures/uploads_presigned.lua"
cp "$upload_test_dir/../src/binding/storage_adapter_default.lua" "$upload_test_dir/src/fixtures/storage_adapter_default.lua"
cp "$upload_test_dir/../src/binding/storage_location.lua" "$upload_test_dir/src/fixtures/storage_location.lua"
cp "$upload_test_dir/../src/api/list_uploads.lua" "$upload_test_dir/src/fixtures/list_uploads.lua"
cp "$upload_test_dir/../src/api/response.lua" "$upload_test_dir/src/fixtures/response.lua"
cp "$upload_test_dir/../src/api/get_upload.lua" "$upload_test_dir/src/fixtures/get_upload.lua"
cp "$upload_test_dir/../src/api/artifacts.lua" "$upload_test_dir/src/fixtures/artifacts.lua"
cp "$upload_test_dir/../src/api/delete_upload.lua" "$upload_test_dir/src/fixtures/delete_upload.lua"
cp "$upload_test_dir/../src/api/get_raw.lua" "$upload_test_dir/src/fixtures/get_raw.lua"
awk -v wanted="user.runtime_contracts" '
  /^version:|^namespace:/ { print; next }
  /^entries:/ { print; next }
  /^  - / { selected = ($0 == "  - name: " wanted); if (selected) found++ }
  selected {  print }
  END { if (found != 1) exit 1 }
' "${upload_test_dir}/../../../app/src/app/security/_index.yaml" > "$upload_test_dir/src/fixtures/app_upload_policy.yaml"
awk -v wanted="uploads" '
  /^version:|^namespace:/ { print; next }
  /^entries:/ { print; next }
  /^  - / { selected = ($0 == "  - name: " wanted); if (selected) found++ }
  selected {  print }
  END { if (found != 1) exit 1 }
' "${upload_test_dir}/../../../app/src/app/registry/storage/_index.yaml" > "$upload_test_dir/src/fixtures/app_upload_storage.yaml"
