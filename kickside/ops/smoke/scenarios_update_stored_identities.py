"""Cold update migrations preserve stored identities and durable history."""
from harness import Scenario
from module_harness import run_focused_module_test


def natural_keys(ctx):
    run_focused_module_test(ctx, "kickside/core", "thread_natural_keys_migration_test")


def retired_upload_slot(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "retired_upload_slot_migration_test")


def dispatch_fixture_settlement(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "worker_process_test")


REGISTRY = [
    Scenario("update_legacy_thread_keys", "regression", natural_keys,
             issues=("CORE-LEGACY-NATURAL-KEY-UPGRADE",)),
    Scenario("update_retired_upload_slot", "regression", retired_upload_slot,
             issues=("JOBS-RETIRED-UPLOAD-SLOT-UPGRADE",)),
    Scenario("jobs_dispatch_fixture_settlement", "regression", dispatch_fixture_settlement,
             issues=("HOT-UPDATE-INFLIGHT-EXACTLY-ONCE",)),
]
