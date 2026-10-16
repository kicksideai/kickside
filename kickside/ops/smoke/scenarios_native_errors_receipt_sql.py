"""Write receipt SQL and rollback failures retain native dependency fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def receipt_sql(ctx):
    run_focused_module_test(ctx, "kickside/core", "receipt_sql_native_test")
    run_focused_module_test(ctx, "kickside/core", "write_receipt_test")


REGISTRY = [Scenario("native_errors_receipt_sql", "regression", receipt_sql, issues=("NE-148",))]
