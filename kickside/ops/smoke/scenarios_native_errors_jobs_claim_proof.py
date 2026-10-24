"""Claim operations refuse malformed successful dependency responses."""
from harness import Scenario
from module_harness import run_focused_module_test


def proof(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "claim_proof_test")
    run_focused_module_test(ctx, "kickside/jobs", "claim_sequence_test")


REGISTRY = [Scenario("native_errors_jobs_claim_proof", "regression", proof, issues=("NE-178",), parallel=('native-root:kickside/jobs',))]
