"""Retention migration readiness preserves native dependency fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def readiness(ctx):
    run_focused_module_test(ctx, "kickside/core", "owner_readiness_native_test")
    run_focused_module_test(ctx, "kickside/core", "owner_isolation_test")


REGISTRY = [Scenario("native_errors_core_owner_readiness", "regression", readiness, issues=("NE-92",), parallel=('native-root:kickside/core',))]
