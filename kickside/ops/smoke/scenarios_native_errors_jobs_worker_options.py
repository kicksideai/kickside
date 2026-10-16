"""Worker process options refuse startup with a complete native outcome."""
from harness import Scenario
from module_harness import run_focused_module_test


def options(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "worker_options_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "worker_startup_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "loop_test")


REGISTRY = [Scenario("native_errors_jobs_worker_options", "regression", options, issues=("NE-277",))]
