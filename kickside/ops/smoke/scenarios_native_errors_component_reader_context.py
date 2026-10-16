"""Component readers report corrupt stored private context."""
from harness import Scenario
from module_harness import run_focused_module_test


def reader_context(ctx):
    run_focused_module_test(ctx, "kickside/component", "reader_context_native_test")
    run_focused_module_test(ctx, "kickside/component", "component_reader_test")


REGISTRY = [Scenario("native_errors_component_reader_context", "regression", reader_context, issues=("NE-219",))]
