"""Lease heartbeat cancellation retains native failures through child cleanup."""
from harness import Scenario
from module_harness import run_focused_module_test


def cancellation(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "lease_stop_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "lease_test")
    run_focused_module_test(ctx, "kickside/jobs", "job_child_release_native_test")


REGISTRY = [Scenario("native_errors_jobs_lease_stop", "regression", cancellation, issues=("NE-280",))]
