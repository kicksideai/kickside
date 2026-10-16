#!/usr/bin/env bash
set -eu
widgets_test_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cp "$widgets_test_dir/../src/api/create_view_resolver.lua" "$widgets_test_dir/src/create_view_resolver.lua"
