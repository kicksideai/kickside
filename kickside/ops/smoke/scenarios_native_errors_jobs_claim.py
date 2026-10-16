"""Claim dependency failures retain native policy and rollback causes."""
from harness import Scenario
from module_harness import run_focused_module_test


def claim(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "claim_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "claim_sequence_test")


REGISTRY = [Scenario("native_errors_jobs_claim", "regression", claim, issues=("NE-176",))]
