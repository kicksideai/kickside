"""Component readers retain native operation and database release failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def reader_causes(ctx):
    run_focused_module_test(ctx, "kickside/component", "reader_native_test")
    run_focused_module_test(ctx, "kickside/component", "component_reader_test")
    run_focused_module_test(ctx, "kickside/component", "failure_classification_test")


REGISTRY = [Scenario("native_errors_component_reader_causes", "regression", reader_causes, issues=("NE-218",))]
