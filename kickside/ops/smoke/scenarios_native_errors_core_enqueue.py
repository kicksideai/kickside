"""Projection registration requires a durable slot id and retains enqueue failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def enqueue(ctx):
    run_focused_module_test(ctx, "kickside/core", "projection_register_enqueue_test")
    run_focused_module_test(ctx, "kickside/core", "register_projection_api_test")


REGISTRY = [Scenario("native_errors_projection_enqueue", "regression", enqueue, issues=("NE-165",), parallel=('native-root:kickside/core',))]
