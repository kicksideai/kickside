"""Retention policy persistence preserves native dependency fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def persistence(ctx):
    run_focused_module_test(ctx, "kickside/core", "retention_persist_native_test")
    run_focused_module_test(ctx, "kickside/core", "retention_test")
    run_focused_module_test(ctx, "kickside/core", "provision_retention_failure_test")


REGISTRY = [Scenario("native_errors_core_retention_persistence", "regression", persistence, issues=("NE-99",))]
