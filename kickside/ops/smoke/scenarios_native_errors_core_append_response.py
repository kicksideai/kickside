"""Append contracts require complete native outcome proof."""
from harness import Scenario
from module_harness import run_focused_module_test


def outcomes(ctx):
    run_focused_module_test(ctx, "kickside/core", "append_response_test")
    run_focused_module_test(ctx, "kickside/core", "contract_test")


REGISTRY = [Scenario("native_errors_core_append_response", "regression", outcomes, issues=("NE-260",))]
