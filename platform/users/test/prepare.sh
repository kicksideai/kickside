#!/usr/bin/env bash
set -eu
users_test_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cp "$users_test_dir/../src/session.lua" "$users_test_dir/suites/session_subject.lua"
cp "$users_test_dir/../src/migrations/02_init_admin_user.lua" "$users_test_dir/admin_migration.lua"
