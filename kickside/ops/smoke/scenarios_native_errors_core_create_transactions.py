"""Thread creation preserves native transaction failures and rollback causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def transactions(ctx):
    run_focused_module_test(ctx, "kickside/core", "create_transactions_test")
    run_focused_module_test(ctx, "kickside/core", "create_transactions_retry_test")
    run_focused_module_test(ctx, "kickside/core", "contract_test")


REGISTRY = [Scenario("native_errors_core_create_transactions", "regression", transactions, issues=("NE-248",))]
