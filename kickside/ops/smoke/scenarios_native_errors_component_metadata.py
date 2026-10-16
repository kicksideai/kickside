"""Component metadata retains native dependency failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def metadata(ctx):
    run_focused_module_test(ctx, "kickside/component", "meta_native_test")
    run_focused_module_test(ctx, "kickside/component", "ops_test")
    run_focused_module_test(ctx, "kickside/component", "meta_lock_order_test")


REGISTRY = [Scenario("native_errors_component_metadata", "regression", metadata, issues=("NE-142", "NE-232"))]
