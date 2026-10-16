"""Thread update preserves native transaction and post-commit outcome fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def outcomes(ctx):
    run_focused_module_test(ctx, "kickside/core", "update_outcomes_test")
    run_focused_module_test(ctx, "kickside/core", "update_outcomes_retry_test")
    run_focused_module_test(ctx, "kickside/core", "create_transactions_test")
    run_focused_module_test(ctx, "kickside/core", "contract_test")


REGISTRY = [Scenario("native_errors_core_update_outcomes", "regression", outcomes, issues=("NE-257",))]
