"""Jobs deadline lookup preserves native database failures."""
from harness import Scenario
from module_harness import run_focused_module_test


def deadline(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "deadline_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "worker_pool_claim_test")
    run_focused_module_test(ctx, "kickside/jobs", "worker_pool_version_test")


REGISTRY = [Scenario("native_errors_jobs_deadline", "regression", deadline, issues=("NE-146",))]
