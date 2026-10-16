"""Jobs lease-release signaling retains native dependency fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def lease_release(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "lease_release_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "service_signal_test")


REGISTRY = [Scenario("native_errors_jobs_lease_release", "regression", lease_release, issues=("NE-152",))]
