"""Projection transactions preserve native failures without replaying durable effects."""
from harness import Scenario
from module_harness import run_focused_module_test


def completion(ctx):
    run_focused_module_test(ctx, "kickside/core", "projection_transaction_test")
    run_focused_module_test(ctx, "kickside/core", "projection_transaction_retry_test")
    run_focused_module_test(ctx, "kickside/core", "update_outcomes_test")
    run_focused_module_test(ctx, "kickside/core", "append_native_test")


REGISTRY = [Scenario("native_errors_core_projection_transaction", "regression", completion, issues=("NE-264",))]
