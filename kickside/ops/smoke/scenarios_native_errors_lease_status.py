"""Lease status retains native dependencies and rejects invalid read proofs."""
from harness import Scenario
from module_harness import run_focused_module_test


def lease_status(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "lease_status_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "transitions_revocation_test")


REGISTRY = [Scenario("native_errors_lease_status", "regression", lease_status, issues=("NE-162",), parallel=('native-root:kickside/jobs',))]
