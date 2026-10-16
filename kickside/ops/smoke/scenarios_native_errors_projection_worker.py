"""Projection worker boundaries preserve native dependency failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def worker_fields(ctx):
    run_focused_module_test(ctx, "kickside/contract", "annotated_error_test")
    run_focused_module_test(ctx, "kickside/contract", "secondary_error_test")
    run_focused_module_test(ctx, "kickside/core", "projection_worker_native_test")
    run_focused_module_test(ctx, "kickside/core", "projection_worker_boundary_test")
    run_focused_module_test(ctx, "kickside/core", "worker_test")
    run_focused_module_test(ctx, "kickside/core", "slot_failure_test")


REGISTRY = [Scenario("native_errors_projection_worker_fields", "regression", worker_fields, issues=("NE-121",))]
