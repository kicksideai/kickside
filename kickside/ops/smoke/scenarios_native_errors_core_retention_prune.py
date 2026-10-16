"""Retention prune preserves native dependency failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def pruning(ctx):
    run_focused_module_test(ctx, "kickside/core", "retention_prune_native_test")
    run_focused_module_test(ctx, "kickside/core", "prune_test")


REGISTRY = [Scenario("native_errors_core_retention_prune", "regression", pruning, issues=("NE-101",))]
