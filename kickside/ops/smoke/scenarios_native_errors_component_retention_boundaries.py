"""Retention stops downstream effects at native dependency failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def retention_boundaries(ctx):
    run_focused_module_test(ctx, "kickside/component", "retention_boundary_native_test")
    run_focused_module_test(ctx, "kickside/component", "owner_gc_test")


REGISTRY = [Scenario("native_errors_component_retention_boundaries", "regression", retention_boundaries, issues=("NE-210",))]
