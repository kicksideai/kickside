"""Worker persistence refuses with native causes before healthy child reporting."""
from harness import Scenario
from module_harness import run_focused_module_test


def outcomes(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "worker_outcomes_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "claim_dispatch_finalize_test")
    run_focused_module_test(ctx, "kickside/jobs", "lease_stop_native_test")


REGISTRY = [Scenario("native_errors_jobs_worker_outcomes", "regression", outcomes, issues=("NE-281",))]
