"""Component mutation fences preserve native dependency failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def fence(ctx):
    run_focused_module_test(ctx, "kickside/component", "fence_native_test")
    run_focused_module_test(ctx, "kickside/component", "fence_test")


REGISTRY = [Scenario("native_errors_component_fence", "regression", fence, issues=("NE-83",))]
