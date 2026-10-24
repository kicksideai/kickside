"""Wake operations refuse malformed successful dependency responses."""
from harness import Scenario
from module_harness import run_focused_module_test


def wake_proof(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "wake_proof_test")
    run_focused_module_test(ctx, "kickside/jobs", "wake_demand_test")


REGISTRY = [Scenario("native_errors_jobs_wake_proof", "regression", wake_proof, issues=("NE-175",), parallel=('native-root:kickside/jobs',))]
