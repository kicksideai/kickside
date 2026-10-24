"""Component declaration fences retain native causes and boundary classification."""
from harness import Scenario
from module_harness import run_focused_module_test


def fences(ctx):
    run_focused_module_test(ctx, "kickside/component", "declaration_fence_native_test")
    run_focused_module_test(ctx, "kickside/component", "declaration_state_test")


REGISTRY = [Scenario("native_errors_component_declaration_fence", "regression", fences, issues=("NE-139",), parallel=('native-root:kickside/component',))]
