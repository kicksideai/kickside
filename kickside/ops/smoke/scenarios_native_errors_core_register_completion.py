"""Registration completion preserves native failures without durable replay."""
from harness import Scenario
from module_harness import run_focused_module_test


def completion(ctx):
    run_focused_module_test(ctx, "kickside/core", "register_completion_test")
    run_focused_module_test(ctx, "kickside/core", "register_completion_retry_test")
    run_focused_module_test(ctx, "kickside/core", "projection_register_native_test")
    run_focused_module_test(ctx, "kickside/core", "projection_register_rollback_test")


REGISTRY = [Scenario("native_errors_core_register_completion", "regression", completion, issues=("NE-267",))]
