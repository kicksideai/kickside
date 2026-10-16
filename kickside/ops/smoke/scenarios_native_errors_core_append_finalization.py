"""Append contracts preserve cleanup causes and stop post-commit replay."""
from harness import Scenario
from module_harness import run_focused_module_test


def outcomes(ctx):
    run_focused_module_test(ctx, "kickside/core", "append_finalization_test")
    run_focused_module_test(ctx, "kickside/core", "append_finalization_retry_test")
    run_focused_module_test(ctx, "kickside/core", "contract_test")


REGISTRY = [Scenario("native_errors_core_append_finalization", "regression", outcomes, issues=("NE-259",))]
