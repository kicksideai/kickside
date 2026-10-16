"""Shared thread-contract database errors retain native fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def database(ctx):
    run_focused_module_test(ctx, "kickside/core", "thread_database_native_test")
    run_focused_module_test(ctx, "kickside/core", "contract_cursor_test")


REGISTRY = [Scenario("native_errors_core_thread_database", "regression", database, issues=("NE-90",))]
