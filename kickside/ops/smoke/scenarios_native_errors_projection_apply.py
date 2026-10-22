"""Projection apply preserves dependency and cleanup error fields."""
from harness import Scenario
from module_harness import run_focused_module_test


def apply_fields(ctx):
    run_focused_module_test(ctx, "kickside/core", "projection_apply_native_test")
    run_focused_module_test(ctx, "kickside/core", "projection_apply_native_test_outcomes")
    run_focused_module_test(ctx, "kickside/core", "slot_test")
    run_focused_module_test(ctx, "kickside/core", "slot_failure_test")
    run_focused_module_test(ctx, "kickside/core", "failure_removal_test")


REGISTRY = [Scenario("native_errors_projection_apply", "regression", apply_fields, issues=("NE-130", "PROJECTION-FAILURE-REMOVAL-LOCK-ORDER"))]
