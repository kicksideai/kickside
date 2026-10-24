"""Retention owner validation failures carry permanent native policy."""
from harness import Scenario
from module_harness import run_focused_module_test


def validation(ctx):
    run_focused_module_test(ctx, "kickside/core", "owner_validation_native_test")
    run_focused_module_test(ctx, "kickside/core", "owner_isolation_test")


REGISTRY = [Scenario("native_errors_core_owner_validation", "regression", validation, issues=("NE-94",), parallel=('native-root:kickside/core',))]
