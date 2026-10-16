"""Projection readers preserve native SQL and dialect failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def reader(ctx):
    run_focused_module_test(ctx, "kickside/core", "projection_reader_native_test")
    run_focused_module_test(ctx, "kickside/core", "reader_test")


REGISTRY = [Scenario("native_errors_core_projection_reader", "regression", reader, issues=("NE-114",))]
