"""Validated dispatch deadlines reach heartbeat startup without caller metadata."""
from harness import Scenario
from module_harness import run_focused_module_test


def deadline(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "lease_deadline_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "lease_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "builtin_test")


REGISTRY = [Scenario("native_errors_jobs_lease_deadline", "regression", deadline, issues=("NE-283",), parallel=('native-root:kickside/jobs',))]
