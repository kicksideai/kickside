"""Component contract contexts stop at native binding failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def context_binding(ctx):
    run_focused_module_test(ctx, "kickside/component", "context_binding_native_test")
    run_focused_module_test(ctx, "kickside/component", "service_open_native_test")
    run_focused_module_test(ctx, "kickside/component", "context_revision_test")


REGISTRY = [Scenario("native_errors_component_context_binding", "regression", context_binding, issues=("NE-198",))]
