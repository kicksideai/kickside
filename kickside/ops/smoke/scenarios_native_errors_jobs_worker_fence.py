"""Durable termination fencing retains native causes and response evidence."""
from harness import Scenario
from module_harness import run_focused_module_test


def fence(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "worker_fence_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "termination_recovery_test")
    run_focused_module_test(ctx, "kickside/jobs", "child_termination_test")


REGISTRY = [Scenario("native_errors_jobs_worker_fence", "regression", fence, issues=("NE-181",), parallel=('native-root:kickside/jobs',))]
