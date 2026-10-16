"""Projection invocation bounds runtime retries and preserves builder refusals."""
from harness import Scenario
from module_harness import run_focused_module_test


def invocation(ctx):
    for pattern in ("projection_worker_retry_test", "projection_worker_executor_test",
                    "projection_worker_native_test", "projection_worker_boundary_test",
                    "worker_test", "registration_identity_test"):
        run_focused_module_test(ctx, "kickside/core", pattern)


REGISTRY = [Scenario("native_errors_projection_worker_retry", "regression", invocation, issues=("NE-122", "NE-123"))]
