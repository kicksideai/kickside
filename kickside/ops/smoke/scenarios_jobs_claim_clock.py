"""Jobs diagnostics judge due work at the claim candidate cutoff."""
from harness import Scenario
from module_harness import run_focused_module_test


def claim_clock(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "worker_pool_claim_test")


REGISTRY = [Scenario("jobs_claim_diagnostic_clock", "regression", claim_clock,
                     issues=("JOBS-CLAIM-DIAGNOSTIC-CLOCK",))]
