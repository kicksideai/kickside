"""Component result classification retains native failure fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def context_result(ctx):
    run_focused_module_test(ctx, "kickside/component", "context_result_native_test")
    run_focused_module_test(ctx, "kickside/component", "get_access_context_by_meta_test")
    run_focused_module_test(ctx, "kickside/component", "failure_classification_test")


REGISTRY = [Scenario("native_errors_component_context_result", "regression", context_result, issues=("NE-194",), parallel=('native-root:kickside/component',))]
