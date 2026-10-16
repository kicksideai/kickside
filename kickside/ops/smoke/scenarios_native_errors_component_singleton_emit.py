"""Singleton events preserve native contract errors and stop before failed emission."""
from harness import Scenario
from module_harness import run_focused_module_test


def singleton_emit(ctx):
    run_focused_module_test(ctx, "kickside/contract", "binding_response_test")
    run_focused_module_test(ctx, "kickside/component", "singleton_emit_native_test")
    run_focused_module_test(ctx, "kickside/component", "emit_singleton_test")
    run_focused_module_test(ctx, "kickside/component", "cleanup_setup_test")


REGISTRY = [Scenario("native_errors_component_singleton_emit", "regression", singleton_emit, issues=("NE-197",))]
