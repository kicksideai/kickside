"""Durable thread teardown fences preserve native failures and bounded work."""
from harness import Scenario
from module_harness import run_focused_module_test


def teardown_fence(ctx):
    run_focused_module_test(ctx, "kickside/core", "teardown_fence_native_test")
    run_focused_module_test(ctx, "kickside/core", "bounded_delete_test")
    run_focused_module_test(ctx, "kickside/core", "component_delete_fence_test")
    run_focused_module_test(ctx, "kickside/core", "lifecycle_test")


REGISTRY = [Scenario("native_errors_thread_teardown_fence", "regression", teardown_fence, issues=("NE-135",))]
