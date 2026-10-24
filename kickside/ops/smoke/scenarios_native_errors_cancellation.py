"""Cancellation preserves native dependencies and rollback causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def cancellation(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "cancellation_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "live_cancellation_test")
    run_focused_module_test(ctx, "kickside/jobs", "transitions_revocation_test")
    run_focused_module_test(ctx, "kickside/jobs", "transitions_completion_test")


REGISTRY = [Scenario("native_errors_cancellation", "regression", cancellation, issues=("NE-160",), parallel=('native-root:kickside/jobs',))]
