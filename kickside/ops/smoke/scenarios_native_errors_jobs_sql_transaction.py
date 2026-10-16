"""Native SQL transaction proof and uncertain completion policy."""
from harness import Scenario
from module_harness import run_focused_module_test


def completion(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "sql_transaction_boundary_test")
    run_focused_module_test(ctx, "kickside/jobs", "transaction_native_test")


REGISTRY = [Scenario("native_errors_jobs_sql_transaction", "regression", completion, issues=("NE-263",))]
