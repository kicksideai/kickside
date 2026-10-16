"""Projection registration preserves native dependency failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def registration(ctx):
    run_focused_module_test(ctx, "kickside/core", "projection_register_native_test")
    run_focused_module_test(ctx, "kickside/core", "register_projection_api_test")




def rollback(ctx):
    run_focused_module_test(ctx, "kickside/core", "projection_register_rollback_test")
    run_focused_module_test(ctx, "kickside/core", "projection_register_native_test")
    run_focused_module_test(ctx, "kickside/core", "register_projection_api_test")


REGISTRY = [
    Scenario("native_errors_core_registration", "regression", registration, issues=("NE-119",)),
    Scenario("native_errors_core_registration_rollback", "regression", rollback, issues=("NE-120",)),
]
