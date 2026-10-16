#!/usr/bin/env bash
# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
set -eu
knowledge_test_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cp "$knowledge_test_dir/../src/organize/planner.lua" "$knowledge_test_dir/src/fixtures/planner.lua"
cp "$knowledge_test_dir/../src/traits/kb_ingest/fetch_url.lua" "$knowledge_test_dir/src/fixtures/kb_fetch_url.lua"
