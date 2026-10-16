"""Retention owner discovery and ledger errors retain native fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def discovery(ctx):
    run_focused_module_test(ctx, "kickside/core", "owner_discovery_native_test")
    run_focused_module_test(ctx, "kickside/core", "owner_isolation_test")


REGISTRY = [Scenario("native_errors_core_owner_discovery", "regression", discovery, issues=("NE-91",))]
