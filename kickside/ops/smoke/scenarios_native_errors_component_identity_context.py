"""Execution identity persistence retains native failure fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def identity_context(ctx):
    run_focused_module_test(ctx, "kickside/component", "identity_context_native_test")
    run_focused_module_test(ctx, "kickside/component", "identity_native_test")
    run_focused_module_test(ctx, "kickside/component", 'tsplit_ops_test_set_execution_identity_fence')


REGISTRY = [Scenario("native_errors_component_identity_context", "regression", identity_context, issues=("NE-214",))]
