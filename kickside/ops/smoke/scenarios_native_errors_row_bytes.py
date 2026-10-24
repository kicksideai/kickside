"""Retained row byte checks preserve native dependencies and read proofs."""
from harness import Scenario
from module_harness import run_focused_module_test


def row_bytes(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "row_bytes_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "row_limit_test")


REGISTRY = [Scenario("native_errors_row_bytes", "regression", row_bytes, issues=("NE-163",), parallel=('native-root:kickside/jobs',))]
