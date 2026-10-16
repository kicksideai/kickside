"""Lease boundaries retain native dependency failures and exact ownership proofs."""
from harness import Scenario
from module_harness import run_focused_module_test


def lease(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "lease_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "heartbeat_reclaim_test")


REGISTRY = [Scenario("native_errors_jobs_lease", "regression", lease, issues=("NE-170",))]
