"""Shared SQL dialect proof preserves native dependency fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def proof(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "sql_dialect_boundary_test")
    run_focused_module_test(ctx, "kickside/jobs", "sql_transaction_boundary_test")


REGISTRY = [Scenario("native_errors_jobs_sql_dialect", "regression", proof, issues=("NE-266",), parallel=('native-root:kickside/jobs',))]
