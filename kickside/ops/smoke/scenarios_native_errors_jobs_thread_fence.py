"""Thread-owner fence dependencies retain native error fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def fence(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "thread_fence_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "thread_teardown_test")


REGISTRY = [Scenario("native_errors_jobs_thread_fence", "regression", fence, issues=("NE-89",))]
