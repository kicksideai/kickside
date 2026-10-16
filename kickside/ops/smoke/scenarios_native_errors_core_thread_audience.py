"""Thread audience database errors retain native fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def audience(ctx):
    run_focused_module_test(ctx, "kickside/core", "thread_audience_native_test")
    run_focused_module_test(ctx, "kickside/core", "notify_test")


REGISTRY = [Scenario("native_errors_core_thread_audience", "regression", audience, issues=("NE-97",))]
