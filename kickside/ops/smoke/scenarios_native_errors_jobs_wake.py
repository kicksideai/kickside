"""Wake boundaries retain native policies and transaction rollback causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def wake(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "wake_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "wake_clock_test")
    run_focused_module_test(ctx, "kickside/jobs", "recovery_test")


REGISTRY = [Scenario("native_errors_jobs_wake", "regression", wake, issues=("NE-174",))]
