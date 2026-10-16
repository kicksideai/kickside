"""Worker shutdown preserves cancellation, listener and subscription failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def cleanup(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "worker_cleanup_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "heartbeat_cancel_completion_test")
    run_focused_module_test(ctx, "kickside/jobs", "worker_startup_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "heartbeat_native_test")


REGISTRY = [Scenario("native_errors_jobs_worker_cleanup", "regression", cleanup, issues=("NE-274",))]
