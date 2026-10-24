"""Committed receipt purge dependencies retain native errors."""
from harness import Scenario
from module_harness import run_focused_module_test


def purge(ctx):
    run_focused_module_test(ctx, "kickside/core", "receipt_purge_native_test")
    run_focused_module_test(ctx, "kickside/core", "service_test")


REGISTRY = [Scenario("native_errors_core_receipt_purge", "regression", purge, issues=("NE-104",), parallel=('native-root:kickside/core',))]
