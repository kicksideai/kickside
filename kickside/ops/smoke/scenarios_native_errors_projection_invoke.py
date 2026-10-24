"""Projection invocation preserves dependency and cleanup causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def invoke_fields(ctx):
    run_focused_module_test(ctx, "kickside/core", "projection_invoke_native_test")
    run_focused_module_test(ctx, "kickside/core", "slot_failure_test")
    run_focused_module_test(ctx, "kickside/core", "slot_test")


REGISTRY = [Scenario("native_errors_projection_invoke", "regression", invoke_fields, issues=("NE-128",), parallel=('native-root:kickside/core',))]
