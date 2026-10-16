"""Thread teardown callers retain native failures and required outcomes."""
from harness import Scenario
from module_harness import run_focused_module_test


def teardown(ctx):
    run_focused_module_test(ctx, "kickside/core", "teardown_native_test")
    run_focused_module_test(ctx, "kickside/core", "lifecycle_test")
    run_focused_module_test(ctx, "kickside/core", "cleanup_wake_test")


REGISTRY = [Scenario("native_errors_thread_teardown", "regression", teardown, issues=("NE-136",))]
