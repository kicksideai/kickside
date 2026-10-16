"""Gated deletion retains native preflight and abandonment causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def gated_delete(ctx):
    run_focused_module_test(ctx, "kickside/component", "gated_delete_native_test")
    run_focused_module_test(ctx, "kickside/component", "fence_test")


REGISTRY = [Scenario("native_errors_component_gated_delete", "regression", gated_delete, issues=("NE-205",))]
