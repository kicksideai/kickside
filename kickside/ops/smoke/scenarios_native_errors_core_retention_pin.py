"""Retention pin dependencies retain native error fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def pins(ctx):
    run_focused_module_test(ctx, "kickside/core", "retention_pin_native_test")
    run_focused_module_test(ctx, "kickside/core", "pin_test")


REGISTRY = [Scenario("native_errors_core_retention_pin", "regression", pins, issues=("NE-100",))]
