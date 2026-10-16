"""Thread cleanup retains native dependency and rollback errors."""
from harness import Scenario
from module_harness import run_focused_module_test


def thread_cleanup(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "thread_cleanup_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "thread_teardown_test")


REGISTRY = [Scenario("native_errors_thread_cleanup", "regression", thread_cleanup, issues=("NE-161",))]
