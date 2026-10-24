"""Job child release failure survives every completed execution path."""
from harness import Scenario
from module_harness import run_focused_module_test


def release(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "job_child_release_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "job_child_startup_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "execute_job_routing_test")


REGISTRY = [Scenario("native_errors_jobs_child_release", "regression", release, issues=("NE-279",), parallel=('native-root:kickside/jobs',))]
