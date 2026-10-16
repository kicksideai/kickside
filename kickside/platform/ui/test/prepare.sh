#!/usr/bin/env bash
set -eu
ui_test_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cp "$ui_test_dir/../src/api/list_nav.lua" "$ui_test_dir/suites/nav_subject.lua"

cp "$ui_test_dir/../src/registry_nav_provider.lua" "$ui_test_dir/suites/registry_provider_subject.lua"
cp "$ui_test_dir/../src/contributions.lua" "$ui_test_dir/suites/contributions_subject.lua"
cp "$ui_test_dir/../src/shell_discovery.lua" "$ui_test_dir/suites/discovery_subject.lua"
