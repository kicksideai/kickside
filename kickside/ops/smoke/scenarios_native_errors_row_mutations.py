"""Cancellation candidate reads retain native policy and details."""
from harness import Scenario
from module_harness import run_focused_module_test


def row_mutations(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "row_mutations_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "live_cancellation_test")


REGISTRY = [Scenario("native_errors_row_mutations", "regression", row_mutations, issues=("NE-158",), parallel=('native-root:kickside/jobs',))]
