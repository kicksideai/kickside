"""Retention process startup dependencies preserve native errors."""
from harness import Scenario
from module_harness import run_focused_module_test


def retention(ctx):
    run_focused_module_test(ctx, "kickside/core", "retention_process_native_test")
    run_focused_module_test(ctx, "kickside/core", "service_test")


REGISTRY = [Scenario("native_errors_core_retention_process", "regression", retention, issues=("NE-108",))]
