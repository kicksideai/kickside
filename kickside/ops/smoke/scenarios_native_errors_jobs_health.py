"""Jobs health preserves native SQL policy and requires aggregate response proofs."""
from harness import Scenario
from module_harness import run_focused_module_test


def health(ctx):
    run_focused_module_test(ctx, "kickside/jobs", "health_native_test")
    run_focused_module_test(ctx, "kickside/jobs", "execute_job_routing_test")


REGISTRY = [Scenario("native_errors_jobs_health", "regression", health, issues=("NE-169",), parallel=('native-root:kickside/jobs',))]
