"""Portable JSONL decoding and failed handle cleanup retain native causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def portable_io(ctx):
    run_focused_module_test(ctx, "kickside/component", "portable_io_native_test")
    run_focused_module_test(ctx, "kickside/component", "base_portable_test")


REGISTRY = [Scenario("native_errors_portable_io", "regression", portable_io, issues=("NE-154",))]
