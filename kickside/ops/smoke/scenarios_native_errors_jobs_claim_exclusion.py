"""Claim concurrency uses atomic SQL eligibility and preserves unrelated errors."""
from harness import Scenario
from module_harness import run_focused_module_test


def exclusion(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "claim_exclusion_test")
    run_focused_module_test(ctx, "kickside/jobs", "concurrency_claim_test")


REGISTRY = [Scenario("native_errors_jobs_claim_exclusion", "regression", exclusion, issues=("NE-177",))]
