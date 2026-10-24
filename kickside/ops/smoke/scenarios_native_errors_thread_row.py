"""Thread row conflicts use durable proofs and retain native dependency fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def thread_row(ctx):
    run_focused_module_test(ctx, "kickside/core", "thread_row_native_test")
    run_focused_module_test(ctx, "kickside/core", "contract_lifecycle_test")


REGISTRY = [Scenario("native_errors_thread_row", "regression", thread_row, issues=("NE-127",), parallel=('native-root:kickside/core',))]
