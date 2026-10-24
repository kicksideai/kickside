"""Worker database release refuses before subsequent idle offers or execution."""
from harness import Scenario
from module_harness import run_focused_module_test


def release(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "worker_release_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "worker_cleanup_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "loop_test")


REGISTRY = [Scenario("native_errors_jobs_worker_release", "regression", release, issues=("NE-275",), parallel=('native-root:kickside/jobs',))]
