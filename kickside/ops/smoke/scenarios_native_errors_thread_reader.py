"""Thread read boundaries preserve native causes and refuse missing proofs."""
from harness import Scenario
from module_harness import run_focused_module_test


def reader_fields(ctx):
    run_focused_module_test(ctx, "kickside/core", "thread_reader_native_test")
    run_focused_module_test(ctx, "kickside/core", "reader_test")
    run_focused_module_test(ctx, "kickside/core", "subject_test")


REGISTRY = [Scenario("native_errors_thread_reader", "regression", reader_fields, issues=("NE-129",), parallel=('native-root:kickside/core',))]
