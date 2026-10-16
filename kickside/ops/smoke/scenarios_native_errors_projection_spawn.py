"""Projection supervision preserves native spawn refusals."""
from harness import Scenario
from module_harness import run_focused_module_test


def spawn(ctx):
    run_focused_module_test(ctx, "kickside/core", "projection_spawn_native_test")
    run_focused_module_test(ctx, "kickside/core", "worker_test")


REGISTRY = [Scenario("native_errors_projection_spawn", "regression", spawn, issues=("NE-124",))]
