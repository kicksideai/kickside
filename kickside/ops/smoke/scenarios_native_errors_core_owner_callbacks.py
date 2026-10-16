"""Retention owner callback errors retain native fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def callbacks(ctx):
    run_focused_module_test(ctx, "kickside/core", "owner_callback_native_test")
    run_focused_module_test(ctx, "kickside/core", "owner_isolation_test")


REGISTRY = [Scenario("native_errors_core_owner_callbacks", "regression", callbacks, issues=("NE-93",))]
